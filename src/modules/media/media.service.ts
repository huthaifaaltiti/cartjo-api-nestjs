import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

import { getMessage } from 'src/common/utils/translator';

import { Locale } from 'src/types/Locale';
import { User, UserDocument } from '../../schemas/user.schema';
import { Media, MediaDocument } from 'src/schemas/media.schema';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {
    this.hostName = process.env.HOST_NAME;
  }

  private readonly hostName: string;

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

    try {
      // Determine upload path based on file type
      let uploadPath = `./uploads/${key}`;
      let relativePath = `uploads/${key}`;
      let fileCategory = 'others';

      if (file.mimetype.startsWith('image/')) {
        uploadPath = `./uploads/${key}/image`;
        relativePath = `uploads/${key}/image`;
        fileCategory = 'image';
      } else if (file.mimetype.startsWith('audio/')) {
        uploadPath = `./uploads/${key}/audio`;
        relativePath = `uploads/${key}/audio`;
        fileCategory = 'audio';
      } else if (file.mimetype.startsWith('video/')) {
        uploadPath = `./uploads/${key}/video`;
        relativePath = `uploads/${key}/video`;
        fileCategory = 'video';
      } else if (
        file.mimetype.startsWith('application/') &&
        file.mimetype.includes('excel')
      ) {
        uploadPath = `./uploads/${key}/doc/sheet`;
        relativePath = `uploads/${key}/doc/sheet`;
        fileCategory = 'spreadsheet';
      } else if (file.mimetype.startsWith('application/')) {
        uploadPath = `./uploads/${key}/doc`;
        relativePath = `uploads/${key}/doc`;
        fileCategory = 'document';
      } else {
        uploadPath = `./uploads/${key}/others`;
        relativePath = `uploads/${key}/others`;
        fileCategory = 'others';
      }

      // Create directory if it doesn't exist
      await fs.mkdir(uploadPath, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const sanitizedBaseName = file.originalname
        .replace(fileExtension, '')
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with dashes
      const fileName = `${key}-${Date.now()}-${sanitizedBaseName}${fileExtension}`;
      const fullPath = path.join(uploadPath, fileName);

      // Write file to disk
      if (file.buffer) {
        // File is in memory (using memoryStorage)
        await fs.writeFile(fullPath, file.buffer);
      } else if (file.path) {
        // File is already on disk (using diskStorage) - move it
        await fs.copyFile(file.path, fullPath);
        // Clean up original file
        await fs.unlink(file.path);
      } else {
        throw new Error('File data not available');
      }

      // --- Upload to Supabase (backup)
      const supabase = createClient(
        process.env.SUPABASE_MEDIA_DB_PROJECT_URL!,
        process.env.SUPABASE_MEDIA_DB_SERVICE_ROLE_KEY!,
      );

      const supabasePath = `${key}/${fileCategory}/${fileName}`;
      const uploadResult = await supabase.storage
        .from('media')
        .upload(supabasePath, file.buffer ?? (await fs.readFile(fullPath)), {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadResult.error) {
        console.warn(
          'Supabase upload failed (non-critical):',
          uploadResult.error.message,
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(supabasePath);
      const supabaseBackupUrl = publicUrlData?.publicUrl ?? null;

      // Generate public URL
      const fileUrl = `${this.hostName}/${relativePath}/${fileName}`;

      // Save file metadata to MongoDB
      const mediaRecord = await this.saveFileMetadata({
        originalName: file.originalname,
        fileName: fileName,
        filePath: fullPath,
        relativePath: `${relativePath}/${fileName}`,
        fileUrl: fileUrl,
        supabaseBackupUrl,
        mimetype: file.mimetype,
        size: file.size,
        category: fileCategory,
        uploadedBy: userId,
        uploadKey: key,
      });

      return {
        isSuccess: true,
        message: getMessage('media_mediaUploadedSuccessfully', lang),
        fileUrl,
        mediaId: mediaRecord._id.toString(),
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

  async saveFileMetadata(fileData: {
    originalName: string;
    fileName: string;
    filePath: string;
    relativePath: string;
    fileUrl: string;
    supabaseBackupUrl?: string;
    mimetype: string;
    size: number;
    category: string;
    uploadedBy: string;
    uploadKey: string;
    tags?: string[];
    description?: string;
  }): Promise<MediaDocument> {
    try {
      const mediaRecord = new this.mediaModel({
        originalName: fileData.originalName,
        fileName: fileData.fileName,
        filePath: fileData.filePath,
        relativePath: fileData.relativePath,
        fileUrl: fileData.fileUrl,
        supabaseBackupUrl: fileData.supabaseBackupUrl,
        mimetype: fileData.mimetype,
        size: fileData.size,
        category: fileData.category,
        uploadedBy: fileData.uploadedBy,
        uploadKey: fileData.uploadKey,
        tags: fileData.tags || [],
        description: fileData.description || '',
        uploadedAt: new Date(),
        isActive: true,
      });

      const savedMedia = await mediaRecord.save();
      return savedMedia;
    } catch (error) {
      console.error('Error saving file metadata to MongoDB:', error);
      throw error;
    }
  }

  async getFilesByCategory(
    category: string,
    userId?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<MediaDocument[]> {
    try {
      const query: any = { category, isActive: true };

      if (userId) {
        query.uploadedBy = userId;
      }

      return await this.mediaModel
        .find(query)
        .populate('uploadedBy', 'name email') // Populate user info
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();
    } catch (error) {
      console.error('Error fetching files by category:', error);
      throw error;
    }
  }

  async getFilesByUploadKey(
    uploadKey: string,
    userId?: string,
  ): Promise<MediaDocument[]> {
    try {
      const query: any = { uploadKey, isActive: true };

      if (userId) {
        query.uploadedBy = userId;
      }

      return await this.mediaModel
        .find(query)
        .populate('uploadedBy', 'name email')
        .sort({ uploadedAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error fetching files by upload key:', error);
      throw error;
    }
  }

  async getFileById(mediaId: string): Promise<MediaDocument | null> {
    try {
      return await this.mediaModel
        .findById(mediaId)
        .populate('uploadedBy', 'name email')
        .exec();
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      throw error;
    }
  }

  async updateFileMetadata(
    mediaId: string,
    updateData: {
      tags?: string[];
      description?: string;
      category?: string;
    },
  ): Promise<MediaDocument | null> {
    try {
      return await this.mediaModel
        .findByIdAndUpdate(mediaId, updateData, { new: true })
        .populate('uploadedBy', 'name email')
        .exec();
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  async deleteFile(mediaId: string, userId: string): Promise<boolean> {
    try {
      const mediaRecord = await this.mediaModel.findById(mediaId);

      if (!mediaRecord) {
        return false;
      }

      // Check if user has permission to delete
      if (mediaRecord.uploadedBy.toString() !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this file',
        );
      }

      // Delete physical file
      await this.cleanupFile(mediaRecord.filePath);

      // Mark as inactive in database (soft delete)
      await this.mediaModel.findByIdAndUpdate(mediaId, { isActive: false });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Successfully cleaned up file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to clean up file: ${filePath}`, error);
    }
  }

  async handleGetUploadFilePath(
    file: Express.Multer.File,
    requestingUser: any,
    lang: Locale = 'en',
    key: string,
  ): Promise<{ isSuccess: boolean; message: string; fileUrl: string }> {
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

    let uploadPath = `uploads/${key}`;

    if (file?.mimetype?.startsWith('image/')) {
      uploadPath = `uploads/${key}/image`;
    } else if (file?.mimetype?.startsWith('audio/')) {
      uploadPath = `uploads/${key}/audio`;
    } else if (file?.mimetype?.startsWith('video/')) {
      uploadPath = `uploads/${key}/video`;
    } else if (
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('excel')) ||
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('sheet'))
    ) {
      uploadPath = `uploads/${key}/doc/sheet`;
    } else if (file?.mimetype?.startsWith('application/')) {
      uploadPath = `uploads/${key}/doc`;
    } else {
      uploadPath = `uploads/${key}/others`;
    }

    const fileUrl = `${this.hostName}/${uploadPath}/${(file?.filename || file?.fieldname).trim() || file?.originalname.trim()}`;

    return {
      isSuccess: true,
      message: getMessage('media_mediaUploadedSuccessfully', lang),
      fileUrl,
    };
  }

  // Utility method to get file statistics
  async getFileStatistics(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    categoryCounts: Record<string, number>;
  }> {
    try {
      const query: any = { isActive: true };

      if (userId) {
        query.uploadedBy = userId;
      }

      const files = await this.mediaModel.find(query).exec();

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
}
