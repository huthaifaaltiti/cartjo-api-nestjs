import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaService } from '../media/media.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { DeleteLogoDto } from './dto/delete-logo.dto';
import { UnDeleteLogoBodyDto } from './dto/unDelete-logo.dto';
import { HistoryService } from '../history/history.service';
import { Logo, LogoDocument } from '../../schemas/logo.schema';
import { Locale } from '../../types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { getMessage } from '../../common/utils/translator';
import { MediaPreview } from '../../schemas/common.schema';
import { MEDIA_CONFIG } from '../../configs/media.config';
import { Modules } from '../../enums/appModules.enum';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/logAction.enum';
import { checkRequiredPermissions } from '../../common/utils/permission-check.utils';
import { Permission } from '../../enums/permission.enum';
import { LogoType } from '../../enums/logoType.enum';

@Injectable()
export class LogoService {
  private readonly defaultLogoId: string;

  constructor(
    @InjectModel(Logo.name)
    private logoModel: Model<LogoDocument>,
    private mediaService: MediaService,
    private historyService: HistoryService,
  ) {
    this.defaultLogoId = process.env.DEFAULT_LOGO_ID;
  }

  private async activateDefaultLogo(type: LogoType) {
    const existingDefault = await this.logoModel.findOne({
      type,
      isDefault: true,
      isDeleted: false,
      isActive: true,
    });

    if (existingDefault) return;

    // 2. Find eligible logos
    const eligibleLogos = await this.logoModel.find({
      type,
      isDeleted: false,
    });

    if (!eligibleLogos.length) {
      console.warn(`[FALLBACK] No eligible logos of type ${type} to set as default`);
      return;
    }

    const randomLogo =
      eligibleLogos[Math.floor(Math.random() * eligibleLogos.length)];

    await this.logoModel.updateMany(
      { type, isDefault: true },
      { $set: { isDefault: false } },
    );

    await this.logoModel.findByIdAndUpdate(randomLogo._id, {
      isDefault: true,
      isActive: true,
    });

    console.log(
      `[FALLBACK] Random default logo of type ${type} selected: ${randomLogo._id}`,
    );
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

    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.LOGOS_READ],
      lang,
    );

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

  async getOne(
    requestingUser: any,
    id: string,
    lang?: Locale,
  ): Promise<DataResponse<Logo>> {
    validateUserRoleAccess(requestingUser, lang);

    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.LOGOS_READ],
      lang,
    );

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

  async getActiveLogo(
    lang?: Locale,
    type: LogoType = LogoType.MAIN,
  ): Promise<DataResponse<Logo>> {
    const logo = await this.logoModel
      .findOne({ type, isActive: true, isDeleted: false })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!logo) {
      throw new NotFoundException(getMessage('logo_noActiveLogoFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('logo_activeLogoRetrievedSuccessfully', lang),
      data: logo,
    };
  }

  async create(
    req: any,
    dto: CreateLogoDto,
    image_ar?: Express.Multer.File,
    image_en?: Express.Multer.File,
  ): Promise<DataResponse<Logo>> {
    const { lang, name_ar, name_en, altText_ar, altText_en, type } = dto;

    validateUserRoleAccess(req?.user, lang);

    checkRequiredPermissions(
      req?.user?.permissions,
      [Permission.LOGOS_CREATE],
      lang,
    );

    const existingLogo = await this.logoModel.findOne({
      $or: [
        { 'name.ar': name_ar },
        { 'name.en': name_en },
        { 'altText.ar': altText_ar },
        { 'altText.en': altText_en },
      ],
    });

    if (existingLogo) {
      throw new BadRequestException(getMessage('logo_logoAlreadyExists', lang));
    }

    const activeLogo = await this.logoModel.findOne({ type, isActive: true });

    if (activeLogo) {
      activeLogo.isActive = false;
      await activeLogo.save();
    }

    const media_ar = await this.mediaService.mediaProcessor({
      file: image_ar,
      reqMsg: 'logo_shouldHasArImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.LOGO,
      req,
    });

    const media_en = await this.mediaService.mediaProcessor({
      file: image_en,
      reqMsg: 'logo_shouldHasEnImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.LOGO,
      req,
    });

    const logo = new this.logoModel({
      media: { ar: media_ar, en: media_en },
      name: { ar: name_ar, en: name_en },
      type,
      altText: { ar: altText_ar, en: altText_en },
      createdBy: req?.user?.userId,
      isActive: true,
      isDeleted: false,
    });

    await logo.save();

    // Log
    await this.historyService.log(
      LogModule.LOGO,
      LogAction.CREATE,
      req?.user?.userId,
      null,
      {
        logoId: logo._id,
        name: logo.name,
      },
    );

    return {
      isSuccess: true,
      message: getMessage('logo_logoCreatedSuccessfully', lang),
      data: logo,
    };
  }

  async update(
    req: any,
    dto: UpdateLogoDto,
    id: string,
    image_ar?: Express.Multer.File,
    image_en?: Express.Multer.File,
  ): Promise<DataResponse<Logo>> {
    const { lang, name_ar, name_en, altText_ar, altText_en, type } = dto;

    validateUserRoleAccess(req?.user, lang);

    checkRequiredPermissions(
      req?.user?.permissions,
      [Permission.LOGOS_UPDATE],
      lang,
    );

    const logoToUpdate = await this.logoModel.findById(id);
    if (!logoToUpdate) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    const before = logoToUpdate.toObject();

    const uniqueFields: any[] = [];
    if (name_ar) uniqueFields.push({ 'name.ar': name_ar });
    if (name_en) uniqueFields.push({ 'name.en': name_en });
    if (altText_ar) uniqueFields.push({ 'altText.ar': altText_ar });
    if (altText_en) uniqueFields.push({ 'altText.en': altText_en });

    if (uniqueFields.length > 0) {
      const existingLogo = await this.logoModel.findOne({
        _id: { $ne: id },
        $or: uniqueFields,
      });

      if (existingLogo) {
        throw new BadRequestException(
          getMessage('logo_logoAlreadyExists', lang),
        );
      }
    }

    const updateData: any = {
      updatedBy: req?.user?.userId,
      updatedAt: new Date(),
    };

    if (image_ar || image_en) {
      let media_ar: MediaPreview = undefined,
        media_en: MediaPreview = undefined;

      if (image_ar) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_ar,
          user: req?.user,
          reqMsg: 'logo_shouldHasArImage',
          maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.LOGO,
          req,
          existingMediaId: logoToUpdate.media?.ar?.id,
        });

        media_ar = result;
      }

      if (image_en) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_en,
          user: req?.user,
          reqMsg: 'logo_shouldHasEnImage',
          maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.LOGO,
          req,
          existingMediaId: logoToUpdate.media?.en?.id,
        });

        media_en = result;
      }

      updateData.media = {
        ar: media_ar
          ? { ...media_ar, id: new Types.ObjectId(media_ar.id) }
          : logoToUpdate?.media?.ar,
        en: media_en
          ? { ...media_en, id: new Types.ObjectId(media_en.id) }
          : logoToUpdate?.media?.en,
      };
    }

    if (name_ar || name_en) {
      updateData.name = {
        ar: name_ar || logoToUpdate.name.ar,
        en: name_en || logoToUpdate.name.en,
      };
    }

    if (altText_ar || altText_en) {
      updateData.altText = {
        ar: altText_ar || logoToUpdate.altText.ar,
        en: altText_en || logoToUpdate.altText.en,
      };
    }

    if (type) {
      updateData.type = type;

      // If the type changes, and we want this logo to be active, we should deactivate the other active logo of this new type.
      if (logoToUpdate.isActive) {
        const activeLogo = await this.logoModel.findOne({
          type,
          isActive: true,
          _id: { $ne: id },
        });

        if (activeLogo) {
          activeLogo.isActive = false;
          await activeLogo.save();
        }
      }
    }

    const updatedLogo = await this.logoModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Log
    await this.historyService.log(
      LogModule.LOGO,
      LogAction.UPDATE,
      req?.user?.userId,
      null,
      {
        logoId: id,
        before,
        after: updatedLogo.toObject(),
      },
    );

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

    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.LOGOS_DELETE],
      lang,
    );

    if (id === this.defaultLogoId) {
      throw new BadRequestException(
        getMessage('logo_cannotDeleteDefaultLogo', lang),
      );
    }

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    const totalCount = await this.logoModel.countDocuments({
      type: logo.type,
      isDeleted: false,
    });

    if (totalCount <= 1) {
      throw new BadRequestException(
        getMessage('logo_atLeastOneLogoMustRemainActive', lang),
      );
    }

    logo.isDeleted = true;
    logo.isActive = false;
    logo.deletedAt = new Date();
    logo.deletedBy = requestingUser.userId;
    logo.unDeletedBy = null;

    await logo.save();

    await this.activateDefaultLogo(logo.type);

    // Log
    await this.historyService.log(
      LogModule.LOGO,
      LogAction.DELETE,
      requestingUser.userId,
      null,
      {
        logoId: id,
        name: logo.name,
      },
    );

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

    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.LOGOS_RESTORE],
      lang,
    );

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

    await this.activateDefaultLogo(logo.type);

    // Log
    await this.historyService.log(
      LogModule.LOGO,
      LogAction.UNDELETE,
      requestingUser.userId,
      null,
      {
        logoId: id,
        name: logo.name,
      },
    );

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

    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.LOGOS_ACTIVATE, Permission.LOGOS_DEACTIVATE],
      lang,
    );

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new NotFoundException(getMessage('logo_logoNotFound', lang));
    }

    if (!isActive) {
      const totalCount = await this.logoModel.countDocuments({
        type: logo.type,
        isDeleted: false,
      });

      if (totalCount <= 1) {
        throw new BadRequestException(
          getMessage('logo_atLeastOneLogoMustRemainActive', lang),
        );
      }

      await this.logoModel.findByIdAndUpdate(id, {
        $set: { isActive: false },
      });

      await this.activateDefaultLogo(logo.type);
    }

    if (isActive) {
      if (logo.isDeleted) {
        throw new NotFoundException(
          getMessage('logo_cannotActivateDeletedLogo', lang),
        );
      }

      // Deactivate all others of the same type
      await this.logoModel.updateMany(
        { type: logo.type, _id: { $ne: id } },
        { $set: { isActive: false } },
      );

      // Activate current
      await this.logoModel.findByIdAndUpdate(id, {
        $set: {
          isActive: true,
        },
      });
    }

    // Log
    await this.historyService.log(
      LogModule.LOGO,
      isActive ? LogAction.ACTIVATE : LogAction.DEACTIVATE,
      requestingUser.userId,
      null,
      { logoId: id, name: logo.name },
    );

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
