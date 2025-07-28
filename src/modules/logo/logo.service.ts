import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MediaService } from '../media/media.service';
import { activateDefaultLogoIfAllInactive } from 'src/common/functions/helpers/activateDefaultLogoIfAllInactive.helper';

import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Modules } from 'src/enums/appModules.enum';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { CreateLogoDto } from './dto/create-logo.dto';
import { Model, Types } from 'mongoose';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { DeleteLogoDto } from './dto/delete-logo.dto';
import { UnDeleteLogoBodyDto } from './dto/unDelete-logo.dto';
import { Locale } from 'src/types/Locale';

@Injectable()
export class LogoService {
  private readonly defaultLogoId: string;

  constructor(
    @InjectModel(Logo.name)
    private logoModel: Model<LogoDocument>,
    private mediaService: MediaService,
  ) {
    this.defaultLogoId = process.env.DEFAULT_LOGO_ID;
  }

  async getAll(
    requestingUser: any,
    params: {
      lang?: Locale;
      limit?: string;
      lastId?: string;
      search?: string;
    },
  ): Promise<DataListResponse<Logo>> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    validateUserRoleAccess(requestingUser, lang);

    const query: any = {};

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { altText: searchRegex }];
    }

    const logos = await this.logoModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('logo_logosRetrievedSuccessfully', lang),
      dataCount: logos.length,
      data: logos,
    };
  }

  async getOne(id: string, lang?: Locale): Promise<DataResponse<Logo>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(getMessage('logo_invalidLogoId', lang));
    }

    const logo = await this.logoModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!logo) {
      throw new NotFoundException(getMessage('logo_logoNotFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('logo_logoRetrievedSuccessfully', lang),
      data: logo,
    };
  }

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

  async update(
    requestingUser: any,
    dto: UpdateLogoDto,
    image: Express.Multer.File,
    id: string,
  ): Promise<DataResponse<Logo>> {
    const { lang, name, altText } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const logoToUpdate = await this.logoModel.findById(id);
    if (!logoToUpdate) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    if (name) {
      const existingLogo = await this.logoModel.findOne({
        _id: { $ne: id },
        name,
      });

      if (existingLogo) {
        throw new BadRequestException(
          getMessage('logo_logoAlreadyExists', lang),
        );
      }
    }

    let mediaUrl: string | undefined = logoToUpdate.media.url;
    let mediaId: string | undefined = logoToUpdate.media.id?.toString();

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

    const updateData: Partial<Logo> = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (mediaUrl !== logoToUpdate.media?.url) {
      updateData.media = {
        id: mediaId,
        url: mediaUrl,
      };
    }

    if (name) updateData.name = name;
    if (altText) updateData.altText = altText;

    const updatedLogo = await this.logoModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return {
      isSuccess: true,
      message: getMessage('logo_logoUpdatedSuccessfully', lang),
      data: updatedLogo,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteLogoDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    if (id === this.defaultLogoId) {
      throw new BadRequestException(
        getMessage('logo_cannotDeleteDefaultLogo', lang),
      );
    }

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    logo.isDeleted = true;
    logo.isActive = false;
    logo.deletedAt = new Date();
    logo.deletedBy = requestingUser.userId;
    logo.unDeletedBy = null;

    await logo.save();

    await activateDefaultLogoIfAllInactive(this.logoModel, this.defaultLogoId);

    return {
      isSuccess: true,
      message: getMessage('logo_logoDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteLogoBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    if (id === this.defaultLogoId) {
      throw new BadRequestException(
        getMessage('logo_cannotUnDeleteDefaultLogo', lang),
      );
    }

    logo.isDeleted = false;
    logo.deletedAt = null;
    logo.deletedBy = null;
    logo.unDeletedBy = requestingUser.userId;
    logo.unDeletedAt = new Date();

    await logo.save();

    await activateDefaultLogoIfAllInactive(this.logoModel, this.defaultLogoId);

    return {
      isSuccess: true,
      message: getMessage('logo_logoUnDeletedSuccessfully', lang),
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new NotFoundException(getMessage('logo_logoNotFound', lang));
    }

    if (isActive) {
      // Deactivate all other logos
      await this.logoModel.updateMany(
        { _id: { $ne: id } },
        {
          $set: {
            isActive: false,
            isDeleted: false,
            deletedAt: null,
          },
        },
      );

      // Activate current logo
      logo.isActive = true;
      logo.isDeleted = false;
      logo.deletedAt = null;
    } else {
      // Deactivate current logo
      logo.isActive = false;
    }

    await logo.save();

    // Activate default logo if all are inactive
    await activateDefaultLogoIfAllInactive(this.logoModel, this.defaultLogoId);

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'logo_logoActivatedSuccessfully'
          : 'logo_logoDeactivatedSuccessfully',
        lang,
      ),
    };
  }
}
