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
import { CreateBannerDto } from './dto/create.dto';
import { UpdateBannerDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UnDeleteDto } from './dto/unDelete.dto';
import { AppConfigService } from '../appConfig/appConfig.service';
import { HistoryService } from '../history/history.service';
import { Banner, BannerDocument } from '../../schemas/banner.schema';
import { CRON_JOBS } from '../../configs/cron.config';
import { Locale } from '../../types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { getMessage } from '../../common/utils/translator';
import { MEDIA_CONFIG } from '../../configs/media.config';
import { Modules } from '../../enums/appModules.enum';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/logAction.enum';
import { MediaPreview } from '../../schemas/common.schema';
import { validateDocDates } from '../../common/functions/validators/validateDocDates.alidator';
import { LogTrigger } from '../../enums/logTrigger.enum';

@Injectable()
export class BannerService {
  private readonly defaultBannerId: string;

  constructor(
    @InjectModel(Banner.name)
    private bannerModel: Model<BannerDocument>,
    private mediaService: MediaService,
    private appConfigService: AppConfigService,
    private historyService: HistoryService,
  ) {}

  @Cron(CRON_JOBS.BANNER.DEACTIVATE_EXPIRED_BANNERS)
  async deactivateExpiredBanners() {
    const now = new Date();

    try {
      const result = await this.bannerModel.updateMany(
        {
          isActive: true,
          isDeleted: false,
          endDate: { $ne: null, $lt: now }, // ensure endDate exists & expired
        },
        {
          $set: {
            isActive: false,
            isExpired: true,
            updatedAt: now,
          },
        },
      );

      if (result.modifiedCount > 0) {
        await this.historyService.log(
          LogModule.BANNER,
          LogAction.UPDATE,
          null, // system action
          null,
          {
            trigger: LogTrigger.CRON,
            meta: {
              job: 'DEACTIVATE_EXPIRED_BANNERS',
              affectedCount: result.modifiedCount,
              matchedCount: result.matchedCount,
            },
          },
        );

        console.log(
          `[CRON] Deactivated ${result.modifiedCount} expired banners`,
        );
      }

      await this.activateDefaultBanner();
    } catch (error) {
      await this.historyService.log(
        LogModule.BANNER,
        LogAction.UPDATE,
        null,
        null,
        {
          trigger: LogTrigger.CRON,
          meta: {
            job: 'DEACTIVATE_EXPIRED_BANNERS',
            error: (error as Error)?.message,
          },
        },
      );

      console.error('[CRON] Failed to deactivate expired banners:', error);
    }
  }

  private computeIsExpired(endDate?: Date): boolean {
    const now = new Date();

    if (!endDate) return false;

    return endDate < now;
  }

