import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

import { getMessage } from 'src/common/utils/translator';

import { Locale } from 'src/types/Locale';
import { User, UserDocument } from '../../schemas/user.schema';
<<<<<<< HEAD
import { Media, MediaDocument } from 'src/schemas/media.schema';
=======
// import { Media, MediaDocument } from 'src/schemas/media.schema';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Injectable()
export class MediaService {
  private mediaDbClient: MongoClient;
  private gridFSBucket: GridFSBucket;
  private metadataCollection: any;
  private accessLogsCollection: any;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
<<<<<<< HEAD
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
=======
    // @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  ) {
    this.hostName = process.env.HOST_NAME;
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
  ): Promise<{
    isSuccess: boolean;
    message: string;
    fileUrl: string;
    mediaId?: string;
  }> {
    const { userId } = requestingUser;

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

    console.log({file})

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

      console.log({fileName})

      // Create readable stream from file buffer
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);

      console.log({fileStream})

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

      console.log({uploadStream})

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

      console.log({fileUrl})

      // Save metadata to metadata collection
<<<<<<< HEAD
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

      const savedMetadata =
        await this.metadataCollection.insertOne(metadataRecord);
=======
      // const metadataRecord = {
      //   fileId: fileId,
      //   originalName: file.originalname,
      //   fileName: fileName,
      //   fileUrl: fileUrl,
      //   mimetype: file.mimetype,
      //   size: file.size,
      //   category: fileCategory,
      //   uploadedBy: new ObjectId(userId),
      //   uploadKey: key,
      //   tags: [],
      //   description: '',
      //   uploadedAt: new Date(),
      //   isActive: true,
      //   // Reference to your main database entities if needed
      //   relatedEntity: null, // You can set this when linking to products, locations, etc.
      // };

      // const savedMetadata =
      //   await this.metadataCollection.insertOne(metadataRecord);
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

      // Log access (optional)
      await this.logAccess({
        fileId: fileId,
        userId: new ObjectId(userId),
        action: 'upload',
        timestamp: new Date(),
        ipAddress: null, // You can pass this from the request
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

  // New method to serve files from GridFS
  async getFileById(fileId: string): Promise<{
    stream: any;
    metadata: any;
  }> {
    try {
      const objectId = new ObjectId(fileId);

      // Get file metadata
      const fileInfo = await this.gridFSBucket.find({ _id: objectId }).next();

      if (!fileInfo) {
        throw new Error('File not found');
      }

      // Create download stream
      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);

      return {
        stream: downloadStream,
        metadata: fileInfo,
      };
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw error;
    }
  }

  // Get files by category from metadata collection
  async getFilesByCategory(
    category: string,
    userId?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<any[]> {
    try {
      const query: any = { category, isActive: true };

      if (userId) {
        query.uploadedBy = new ObjectId(userId);
      }

      return await this.metadataCollection
        .find(query)
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();
    } catch (error) {
      console.error('Error fetching files by category:', error);
      throw error;
    }
  }

  // Get files by upload key
  async getFilesByUploadKey(
    uploadKey: string,
    userId?: string,
  ): Promise<any[]> {
    try {
      const query: any = { uploadKey, isActive: true };

      if (userId) {
        query.uploadedBy = new ObjectId(userId);
      }

      return await this.metadataCollection
        .find(query)
        .sort({ uploadedAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching files by upload key:', error);
      throw error;
    }
  }

  // Update file metadata
  async updateFileMetadata(
    fileId: string,
    updateData: {
      tags?: string[];
      description?: string;
      category?: string;
      relatedEntity?: {
        collection: string;
        id: string;
      };
    },
  ): Promise<any> {
    try {
      const objectId = new ObjectId(fileId);

      const updateFields: any = {
        ...updateData,
        updatedAt: new Date(),
      };

      if (updateData.relatedEntity) {
        updateFields.relatedEntity = {
          collection: updateData.relatedEntity.collection,
          id: new ObjectId(updateData.relatedEntity.id),
        };
      }

      return await this.metadataCollection.findOneAndUpdate(
        { fileId: objectId },
        { $set: updateFields },
        { returnDocument: 'after' },
      );
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  // Delete file (soft delete in metadata, physical delete from GridFS)
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(fileId);

      // Check metadata record
      const metadataRecord = await this.metadataCollection.findOne({
        fileId: objectId,
      });

      if (!metadataRecord) {
        return false;
      }

      // Check if user has permission to delete
      if (metadataRecord.uploadedBy.toString() !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this file',
        );
      }

      // Mark as inactive in metadata (soft delete)
      await this.metadataCollection.updateOne(
        { fileId: objectId },
        { $set: { isActive: false, deletedAt: new Date() } },
      );

      // Physically delete from GridFS
      await this.gridFSBucket.delete(objectId);

      // Log access
      await this.logAccess({
        fileId: objectId,
        userId: new ObjectId(userId),
        action: 'delete',
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
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

  // Get file statistics
  async getFileStatistics(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    categoryCounts: Record<string, number>;
  }> {
    try {
      const query: any = { isActive: true };

      if (userId) {
        query.uploadedBy = new ObjectId(userId);
      }

      const files = await this.metadataCollection.find(query).toArray();

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        categoryCounts: files.reduce(
          (counts, file) => {
            counts[file.category] = (counts[file.category] || 0) + 1;
            return counts;
          },
          {} as Record<string, number>,
        ),
      };

      return stats;
    } catch (error) {
      console.error('Error getting file statistics:', error);
      throw error;
    }
  }

  // Cleanup method for when service is destroyed
  async onModuleDestroy() {
    if (this.mediaDbClient) {
      await this.mediaDbClient.close();
    }
  }
}
