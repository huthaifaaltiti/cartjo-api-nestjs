import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Locale } from 'src/types/Locale';
import { User, UserDocument } from '../../schemas/user.schema';

import { getMessage } from 'src/common/utils/translator';

@Injectable()
export class MediaService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.hostName = process.env.HOST_NAME;
  }

  private readonly hostName: string;

  async handleFileUpload(
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

    try {
      // Determine upload path based on file type
      let uploadPath = `./uploads/${key}`;
      let relativePath = `uploads/${key}`;

      if (file.mimetype.startsWith('image/')) {
        uploadPath = `./uploads/${key}/image`;
        relativePath = `uploads/${key}/image`;
      } else if (file.mimetype.startsWith('audio/')) {
        uploadPath = `./uploads/${key}/audio`;
        relativePath = `uploads/${key}/audio`;
      } else if (file.mimetype.startsWith('video/')) {
        uploadPath = `./uploads/${key}/video`;
        relativePath = `uploads/${key}/video`;
      } else if (
        file.mimetype.startsWith('application/') &&
        file.mimetype.includes('excel')
      ) {
        uploadPath = `./uploads/${key}/doc/sheet`;
        relativePath = `uploads/${key}/doc/sheet`;
      } else if (file.mimetype.startsWith('application/')) {
        uploadPath = `./uploads/${key}/doc`;
        relativePath = `uploads/${key}/doc`;
      } else {
        uploadPath = `./uploads/${key}/others`;
        relativePath = `uploads/${key}/others`;
      }

      // Create directory if it doesn't exist
      await fs.mkdir(uploadPath, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${key}-${Date.now()}-${file.originalname.replace(fileExtension, '').trim()}${fileExtension}`;
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

      // Generate public URL
      const fileUrl = `${this.hostName}/${relativePath}/${fileName}`;

      return {
        isSuccess: true,
        message: getMessage('media_mediaUploadedSuccessfully', lang),
        fileUrl,
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
}
