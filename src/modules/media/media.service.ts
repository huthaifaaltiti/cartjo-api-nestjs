import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Locale } from 'src/types/Locale';
import { getMessage } from 'src/common/utils/translator';
import { User, UserDocument } from '../../schemas/user.schema';
import * as mime from 'mime-types';
import { getClientIp } from 'src/common/utils/getClientIp';
import { ApiPaths } from 'src/common/constants/api-paths';
import { MediaActions } from 'src/enums/mediaActions.enum';
import { ObjectId } from 'mongodb';
import { MediaPreview } from 'src/schemas/common.schema';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import { Modules } from 'src/enums/appModules.enum';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private readonly logger = new Logger(MediaService.name);
  private bucketName: string;
  private region: string;
  private metadataCollection: any;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
  ) {
    this.region = this.configService.get<string>('AWS_S3_REGION');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    // Initialize media collections
    this.metadataCollection = this.connection.collection('mediaMetadata');
  }

  async mediaUploader(
    file: Express.Multer.File,
    requestingUser: any,
    lang: Locale = 'en',
    key: string,
    req?: any,
    isHardReplaced?: boolean,
    isSoftReplaced?: boolean,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    fileUrl: string;
    mediaId: string;
  }> {
    const { userId } = requestingUser;

    const ipAddress = getClientIp(req);

    try {
      // 2. Prepare S3 Key
      const fileExtension = mime.extension(file.mimetype) || 'bin';
      const sanitizedBaseName = file.originalname
        .split('.')[0]
        .replace(/\s+/g, '-');
      const s3Key = `${key}/${Date.now()}-${sanitizedBaseName}.${fileExtension}`;

      // 3. Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;

      // 4. Save Metadata to main MongoDB
      const metadataRecord = this.createMetadataRecord(
        file,
        s3Key,
        fileUrl,
        userId,
        key,
        ipAddress,
        isHardReplaced,
        isSoftReplaced,
      );
      const result = await this.metadataCollection.insertOne(metadataRecord);
      const mediaId = result.insertedId.toString();

      return {
        isSuccess: true,
        message: getMessage('media_mediaUploadedSuccessfully', lang),
        fileUrl,
        mediaId,
      };
    } catch (error) {
      this.logger.error('Upload Process Failed', error);
      return {
        isSuccess: false,
        message: getMessage('media_mediaUploadFailed', lang),
        fileUrl: null,
        mediaId: null,
      };
    }
  }

  private getFileCategory(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel'))
      return 'spreadsheet';
    if (mimetype.startsWith('application/')) return 'document';
    return 'others';
  }

  private createMetadataRecord(
    file: Express.Multer.File,
    s3Key: string,
    fileUrl: string,
    userId: string,
    uploadKey: string,
    ipAddress: string,
    isHardReplaced: boolean = false,
    isSoftReplaced: boolean = false,
  ) {
    return {
      originalName: file.originalname,
      fileName: s3Key,
      fileUrl: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
      category: this.getFileCategory(file.mimetype),
      uploadedBy: userId,
      uploadIp: ipAddress,
      uploadKey: uploadKey,
      tags: [],
      mediaAction: MediaActions.UPLOADED,
      description: '',
      createdAt: new Date(),
      isUpdated: isHardReplaced || isSoftReplaced || false,
      updatedAt: isHardReplaced || isSoftReplaced ? new Date() : null,
      uploadedAt: new Date(),
      isActive: true,
      isHardReplaced,
      isSoftReplaced,
      isDeleted: false,
      deletedAt: null,
      deactivateAt: null,
      relatedEntity: null,
      version: 1,
      urlRootVersion: ApiPaths.Media.Root,
    };
  }

  async getMediaMetadataById(mediaId: string) {
    try {
      return await this.metadataCollection.findOne({
        _id: new ObjectId(mediaId),
      });
    } catch (e) {
      return null;
    }
  }

  async softDeleteFile(mediaId: string): Promise<boolean> {
    try {
      const metadata = await this.getMediaMetadataById(mediaId);
      if (!metadata) return false;

      // 1. Delete from S3 using the stored fileName (which is the s3Key)
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: metadata.fileName,
        }),
      );

      // 2. Mark as deleted in MongoDB (Soft delete)
      await this.metadataCollection.updateOne(
        { _id: new ObjectId(mediaId) },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false,
            mediaAction: MediaActions.DELETED,
          },
        },
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete media ${mediaId}`, error);
      return false;
    }
  }

  async hardDeleteFile(mediaId: string): Promise<boolean> {
    try {
      const metadata = await this.getMediaMetadataById(mediaId);
      if (!metadata) return false;

      /*
         {
          r1: {
               DeleteMarker: true,
              VersionId: '_sHAO0VdBg_nQ0FiaXfPaMSRf88RcsGC',
              '$metadata': {
              httpStatusCode: 204,
              requestId: '9VS8TS5KAKKB4D73',
              extendedRequestId:         'dbCDiHEu9fPtzkQqlDufklb9A4lG7tsitQnNGsGnKhlpRFfDgecBJoWmFuMAtDDaR5B6LiyI6XsB83yZHlFVDG93b4sSwtyN',
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
          }
        }
        { result: { acknowledged: true, deletedCount: 1 } }
      */

      // 1. Delete from S3 using the stored fileName (which is the s3Key)
      const r1 = await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: metadata.fileName,
        }),
      );

      console.log({ r1 });

      // 2. Permanently remove from MongoDB
      const result = await this.metadataCollection.deleteOne({
        _id: new ObjectId(mediaId),
      });

      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Failed to delete media ${mediaId}`, error);
      return false;
    }
  }

  async hardDeleteAndUpload({
    file,
    user,
    reqMsg,
    maxSize,
    allowedTypes,
    lang,
    key,
    req,
    existingMediaId,
  }: {
    file: Express.Multer.File;
    user: any;
    reqMsg: string;
    maxSize: number;
    allowedTypes: string[];
    lang: Locale;
    key: Modules;
    existingMediaId?: string | ObjectId;
    req?: any;
  }): Promise<MediaPreview | undefined> {
    try {
      if (!existingMediaId) return undefined;

      const mediaIdStr = existingMediaId.toString();
      await this.hardDeleteFile(mediaIdStr);

      const mediaProcessing = await this.mediaProcessor({
        file,
        user,
        reqMsg,
        maxSize,
        allowedTypes,
        lang,
        key,
        req,
        isHardReplaced: true,
      });

      return mediaProcessing;
    } catch (error) {
      this.logger.error('HardDeleteAndUpload Process Failed', error);

      // If it's a known NestJS Exception (like BadRequest from validators), re-throw it
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      return undefined;
    }
  }

  async mediaProcessor({
    file,
    user,
    reqMsg,
    maxSize,
    allowedTypes,
    lang,
    key,
    req,
    isHardReplaced,
    isSoftReplaced,
  }: {
    file: Express.Multer.File;
    user: any;
    reqMsg: string;
    maxSize: number;
    allowedTypes: string[];
    lang: Locale;
    key: Modules;
    req?: any;
    isHardReplaced?: boolean;
    isSoftReplaced?: boolean;
  }): Promise<MediaPreview | undefined> {
    // 1. Auth check
    const requestingUser = await this.userModel.findById(user?.userId);
    if (!requestingUser) {
      throw new ForbiddenException(getMessage('authorization_noAccess', lang));
    }

    // Content check
    if (!file) return undefined;
    if (!file || Object.keys(file).length === 0) {
      throw new ForbiddenException(getMessage(reqMsg, lang));
    }

    fileSizeValidator(file, maxSize, lang);
    fileTypeValidator(file, allowedTypes, lang);

    const result = await this.mediaUploader(
      file,
      user,
      lang,
      key,
      req,
      isHardReplaced,
      isSoftReplaced,
    );

    if (!result?.isSuccess) {
      throw new BadRequestException(
        getMessage('categories_categoryImageUploadFailed', lang),
      );
    }

    return { id: result.mediaId, url: result.fileUrl };
  }

  async deleteByUrl(fileUrl: string): Promise<boolean> {
    try {
      const metadata = await this.metadataCollection.findOne({
        fileUrl: fileUrl,
      });

      if (!metadata) {
        this.logger.warn(
          `Attempted to delete non-existent media URL: ${fileUrl}`,
        );
        return false;
      }

      return await this.hardDeleteFile(metadata._id.toString());
    } catch (error) {
      this.logger.error(`Failed to delete media by URL: ${fileUrl}`, error);
      return false;
    }
  }
}
