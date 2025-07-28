import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MediaService } from '../media/media.service';

import { DataResponse } from 'src/types/service-response.type';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Modules } from 'src/enums/appModules.enum';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { CreateLogoDto } from './dto/create-logo.dto';
import { Model } from 'mongoose';

@Injectable()
export class LogoService {
  constructor(
    @InjectModel(Logo.name)
    private logoModel: Model<LogoDocument>,
    private mediaService: MediaService,
  ) {}

  async create(
    requestingUser: any,
    dto: CreateLogoDto,
    image: Express.Multer.File,
  ): Promise<DataResponse<Logo>> {
    const { lang, name, altText } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const existingLogo = await this.logoModel.findOne({
      $or: [{ name }, { altText }],
    });

    if (existingLogo) {
      throw new BadRequestException(getMessage('logo_logoAlreadyExists', lang));
    }

    const activeLogo = await this.logoModel.findOne({ isActive: true });

    if (activeLogo) {
      activeLogo.isActive = false;
      await activeLogo.save();
    }

    let mediaUrl: string | undefined = undefined;
    let mediaId: string | undefined = undefined;

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.LOGO_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.LOGO,
      );

      if (result?.isSuccess) {
        mediaUrl = result.fileUrl;
        mediaId = result.mediaId;
      }
    }

    const logo = new this.logoModel({
      media: { id: mediaId, url: mediaUrl },
      name,
      altText,
      createdBy: requestingUser?.userId,
      isActive: true,
      isDeleted: false,
    });

    await logo.save();

    return {
      isSuccess: true,
      message: getMessage('logo_logoCreatedSuccessfully', lang),
      data: logo,
    };
  }
}
