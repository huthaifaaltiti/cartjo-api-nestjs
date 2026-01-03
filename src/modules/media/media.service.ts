import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { getMessage } from 'src/common/utils/translator';
import { Locale } from 'src/types/Locale';
import { User, UserDocument } from '../../schemas/user.schema';
import { getAppHostName } from 'src/common/utils/getAppHostName';

@Injectable()
export class MediaService {
  private mediaDbClient: MongoClient;
  private gridFSBucket: GridFSBucket;
  private metadataCollection: any;
  private accessLogsCollection: any;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.hostName = getAppHostName();
    this.initializeMediaDatabase();
  }

  private readonly hostName: string;

  private async initializeMediaDatabase() {
    try {
      // Connect to the media database
      const mediaDbUri =
        process.env.MONGODB_MEDIA_URI || process.env.MONGODB_URI; // Fallback to main DB URI if not specified
      this.mediaDbClient = new MongoClient(mediaDbUri);
      await this.mediaDbClient.connect();

      const mediaDb = this.mediaDbClient.db('test_media');

      // Initialize GridFS bucket for file storage
      this.gridFSBucket = new GridFSBucket(mediaDb, { bucketName: 'files' });

      // Initialize collections
      this.metadataCollection = mediaDb.collection('metadata');
      this.accessLogsCollection = mediaDb.collection('access_logs');

      console.log('Media database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize media database:', error);
      throw error;
    }
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
    mediaId?: string;
  }> {
    const { userId } = requestingUser;
    const ipAddress =
      req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new ForbiddenException(getMessage('authorization_noAccess', lang));
    }

    if (!file) {
      return {
        isSuccess: false,
        message: getMessage('media_noMediaFound', lang),
        fileUrl: null,
      };
    }

    try {
      // Determine file category
      let fileCategory = 'others';
      if (file.mimetype.startsWith('image/')) {
        fileCategory = 'image';
      } else if (file.mimetype.startsWith('audio/')) {
        fileCategory = 'audio';
      } else if (file.mimetype.startsWith('video/')) {
        fileCategory = 'video';
      } else if (
        file.mimetype.startsWith('application/') &&
        file.mimetype.includes('excel')
      ) {
        fileCategory = 'spreadsheet';
      } else if (file.mimetype.startsWith('application/')) {
        fileCategory = 'document';
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const sanitizedBaseName = file.originalname
        .replace(`.${fileExtension}`, '')
        .trim()
        .replace(/\s+/g, '-');
      const fileName = `${key}-${Date.now()}-${sanitizedBaseName}.${fileExtension}`;

      // Create readable stream from file buffer
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);

      // Upload file to GridFS
      const uploadStream = this.gridFSBucket.openUploadStream(fileName, {
        metadata: {
          originalName: file.originalname,
          contentType: file.mimetype,
          category: fileCategory,
          uploadedBy: new ObjectId(userId),
          uploadKey: key,
          uploadedAt: new Date(),
        },
      });

      // Store the file in GridFS and get the file ID
      const fileId = await new Promise<ObjectId>((resolve, reject) => {
        fileStream
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve(uploadStream.id as ObjectId);
          });
      });

      // Generate public URL (you'll need to create an endpoint to serve files)
      const fileUrl = `${this.hostName}/api/v1/media/file/${fileId.toString()}`;

      // Save metadata to metadata collection
      const metadataRecord = {
        fileId: fileId,
        originalName: file.originalname,
        fileName: fileName,
        fileUrl: fileUrl,
        mimetype: file.mimetype,
        size: file.size,
        category: fileCategory,
        uploadedBy: new ObjectId(userId),
        uploadKey: key,
        tags: [],
        description: '',
        uploadedAt: new Date(),
        isActive: true,
        // Reference to your main database entities if needed
        relatedEntity: null, // You can set this when linking to products, locations, etc.
      };

      await this.metadataCollection.insertOne(metadataRecord);

      // Log access (optional)
      await this.logAccess({
        fileId: fileId,
        userId: new ObjectId(String(userId)),
        action: 'upload',
        timestamp: new Date(),
        ipAddress, // You can pass this from the request
      });

      return {
        isSuccess: true,
        message: getMessage('media_mediaUploadedSuccessfully', lang),
        fileUrl,
        mediaId: fileId.toString(),
      };
    } catch (error) {
      console.error('Error in handleFileUpload:', error);

      return {
        isSuccess: false,
        message: getMessage('media_mediaUploadFailed', lang),
        fileUrl: null,
      };
    }
  }

  async getFileById(fileId: string): Promise<{
    stream: NodeJS.ReadableStream;
    metadata: any;
  }> {
    try {
      const _id = new ObjectId(fileId);
      const metadata = await this.gridFSBucket.find({ _id }).next();

      if (!metadata) {
        return { stream: null, metadata: null };
      }

      const stream = this.gridFSBucket.openDownloadStream(_id);

      return { stream, metadata };
    } catch (error) {
      console.error('Error retrieving file:', error);
      throw new Error('File retrieval failed');
    }
  }

  // Log access to files
  private async logAccess(logData: {
    fileId: ObjectId;
    userId: ObjectId;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.accessLogsCollection.insertOne(logData);
    } catch (error) {
      console.error('Error logging access:', error);
      // Don't throw error for logging failures
    }
  }
}
