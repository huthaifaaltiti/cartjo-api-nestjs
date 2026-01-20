import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { MediaService } from '../media/media.service';
import { Banner, BannerDocument } from 'src/schemas/banner.schema';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Locale } from 'src/types/Locale';
import { CreateBannerDto } from './dto/create.dto';
import { Modules } from 'src/enums/appModules.enum';
import { activateDefaultIfAllInactive } from 'src/common/functions/helpers/activateDefaultIfAllInactive.helper';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { UpdateBannerDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UnDeleteDto } from './dto/unDelete.dto';
import { MediaPreview } from 'src/schemas/common.schema';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { CRON_JOBS } from 'src/configs/cron.config';

@Injectable()
export class BannerService {
  private readonly defaultBannerId: string;

  constructor(
    @InjectModel(Banner.name)
    private bannerModel: Model<BannerDocument>,
    private mediaService: MediaService,
  ) {
    this.defaultBannerId = process.env.DEFAULT_BANNER_ID;
  }

  @Cron(CRON_JOBS.BANNER.DEACTIVATE_EXPIRED_BANNERS)
  async deactivateExpiredBanners() {
    const now = new Date();

    const result = await this.bannerModel.updateMany(
      { isActive: true, endDate: { $lt: now } },
      { $set: { isActive: false } },
    );

    await activateDefaultIfAllInactive(this.bannerModel, this.defaultBannerId);

    if (result.modifiedCount > 0) {
      console.log(`Deactivated ${result.modifiedCount} expired banners`);
    }
  }

  // async markExpiredBannersInactive() {
  //   const now = new Date();

  //   await this.bannerModel.updateMany(
  //     { isActive: true, endDate: { $lt: now } },
  //     { $set: { isActive: false } },
  //   );
  // }

  async getAll(
    requestingUser: any,
    params: {
      lang?: Locale;
      limit?: string;
      lastId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<DataListResponse<Banner>> {
    const {
      lang = 'en',
      limit = '10',
      lastId,
      search,
      startDate,
      endDate,
    } = params;

    validateUserRoleAccess(requestingUser, lang);

    const query: any = {};

    // Pagination
    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { [`title.${lang}`]: searchRegex },
        { [`subTitle.${lang}`]: searchRegex },
        { [`label.${lang}`]: searchRegex },
        { 'ctaBtn.text': searchRegex },
        { 'offerDetails.desc': searchRegex },
      ];
    }

    // Date filtering
    if (startDate || endDate) {
      query.$and = [];

      if (startDate) {
        query.$and.push({ startDate: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        query.$and.push({ endDate: { $lte: new Date(endDate) } });
      }
    }

    const banners = await this.bannerModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('banner_bannersRetrievedSuccessfully', lang),
      dataCount: banners.length,
      data: banners,
    };
  }

  async getOne(id: string, lang?: Locale): Promise<DataResponse<Banner>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(getMessage('banner_invalidBannerId', lang));
    }

