import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Locale } from 'src/types/Locale';
import { getMessage } from 'src/common/utils/translator';
import { User, UserDocument } from '../../schemas/user.schema';
import * as mime from 'mime-types';
import { getClientIp } from 'src/common/utils/getClientIp';
import { ApiPaths } from 'src/common/constants/api-paths';
import { MediaActions } from 'src/enums/mediaActions.enum';

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

  async handleFileUpload(
    file: Express.Multer.File,
    requestingUser: any,
    lang: Locale = 'en',
    key: string,
    req?: any,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    fileUrl: string;
    mediaId: string;
  }> {
    const { userId } = requestingUser;

    const ipAddress = getClientIp(req);

    // 1. Auth check
    const user = await this.userModel.findById(userId);
    if (!user)
      throw new ForbiddenException(getMessage('authorization_noAccess', lang));
    if (!file)
      return {
        isSuccess: false,
        message: getMessage('media_noMediaFound', lang),
        fileUrl: null,
        mediaId: null,
      };

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
      uploadedAt: new Date(),
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deactivateAt: null,
      relatedEntity: null,
      version: 1,
      urlRootVersion: ApiPaths.Media.Root,
    };
  }
}