  private async activateDefaultBanner() {
    const now = new Date();

    try {
      const existingDefault = await this.bannerModel.findOne({
        isDefault: true,
        isDeleted: false,
        isActive: true,
      });

      if (existingDefault) return;

      // 2. Find eligible banners (NO endDate, valid timing)
      const eligibleBanners = await this.bannerModel.find({
        isDeleted: false,
        isExpired: { $ne: true },
        $and: [
          {
            $or: [{ endDate: { $exists: false } }, { endDate: null }],
          },
          {
            $or: [
              { startDate: { $lte: now } },
              { startDate: { $exists: false } },
            ],
          },
        ],
      });

      if (!eligibleBanners.length) {
        console.warn('[FALLBACK] No eligible banners to set as default');
        return;
      }

      const randomBanner =
        eligibleBanners[Math.floor(Math.random() * eligibleBanners.length)];

      await this.bannerModel.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } },
      );

      await this.bannerModel.findByIdAndUpdate(randomBanner._id, {
        isDefault: true,
        isActive: true,
        isExpired: false,
        endDate: null,
      });

      // Log
      await this.historyService.log(
        LogModule.BANNER,
        LogAction.UPDATE,
        null, // system action
        null,
        {
          trigger: LogTrigger.CRON,
          meta: {
            job: 'ACTIVATE_RANDOM_DEFAULT',
            selectedBannerId: randomBanner._id,
          },
        },
      );

      console.log(
        `[FALLBACK] Random default banner selected: ${randomBanner._id}`,
      );
    } catch (error) {
      await this.historyService.log(
        LogModule.BANNER,
        LogAction.UPDATE,
        null,
        null,
        {
          trigger: LogTrigger.CRON,
          meta: {
            job: 'ACTIVATE_RANDOM_DEFAULT',
            error: (error as Error)?.message,
          },
        },
      );

      console.error('[FALLBACK] Failed to activate default banner:', error);
    }
  }

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
    const now = new Date();

    const findQuery = {
      isActive: true,
      isDeleted: false,
      isExpired: false,
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

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : undefined;

    validateDocDates(start, end, lang);

    const banner = await this.bannerModel.create({
      title: { ar: title_ar, en: title_en },
      withAction,
      link: withAction ? link : null,
      media: { ar: media_ar, en: media_en },
      startDate: start,
      endDate: end,
      createdBy: req?.user?.userId,
      isExpired: this.computeIsExpired(end),
      isActive: true,
      isDeleted: false,
    });

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      LogAction.CREATE,
      req?.user?.userId,
      null,
      {
        bannerId: banner._id,
        title: banner.title,
        trigger: LogTrigger.USER,
        changes: {
          after: banner.toObject(),
        },
      },
    );

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

    console.log({ bannerToUpdate });

    if (!bannerToUpdate) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    // Deleted
    if (bannerToUpdate.isDeleted) {
      throw new NotFoundException(
        getMessage('banner_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    if (!bannerToUpdate.isActive && !bannerToUpdate.isExpired) {
      throw new NotFoundException(
        getMessage('banner_cannotUpdateInActiveOrDeleted', lang),
      );
    }

    const before = bannerToUpdate.toObject();

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

    const newStartDate = startDate
      ? new Date(startDate)
      : bannerToUpdate.startDate;

    const newEndDate =
      endDate !== undefined
        ? endDate
          ? new Date(endDate)
          : null
        : bannerToUpdate.endDate;

    validateDocDates(newStartDate, newEndDate, lang, true);

    const nowExpired = this.computeIsExpired(newEndDate);

    if (bannerToUpdate.isExpired && !nowExpired) {
      bannerToUpdate.isExpired = false;
      bannerToUpdate.isActive = true;
    } else {
      bannerToUpdate.isExpired = nowExpired;
    }

    bannerToUpdate.startDate = newStartDate;
    bannerToUpdate.endDate = newEndDate;

    const updateData: Partial<Banner> = {
      ...bannerToUpdate.toObject(),
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

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      LogAction.UPDATE,
      req?.user?.userId,
      null,
      {
        bannerId: id,
        title: updatedBanner.title,
        trigger: LogTrigger.USER,
        changes: {
          before,
          after: updatedBanner.toObject(),
        },
      },
    );

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

    const activeBannersCount = await this.bannerModel.countDocuments({
      isActive: true,
      isDeleted: false,
      isExpired: false,
    });

    if (
      activeBannersCount <= (this.appConfigService.config.minActiveBanners ?? 1)
    ) {
      throw new BadRequestException(
        getMessage('banner_atLeastOneBannerMustRemainActive', lang),
      );
    }

    const banner = await this.bannerModel.findById(id);

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    const before = banner.toObject();

    banner.isDeleted = true;
    banner.isActive = false;
    banner.deletedAt = new Date();
    banner.deletedBy = requestingUser.userId;
    banner.unDeletedBy = null;

    await banner.save();

    await this.activateDefaultBanner();

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      LogAction.DELETE,
      requestingUser.userId,
      null,
      {
        bannerId: id,
        title: banner.title,
        trigger: LogTrigger.USER,
        changes: {
          before,
          after: {
            isDeleted: true,
            isActive: false,
          },
        },
      },
    );

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

    const before = banner.toObject();

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

    await this.activateDefaultBanner();

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      LogAction.UNDELETE,
      requestingUser.userId,
      null,
      {
        bannerId: id,
        title: banner.title,
        trigger: LogTrigger.USER,
        changes: {
          before,
          after: {
            isDeleted: false,
            isActive: banner.isActive,
          },
        },
      },
    );

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

    const before = banner.toObject();

    const now = new Date();

    if (!isActive) {
      const activeBannersCount = await this.bannerModel.countDocuments({
        isActive: true,
        isDeleted: false,
        isExpired: false,
      });

      if (
        activeBannersCount <=
        (this.appConfigService.config.minActiveBanners ?? 1)
      ) {
        throw new BadRequestException(
          getMessage('banner_atLeastOneBannerMustRemainActive', lang),
        );
      }
    }

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

    banner.isExpired = this.computeIsExpired(banner.endDate);

    await banner.save();

    await this.activateDefaultBanner();

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      isActive ? LogAction.ACTIVATE : LogAction.DEACTIVATE,
      requestingUser.userId,
      null,
      {
        bannerId: id,
        title: banner.title,
        trigger: LogTrigger.USER,
        changes: {
          before,
          after: {
            isActive: banner.isActive,
            isExpired: banner.isExpired,
          },
        },
      },
    );

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

  async setAsDefault(
    id: string,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const banner = await this.bannerModel.findById(id);

    if (!banner) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    const before = banner.toObject();

    if (banner.isDeleted) {
      throw new BadRequestException(
        getMessage('banner_cannotSetDeletedAsDefault', lang),
      );
    }

    const now = new Date();

    // Prevent banners with endDate (interval banners)
    if (banner.endDate) {
      throw new BadRequestException(
        getMessage('banner_defaultMustNotHaveEndDate', lang),
      );
    }

    // Prevent banners that haven't started yet
    if (banner.startDate && banner.startDate > now) {
      throw new BadRequestException(
        getMessage('banner_defaultCannotBeFuture', lang),
      );
    }

    // Prevent expired banners
    if (banner.isExpired || (banner.endDate && banner.endDate < now)) {
      throw new BadRequestException(
        getMessage('banner_cannotSetExpiredAsDefault', lang),
      );
    }

    // only one default allowed
    await this.bannerModel.updateMany(
      { isDefault: true },
      { $set: { isDefault: false } },
    );

    // Set the new default — always active, no expiry
    await this.bannerModel.findByIdAndUpdate(id, {
      isDefault: true,
      isActive: true,
      isExpired: false,
      endDate: null, // default banners never expire
    });

    // Log
    await this.historyService.log(
      LogModule.BANNER,
      LogAction.SET_DEFAULT,
      requestingUser.userId,
      null,
      {
        bannerId: id,
        title: banner.title,
        trigger: LogTrigger.USER,
        changes: {
          before,
          after: {
            isDefault: true,
            isActive: true,
            endDate: null,
          },
        },
      },
    );

    return {
      isSuccess: true,
      message: getMessage('banner_bannerSetAsDefaultSuccessfully', lang),
    };
  }
}
