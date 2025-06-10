import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { getMessage } from 'src/common/utils/translator';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class MediaService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.hostName = process.env.HOST_NAME;
  }

  private readonly hostName: string;

  async handleFileUpload(
    file: Express.Multer.File,
    requestingUser: any,
    lang: 'en' | 'ar' = 'en',
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

    let uploadPath = 'uploads';

    if (file?.mimetype?.startsWith('image/')) {
      uploadPath = 'uploads/image';
    } else if (file?.mimetype?.startsWith('audio/')) {
      uploadPath = 'uploads/audio';
    } else if (file?.mimetype?.startsWith('video/')) {
      uploadPath = 'uploads/video';
    } else if (
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('excel')) ||
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('sheet'))
    ) {
      uploadPath = 'uploads/doc/sheet';
    } else if (file?.mimetype?.startsWith('application/')) {
      uploadPath = 'uploads/doc';
    } else {
      uploadPath = 'uploads/others';
    }

    const fileUrl = `${this.hostName}/${uploadPath}/${file?.filename || file?.originalname}`;

    return {
      isSuccess: true,
      message: getMessage('media_mediaUploadedSuccessfully', lang),
      fileUrl,
    };
  }
}
