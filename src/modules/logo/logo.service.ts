import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaService } from '../media/media.service';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Logo, LogoDocument } from 'src/schemas/logo.schema';
import { Modules } from 'src/enums/appModules.enum';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { DeleteLogoDto } from './dto/delete-logo.dto';
import { UnDeleteLogoBodyDto } from './dto/unDelete-logo.dto';
import { Locale } from 'src/types/Locale';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { MediaPreview } from 'src/schemas/common.schema';
import { HistoryService } from '../history/history.service';
import { LogModule } from 'src/enums/logModules.enum';
import { LogAction } from 'src/enums/LogAction.enum';
import { AppConfigService } from '../appConfig/appConfig.service';

@Injectable()
export class LogoService {
  private readonly defaultLogoId: string;

  constructor(
    @InjectModel(Logo.name)
    private logoModel: Model<LogoDocument>,
    private mediaService: MediaService,
    private historyService: HistoryService,
    private appConfigService: AppConfigService,
  ) {
    this.defaultLogoId = process.env.DEFAULT_LOGO_ID;
  }

  private async activateDefaultLogo() {
    const existingDefault = await this.logoModel.findOne({
      isDefault: true,
      isDeleted: false,
      isActive: true,
    });

    if (existingDefault) return;

    // 2. Find eligible logos
    const eligibleLogos = await this.logoModel.find({
      isDeleted: false,
    });

    if (!eligibleLogos.length) {
      console.warn('[FALLBACK] No eligible logos to set as default');
      return;
    }

    const randomLogo =
      eligibleLogos[Math.floor(Math.random() * eligibleLogos.length)];

    await this.logoModel.updateMany(
      { isDefault: true },
      { $set: { isDefault: false } },
    );

    await this.logoModel.findByIdAndUpdate(randomLogo._id, {
      isDefault: true,
      isActive: true,
    });

    console.log(`[FALLBACK] Random default logo selected: ${randomLogo._id}`);
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

  async getActiveLogo(lang?: Locale): Promise<DataResponse<Logo>> {
    const logo = await this.logoModel
      .findOne({ isActive: true, isDeleted: false })
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
    image: Express.Multer.File,
  ): Promise<DataResponse<Logo>> {
    const { lang, name, altText } = dto;

    validateUserRoleAccess(req?.user, lang);

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

    let createdMedia: MediaPreview | undefined = undefined;

    if (image && Object.keys(image).length > 0) {
      const logoImage = await this.mediaService.mediaProcessor({
        file: image,
        reqMsg: 'logo_shouldHasImage',
        user: req?.user,
        maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
        lang,
        key: Modules.LOGO,
        req,
      });

      if (logoImage) {
        createdMedia = logoImage;
      }
    }

    const logo = new this.logoModel({
      media: createdMedia,
      name,
      altText,
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
    image: Express.Multer.File,
    id: string,
  ): Promise<DataResponse<Logo>> {
    const { lang, name, altText } = dto;

    validateUserRoleAccess(req?.user, lang);

    const logoToUpdate = await this.logoModel.findById(id);
    if (!logoToUpdate) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    const before = logoToUpdate.toObject();

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

    let mediaObj: MediaPreview | undefined;

    if (image) {
      const result = await this.mediaService.hardDeleteAndUpload({
        file: image,
        user: req?.user,
        reqMsg: 'logo_shouldHasImage',
        maxSize: MEDIA_CONFIG.LOGO.IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.LOGO.IMAGE.ALLOWED_TYPES,
        lang,
        key: Modules.LOGO,
        req,
        existingMediaId: logoToUpdate.media.id,
      });

      mediaObj = result;
    }

    const updateData: Partial<Logo> = {
      updatedBy: req?.user?.userId,
      updatedAt: new Date(),
    };

    if (mediaObj && mediaObj.url !== logoToUpdate.media?.url) {
      updateData.media = mediaObj;
    }

    if (name) updateData.name = name;
    if (altText) updateData.altText = altText;

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

    if (id === this.defaultLogoId) {
      throw new BadRequestException(
        getMessage('logo_cannotDeleteDefaultLogo', lang),
      );
    }

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new BadRequestException(getMessage('logo_logoNotFound', lang));
    }

    const activeLogosCount = await this.logoModel.countDocuments({
      isActive: true,
      isDeleted: false,
    });

    if (
      activeLogosCount <= (this.appConfigService.config.minActiveLogos ?? 1)
    ) {
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

    await this.activateDefaultLogo();

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

    await this.activateDefaultLogo();

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

    const logo = await this.logoModel.findById(id);

    if (!logo) {
      throw new NotFoundException(getMessage('logo_logoNotFound', lang));
    }

    if (!isActive) {
      const activeCount = await this.logoModel.countDocuments({
        isActive: true,
        isDeleted: false,
      });

      if (activeCount <= 1) {
        throw new BadRequestException(
          getMessage('logo_atLeastOneLogoMustRemainActive', lang),
        );
      }

      await this.logoModel.findByIdAndUpdate(id, {
        $set: { isActive: false },
      });

      await this.activateDefaultLogo();
    }

    if (isActive) {
      if (logo.isDeleted) {
        throw new NotFoundException(
          getMessage('logo_cannotActivateDeletedLogo', lang),
        );
      }

      // Deactivate all others
      await this.logoModel.updateMany(
        { _id: { $ne: id } },
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