    const banner = await this.bannerModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('banner_bannerRetrievedSuccessfully', lang),
      data: banner,
    };
  }

  async getActiveOnes(lang?: Locale): Promise<DataListResponse<Banner>> {
    // await this.markExpiredBannersInactive();

    const now = new Date();

    const findQuery = {
      isActive: true,
      isDeleted: false,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } }, // Banner started before or at the current moment  startDate <= now, banner ends after or at the current moment endDate >= now
        { startDate: { $lte: now }, endDate: { $exists: false } }, // Banner already started (startDate <= now) but it has no end date
        { startDate: { $exists: false }, endDate: { $exists: false } }, //No start date and no end date were set,his means the banner is considered always active, as there are no time restrictions at all.
        { startDate: { $exists: true }, endDate: null },
      ],
    };

    const banners = await this.bannerModel
      .find(findQuery)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (banners.length === 0) {
      throw new NotFoundException(
        getMessage('banner_noActiveBannerFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage('banner_activeBannerRetrievedSuccessfully', lang),
      dataCount: banners.length,
      data: banners,
    };
  }

  async create(
    req: any,
    dto: CreateBannerDto,
    image_ar?: Express.Multer.File,
    image_en?: Express.Multer.File,
  ): Promise<DataResponse<Banner>> {
    const { title_ar, title_en, lang, withAction, link, startDate, endDate } =
      dto;

    validateUserRoleAccess(req?.user, lang);

    const existing = await this.bannerModel.findOne({
      $or: [{ 'title.ar': title_ar }, { 'title.en': title_en }],
    });

    if (existing) {
      throw new BadRequestException(
        getMessage('banner_bannerWithThisDetailsAlreadyExist', lang),
      );
    }

    const media_ar = await this.mediaService.mediaProcessor({
      file: image_ar,
      reqMsg: 'banner_shouldHasArImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.BANNER.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.BANNER.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.BANNER,
      req,
    });

    const media_en = await this.mediaService.mediaProcessor({
      file: image_en,
      reqMsg: 'banner_shouldHasEnImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.BANNER.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.BANNER.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.BANNER,
      req,
    });

    const banner = await this.bannerModel.create({
      title: { ar: title_ar, en: title_en },
      withAction,
      link: withAction ? link : null,
      media: { ar: media_ar, en: media_en },
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req?.user?.userId,
      isActive: true,
      isDeleted: false,
    });

    return {
      isSuccess: true,
      message: getMessage('banner_bannerCreatedSuccessfully', lang),
      data: banner.toObject(),
    };
  }

  async update(
    req: any,
    dto: UpdateBannerDto,
    id: string,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
  ): Promise<DataResponse<Banner>> {
    const { title_ar, title_en, lang, withAction, link, startDate, endDate } =
      dto;

    validateUserRoleAccess(req?.user, lang);

    const bannerToUpdate = await this.bannerModel.findById(id);

    if (!bannerToUpdate) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    // ---------------- Conflict Check ----------------
    const conflictQuery: any = { _id: { $ne: id }, $or: [] };

    if (title_ar && title_ar !== bannerToUpdate?.title?.ar) {
      conflictQuery.$or.push({ 'title.ar': title_ar });
    }

    if (title_en && title_en !== bannerToUpdate?.title?.en) {
      conflictQuery.$or.push({ 'title.en': title_en });
    }

    if (conflictQuery.$or.length > 0) {
      const existing = await this.bannerModel.findOne(conflictQuery);
      if (existing) {
        throw new BadRequestException(
          getMessage('banner_bannerWithThisDetailsAlreadyExist', lang),
        );
      }
    }

    if (image_ar || image_en) {
      let media_ar: MediaPreview = undefined,
        media_en: MediaPreview = undefined;

      if (image_ar) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_ar,
          user: req?.user,
          reqMsg: 'banner_shouldHasEnImage',
          maxSize: MEDIA_CONFIG.BANNER.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.BANNER.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.BANNER,
          req,
          existingMediaId: bannerToUpdate.media.ar.id,
        });

        media_ar = result;
      }

      if (image_en) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_en,
          user: req?.user,
          reqMsg: 'banner_shouldHasEnImage',
          maxSize: MEDIA_CONFIG.BANNER.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.BANNER.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.BANNER,
          req,
          existingMediaId: bannerToUpdate.media.en.id,
        });

        media_en = result;
      }

      bannerToUpdate.media = {
        ar: media_ar
          ? { ...media_ar, id: new mongoose.Types.ObjectId(media_ar.id) }
          : bannerToUpdate?.media?.ar,
        en: media_en
          ? { ...media_en, id: new mongoose.Types.ObjectId(media_en.id) }
          : bannerToUpdate?.media?.en,
      };
    }

    if (title_ar || title_en) {
      bannerToUpdate.title = {
        ar: title_ar || bannerToUpdate?.title?.ar,
        en: title_en || bannerToUpdate?.title?.en,
      };
    }

    if (withAction && typeof withAction === 'boolean') {
      bannerToUpdate.withAction = true;

      if (link) {
        bannerToUpdate.link = link || bannerToUpdate?.link;
      } else {
        throw new BadRequestException(
          getMessage('banner_bannerWithActionShouldHasLink', lang),
        );
      }
    } else {
      bannerToUpdate.withAction = false;
      bannerToUpdate.link = null;
    }

    if (startDate) {
      bannerToUpdate.startDate =
        new Date(startDate) ?? bannerToUpdate?.startDate;
    }

    if (endDate) {
      bannerToUpdate.endDate = new Date(endDate) ?? bannerToUpdate?.endDate;
    } else {
      bannerToUpdate.endDate = null;
    }

    const updateData: Partial<Banner> = {
      ...bannerToUpdate,
      updatedBy: req?.user?.userId,
      updatedAt: new Date(),
    };

    const updatedBanner = await this.bannerModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );

    if (!updatedBanner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('banner_bannerUpdatedSuccessfully', lang),
      data: updatedBanner.toObject(),
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    if (id === this.defaultBannerId) {
      throw new ForbiddenException(
        getMessage('banner_cannotDeleteDefaultBanner', lang),
      );
    }

    const banner = await this.bannerModel.findById(id);

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    banner.isDeleted = true;
    banner.isActive = false;
    banner.deletedAt = new Date();
    banner.deletedBy = requestingUser.userId;
    banner.unDeletedBy = null;

    await banner.save();

    await activateDefaultIfAllInactive(this.bannerModel, this.defaultBannerId);

    return {
      isSuccess: true,
      message: getMessage('banner_bannerDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const banner = await this.bannerModel.findById(id);

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    if (id === this.defaultBannerId) {
      throw new ForbiddenException(
        getMessage('banner_cannotUnDeleteDefaultBanner', lang),
      );
    }

    banner.isDeleted = false;
    banner.deletedAt = null;
    banner.deletedBy = null;
    banner.unDeletedBy = requestingUser.userId;
    banner.unDeletedAt = new Date();

    await banner.save();

    await activateDefaultIfAllInactive(this.bannerModel, this.defaultBannerId);

    return {
      isSuccess: true,
      message: getMessage('banner_bannerUnDeletedSuccessfully', lang),
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const banner = await this.bannerModel.findById(id);

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    const now = new Date();

    if (isActive) {
      if (banner.endDate && banner.endDate < now) {
        throw new BadRequestException(
          getMessage('banner_cannotActivateExpired', lang),
        );
      }

      // Optional: Prevent activation if start date is in the future
      if (banner.startDate && banner.startDate > now) {
        throw new BadRequestException(
          getMessage('banner_cannotActivateBeforeStartDate', lang),
        );
      }
    }

    banner.isActive = isActive;

    if (banner?.isDeleted && isActive) {
      await this.unDelete(requestingUser, { lang }, id);
    }

    await banner.save();

    await activateDefaultIfAllInactive(this.bannerModel, this.defaultBannerId);

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'banner_bannerActivatedSuccessfully'
          : 'banner_bannerDeActivatedSuccessfully',
        lang,
      ),
    };
  }
}
