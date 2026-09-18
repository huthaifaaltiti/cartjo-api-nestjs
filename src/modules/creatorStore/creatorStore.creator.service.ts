import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreatorStore,
  CreatorStoreDocument,
} from '../../schemas/creatorStore.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { MediaService } from '../media/media.service';
import { HistoryService } from '../history/history.service';
import { getMessage } from '../../common/utils/translator';
import { checkRequiredPermissions } from '../../common/utils/permission-check.utils';
import { Permission } from '../../enums/permission.enum';
import { UserRole } from '../../enums/user-role.enum';
import { Modules } from '../../enums/appModules.enum';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/logAction.enum';
import { MEDIA_CONFIG } from '../../configs/media.config';
import { BaseResponse, DataResponse } from '../../types/service-response.type';
import {
  CreatorStoreStatus,
  SUBMITTABLE_STORE_STATUSES,
} from '../../enums/creatorStoreStatus.enum';
import { CreateCreatorStoreDto } from './dto/create-store.dto';
import { EmailTemplates } from '../../enums/emailTemplates.enum';
import { CreatorStoreSharedService } from './creatorStore.shared.service';
import { Locale as LocaleEnum } from '../../enums/locale.enum';
import { Locale } from '../../types/Locale';
import {
  HandleAvailabilityResult,
  HandleChangeResult,
} from '../../types/creators/creator-store.types';
import { ChangeHandleDto } from './dto/handle.dto';
import { validationConfig } from '../../configs/validationConfig';
import { PreferredLanguage } from '../../enums/preferredLanguage.enum';
import { UpdateCreatorStoreDto } from './dto/update-store.dto';
import { UpdatePayoutInfoDto } from './dto/payout-info.dto';
import { UpdatePickupAddressDto } from './dto/pickup-address.dto';
import { SubmitForReviewDto } from './dto/lifecycle.dto';

const cfg = validationConfig.creatorStore;

const PUBLIC_FIELDS =
  'name slug handle bio tagline logo banner themeColor socialLinks currency ' +
  'minOrderAmount businessType policies status isVerified vacationMode ' +
  'vacationMessage vacationUntil stats isFeatured createdAt';

@Injectable()
export class CreatorStoreCreatorService {
  constructor(
    @InjectModel(CreatorStore.name)
    private readonly storeModel: Model<CreatorStoreDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly mediaService: MediaService,
    private readonly historyService: HistoryService,
    private readonly shared: CreatorStoreSharedService,
  ) {}

  async createStore(
    req: any,
    dto: CreateCreatorStoreDto,
    logo?: Express.Multer.File,
    banner?: Express.Multer.File,
  ): Promise<DataResponse<CreatorStore>> {
    const { lang = LocaleEnum.EN } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_CREATE_OWN],
      lang,
    );

    const dbUser = await this.userModel
      .findById(user?.userId)
      .select('_id role isDeleted isActive isEmailVerified')
      .lean();

    if (
      !dbUser ||
      dbUser.isDeleted ||
      !dbUser.isActive ||
      dbUser.role !== UserRole.CREATOR
    ) {
      throw new ForbiddenException(
        getMessage('creatorStore_ownerNotFoundOrNotCreator', lang),
      );
    }

    const ownerId = new Types.ObjectId(user.userId);

    const existing = await this.storeModel.findOne({ ownerId }).lean();
    if (existing) {
      throw new BadRequestException(
        getMessage('creatorStore_storeAlreadyExists', lang),
      );
    }

    const handle = dto.handle.toLowerCase().trim();
    const handleCheck = await this.shared.resolveHandleAvailability(
      handle,
      null,
      lang,
    );
    if (!handleCheck.available) {
      throw new BadRequestException(handleCheck.message);
    }

    const slug = await this.shared.generateUniqueSlug(dto.name_en);

    let logoPreview: { id: string | null; url: string | null } = {
      id: null,
      url: null,
    };
    if (logo) {
      const uploaded = await this.mediaService.mediaProcessor({
        file: logo,
        reqMsg: 'creatorStore_shouldHaveLogoFile',
        user,
        maxSize: MEDIA_CONFIG.CREATOR_STORE.LOGO.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.CREATOR_STORE.LOGO.ALLOWED_TYPES,
        lang,
        key: Modules.CREATOR_STORE,
        req,
      });
      logoPreview = { id: uploaded.id, url: uploaded.url };
    }

    let bannerPreview: { id: string | null; url: string | null } = {
      id: null,
      url: null,
    };
    if (banner) {
      const uploaded = await this.mediaService.mediaProcessor({
        file: banner,
        reqMsg: 'creatorStore_shouldHaveBannerFile',
        user,
        maxSize: MEDIA_CONFIG.CREATOR_STORE.BANNER.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.CREATOR_STORE.BANNER.ALLOWED_TYPES,
        lang,
        key: Modules.CREATOR_STORE,
        req,
      });
      bannerPreview = { id: uploaded.id, url: uploaded.url };
    }

    const store = await this.storeModel.create({
      ownerId,
      name: { ar: dto.name_ar.trim(), en: dto.name_en.trim() },
      slug,
      handle,
      bio: this.shared.buildTranslated(dto.bio_ar, dto.bio_en),
      tagline: this.shared.buildTranslated(dto.tagline_ar, dto.tagline_en),
      logo: logoPreview,
      banner: bannerPreview,
      themeColor: dto.themeColor ?? null,
      countryCode: dto.countryCode ?? null,
      phone: dto.phone ?? null,
      email: dto.email ? dto.email.toLowerCase().trim() : null,
      socialLinks: this.shared.buildSocialLinks(dto),
      currency: dto.currency ?? undefined,
      commissionRate: this.shared.defaultCommissionRate,
      minOrderAmount: dto.minOrderAmount ?? 0,
      businessType: dto.businessType ?? undefined,
      registrationNumber: dto.registrationNumber ?? null,
      taxId: dto.taxId ?? null,
      isVerified: Boolean(dbUser?.isEmailVerified),
      verifiedAt: dbUser?.isEmailVerified ? new Date() : null,
      status: CreatorStoreStatus.DRAFT,
      createdBy: ownerId,
    });

    // Notify the creator (email).
    const ownerContact = await this.shared.loadOwnerContact(ownerId);
    if (ownerContact) {
      this.shared.notifyOwner(
        ownerContact,
        EmailTemplates.CREATOR_STORE_CREATED,
        {
          storeName: this.shared.localizedName(
            store.name,
            ownerContact.prefLang,
          ),
          storeHandle: store.handle,
          storeUrl: this.shared.storePublicUrl(
            store.handle,
            ownerContact.prefLang,
          ),
          dashboardUrl: this.shared.storeDashboardUrl(ownerContact.prefLang),
          statusLabel: this.shared.storeStatusLabel(
            store.status,
            ownerContact.prefLang,
          ),
        },
      );
    }

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.CREATE,
      user?.userId,
      null,
      { storeId: store._id, handle: store.handle, name: store.name },
    );

    return {
      isSuccess: true,
      message: getMessage('creatorStore_storeCreatedSuccessfully', lang),
      data: this.shared.presentForOwner(store.toObject()),
    };
  }

  async checkHandleAvailability(
    user: any,
    rawHandle: string,
    lang: Locale = LocaleEnum.EN,
  ): Promise<DataResponse<HandleAvailabilityResult>> {
    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const handle = rawHandle.toLowerCase().trim();

    const store = await this.storeModel
      .findOne({ ownerId: new Types.ObjectId(user.userId) })
      .select('_id')
      .lean();

    const check = await this.shared.resolveHandleAvailability(
      handle,
      store?._id ?? null,
      lang,
    );

    return {
      isSuccess: true,
      message: getMessage('creatorStore_handleAvailabilityChecked', lang),
      data: { handle, ...check },
    };
  }

  async getMyStore(
    user: any,
    lang: Locale = 'en',
  ): Promise<DataResponse<CreatorStore>> {
    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_READ_OWN],
      lang,
    );

    const store = await this.storeModel
      .findOne({ ownerId: new Types.ObjectId(user.userId) })
      .select('+payoutInfo +taxId +registrationNumber')
      .lean();

    if (!store) {
      throw new NotFoundException(
        getMessage('creatorStore_storeNotFound', lang),
      );
    }

    const userDoc = await this.userModel
      .findById(user.userId)
      .select('isEmailVerified')
      .lean();

    const presented = this.shared.presentForOwner(store);
    presented.isEmailVerified = userDoc?.isEmailVerified ?? false;

    return {
      isSuccess: true,
      message: getMessage('creatorStore_storeRetrievedSuccessfully', lang),
      data: presented,
    };
  }

  async changeHandle(
    req: any,
    dto: ChangeHandleDto,
  ): Promise<DataResponse<HandleChangeResult>> {
    const { lang = LocaleEnum.EN } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const store = await this.shared.getOwnStoreDoc(user.userId, lang);
    if (store.isDeleted) {
      throw new BadRequestException(
        getMessage('creatorStore_cannotUpdateDeletedStore', lang),
      );
    }

    const handle = dto.handle.toLowerCase().trim();
    if (handle === store.handle) {
      throw new BadRequestException(
        getMessage('creatorStore_handleUnchanged', lang),
      );
    }

    // DRAFT stores rename freely; the cooldown only applies once live.
    const isDraft = store.status === CreatorStoreStatus.DRAFT;

    if (!isDraft && store.handleChangedAt) {
      const nextAllowed = this.shared.handleCooldownEndsAt(
        store.handleChangedAt,
      );

      if (nextAllowed.getTime() > Date.now()) {
        throw new BadRequestException({
          isSuccess: false,
          message: getMessage(
            'creatorStore_handleChangeCooldown',
            lang,
          ).replace('{days}', String(cfg.handleChangeCooldownDays)),
          details: {
            nextChangeAllowedAt: nextAllowed.toISOString(),
            cooldownDays: cfg.handleChangeCooldownDays,
          },
        });
      }
    }

    const check = await this.shared.resolveHandleAvailability(
      handle,
      store._id,
      lang,
    );
    if (!check.available) {
      throw new BadRequestException(check.message);
    }

    const previousHandle = store.handle ?? null;
    const now = new Date();

    if (!isDraft && previousHandle) {
      store.previousHandles.push({ handle: previousHandle, changedAt: now });
      const overflow = store.previousHandles.length - cfg.handleHistoryLimit;
      if (overflow > 0) store.previousHandles.splice(0, overflow);
    }

    store.handle = handle;
    store.updatedBy = new Types.ObjectId(user.userId) as any;
    if (!isDraft) {
      store.handleChangedAt = now;
      store.handleChangeCount = (store.handleChangeCount ?? 0) + 1;
    }
    await store.save();

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.UPDATE,
      user?.userId,
      'handle_changed',
      { storeId: store._id, from: previousHandle, to: handle },
    );

    // Notify the owner (email)
    const ownerContact = await this.shared.loadOwnerContact(store.ownerId);

    if (ownerContact) {
      const ar = ownerContact.prefLang === PreferredLanguage.ARABIC;

      let nextChangeText: string;

      if (isDraft || !store.handleChangedAt) {
        nextChangeText = getMessage(
          'creatorStore_handleNextChangeDraft',
          ar ? 'ar' : 'en',
        );
      } else {
        const when = this.shared.formatEmailDate(
          this.shared.handleCooldownEndsAt(store.handleChangedAt),
          ownerContact.prefLang,
        );
        nextChangeText = getMessage(
          'creatorStore_handleNextChangeCooldown',
          ar ? 'ar' : 'en',
        )
          .replace('{days}', String(cfg.handleChangeCooldownDays))
          .replace('{date}', when);
      }

      this.shared.notifyOwner(
        ownerContact,
        EmailTemplates.CREATOR_STORE_HANDLE_CHANGED,
        {
          storeName: this.shared.localizedName(
            store.name,
            ownerContact.prefLang,
          ),
          oldHandle: previousHandle ?? '—',
          newHandle: handle,
          newStoreUrl: this.shared.storePublicUrl(
            handle,
            ownerContact.prefLang,
          ),
          nextChangeText,
          changedAt: this.shared.formatEmailDate(now, ownerContact.prefLang),
          dashboardUrl: this.shared.storeDashboardUrl(ownerContact.prefLang),
        },
      );
    }

    const nextChangeAllowedAt =
      !isDraft && store.handleChangedAt
        ? this.shared.handleCooldownEndsAt(store.handleChangedAt).toISOString()
        : null;

    return {
      isSuccess: true,
      message: getMessage('creatorStore_handleChangedSuccessfully', lang),
      data: {
        handle: store.handle,
        previousHandle,
        handleChangedAt: (store.handleChangedAt ?? now).toISOString(),
        nextChangeAllowedAt,
        changeCount: store.handleChangeCount ?? 0,
        cooldownDays: cfg.handleChangeCooldownDays,
      },
    };
  }

  async updateStore(
    req: any,
    dto: UpdateCreatorStoreDto,
  ): Promise<DataResponse<CreatorStore>> {
    const { lang = 'en' } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const store = await this.shared.getOwnStoreDoc(user.userId, lang);
    if (store.isDeleted) {
      throw new BadRequestException(
        getMessage('creatorStore_cannotUpdateDeletedStore', lang),
      );
    }

    const before = store.toObject();
    const set: Record<string, any> = {
      updatedBy: new Types.ObjectId(user.userId),
    };

    // --- Name / slug ---
    if (dto.name_ar !== undefined || dto.name_en !== undefined) {
      const name = {
        ar: dto.name_ar?.trim() || store.name.ar,
        en: dto.name_en?.trim() || store.name.en,
      };
      set.name = name;
      if (dto.name_en !== undefined && name.en !== store.name.en) {
        set.slug = await this.shared.generateUniqueSlug(
          name.en,
          store._id as Types.ObjectId,
        );
      }
    }

    // --- Translated blurbs ---
    if (dto.bio_ar !== undefined || dto.bio_en !== undefined) {
      set.bio = {
        ar: dto.bio_ar ?? store.bio?.ar ?? null,
        en: dto.bio_en ?? store.bio?.en ?? null,
      };
    }
    if (dto.tagline_ar !== undefined || dto.tagline_en !== undefined) {
      set.tagline = {
        ar: dto.tagline_ar ?? store.tagline?.ar ?? null,
        en: dto.tagline_en ?? store.tagline?.en ?? null,
      };
    }

    // --- Scalars ---
    if (dto.themeColor !== undefined) set.themeColor = dto.themeColor || null;
    if (dto.countryCode !== undefined)
      set.countryCode = dto.countryCode || null;
    if (dto.phone !== undefined) set.phone = dto.phone || null;
    if (dto.email !== undefined) {
      set.email = dto.email ? dto.email.toLowerCase().trim() : null;
    }
    if (dto.currency !== undefined) set.currency = dto.currency;
    if (dto.minOrderAmount !== undefined)
      set.minOrderAmount = dto.minOrderAmount;
    if (dto.businessType !== undefined) set.businessType = dto.businessType;
    if (dto.registrationNumber !== undefined) {
      set.registrationNumber = dto.registrationNumber || null;
    }
    if (dto.taxId !== undefined) set.taxId = dto.taxId || null;

    // --- Social links (dotted paths so we never clobber siblings) ---
    Object.entries(this.shared.socialDtoToMap(dto)).forEach(([k, v]) => {
      if (v !== undefined) set[`socialLinks.${k}`] = v === '' ? null : v;
    });

    // --- Policies ---
    if (
      dto.policy_return_ar !== undefined ||
      dto.policy_return_en !== undefined
    ) {
      set['policies.returnPolicy'] = {
        ar: dto.policy_return_ar ?? store.policies?.returnPolicy?.ar ?? null,
        en: dto.policy_return_en ?? store.policies?.returnPolicy?.en ?? null,
      };
    }
    if (
      dto.policy_shipping_ar !== undefined ||
      dto.policy_shipping_en !== undefined
    ) {
      set['policies.shippingPolicy'] = {
        ar:
          dto.policy_shipping_ar ?? store.policies?.shippingPolicy?.ar ?? null,
        en:
          dto.policy_shipping_en ?? store.policies?.shippingPolicy?.en ?? null,
      };
    }
    if (
      dto.policy_exchange_ar !== undefined ||
      dto.policy_exchange_en !== undefined
    ) {
      set['policies.exchangePolicy'] = {
        ar:
          dto.policy_exchange_ar ?? store.policies?.exchangePolicy?.ar ?? null,
        en:
          dto.policy_exchange_en ?? store.policies?.exchangePolicy?.en ?? null,
      };
    }
    if (dto.policy_returnWindowDays !== undefined) {
      set['policies.returnWindowDays'] = dto.policy_returnWindowDays;
    }
    if (dto.policy_processingTimeDays !== undefined) {
      set['policies.processingTimeDays'] = dto.policy_processingTimeDays;
    }

    const updated = await this.storeModel
      .findByIdAndUpdate(store._id, { $set: set }, { new: true })
      .select('+payoutInfo +taxId +registrationNumber')
      .lean();

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.UPDATE,
      user?.userId,
      null,
      { storeId: store._id, before, after: updated },
    );

    // Notify the creator of what changed (contact + financial fields shown in full).
    const ownerContact = await this.shared.loadOwnerContact(store.ownerId);
    if (ownerContact) {
      const { rows, count } = this.shared.buildStoreChangeRows(
        before,
        set,
        ownerContact.prefLang,
      );
      if (count > 0) {
        this.shared.notifyOwner(
          ownerContact,
          EmailTemplates.CREATOR_STORE_UPDATED,
          {
            storeName: this.shared.localizedName(
              updated?.name ?? store.name,
              ownerContact.prefLang,
            ),
            changesRows: rows,
            changedAt: this.shared.formatEmailDate(
              new Date(),
              ownerContact.prefLang,
            ),
            dashboardUrl: this.shared.storeDashboardUrl(ownerContact.prefLang),
          },
        );
      }
    }

    return {
      isSuccess: true,
      message: getMessage('creatorStore_storeUpdatedSuccessfully', lang),
      data: this.shared.presentForOwner(updated),
    };
  }

  async updatePayoutInfo(
    req: any,
    dto: UpdatePayoutInfoDto,
  ): Promise<DataResponse<CreatorStore>> {
    const { lang = 'en' } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const store = await this.shared.getOwnStoreDoc(user.userId, lang);
    if (store.isDeleted) {
      throw new BadRequestException(
        getMessage('creatorStore_cannotUpdateDeletedStore', lang),
      );
    }

    const before = store.toObject();
    const set: Record<string, any> = {
      updatedBy: new Types.ObjectId(user.userId),
    };

    const fields: Record<string, unknown> = {
      method: dto.method,
      currency: dto.currency,
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      iban: dto.iban,
      accountNumber: dto.accountNumber,
      swiftCode: dto.swiftCode,
      cliqAlias: dto.cliqAlias,
      walletProvider: dto.walletProvider,
      walletNumber: dto.walletNumber,
    };

    Object.entries(fields).forEach(([k, v]) => {
      if (v === undefined) return;
      if (k === 'method' || k === 'currency') {
        // Enum values: store verbatim, no trimming.
        set[`payoutInfo.${k}`] = v;
      } else if (k === 'iban') {
        set['payoutInfo.iban'] = v
          ? String(v).replace(/\s+/g, '').toUpperCase()
          : null;
      } else {
        set[`payoutInfo.${k}`] = v === '' ? null : String(v).trim();
      }
    });

    // Submitting payout details always clears the admin's confirmation.
    set['payoutInfo.isConfirmed'] = false;
    set['payoutInfo.confirmedAt'] = null;
    set['payoutInfo.confirmedBy'] = null;

    const updated = await this.storeModel
      .findByIdAndUpdate(store._id, { $set: set }, { new: true })
      .select('+payoutInfo +taxId +registrationNumber')
      .lean();

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.UPDATE,
      user?.userId,
      'payout_info_updated',
      { storeId: store._id },
    );

    const ownerContact = await this.shared.loadOwnerContact(store.ownerId);
    if (ownerContact) {
      const { rows, count } = this.shared.buildStoreChangeRows(
        before,
        set,
        ownerContact.prefLang,
      );
      if (count > 0) {
        this.shared.notifyOwner(
          ownerContact,
          EmailTemplates.CREATOR_STORE_UPDATED,
          {
            storeName: this.shared.localizedName(
              updated?.name ?? store.name,
              ownerContact.prefLang,
            ),
            changesRows: rows,
            changedAt: this.shared.formatEmailDate(
              new Date(),
              ownerContact.prefLang,
            ),
            dashboardUrl: this.shared.storeDashboardUrl(ownerContact.prefLang),
          },
        );
      }
    }

    return {
      isSuccess: true,
      message: getMessage('creatorStore_payoutInfoUpdatedSuccessfully', lang),
      data: this.shared.presentForOwner(updated),
    };
  }

  async updatePickupAddress(
    req: any,
    dto: UpdatePickupAddressDto,
  ): Promise<DataResponse<CreatorStore>> {
    const { lang = 'en' } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const store = await this.shared.getOwnStoreDoc(user.userId, lang);
    if (store.isDeleted) {
      throw new BadRequestException(
        getMessage('creatorStore_cannotUpdateDeletedStore', lang),
      );
    }

    const before = store.toObject();
    const set: Record<string, any> = {
      updatedBy: new Types.ObjectId(user.userId),
    };

    const fields: Record<string, unknown> = {
      contactName: dto.contactName,
      phone: dto.phone,
      countryCode: dto.countryCode,
      country: dto.country,
      city: dto.city,
      town: dto.town,
      street: dto.street,
      building: dto.building,
      additionalInfo: dto.additionalInfo,
      'location.lat': dto.lat,
      'location.lng': dto.lng,
      'location.name': dto.locationName,
    };

    Object.entries(fields).forEach(([k, v]) => {
      if (v === undefined) return;
      if (k === 'location.lat' || k === 'location.lng') {
        set[`pickupAddress.${k}`] = v;
      } else {
        set[`pickupAddress.${k}`] = v === '' ? null : String(v).trim();
      }
    });

    const updated = await this.storeModel
      .findByIdAndUpdate(store._id, { $set: set }, { new: true })
      .select('+payoutInfo +taxId +registrationNumber')
      .lean();

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.UPDATE,
      user?.userId,
      'pickup_address_updated',
      { storeId: store._id },
    );

    const ownerContact = await this.shared.loadOwnerContact(store.ownerId);
    if (ownerContact) {
      const { rows, count } = this.shared.buildStoreChangeRows(
        before,
        set,
        ownerContact.prefLang,
      );
      if (count > 0) {
        this.shared.notifyOwner(
          ownerContact,
          EmailTemplates.CREATOR_STORE_UPDATED,
          {
            storeName: this.shared.localizedName(
              updated?.name ?? store.name,
              ownerContact.prefLang,
            ),
            changesRows: rows,
            changedAt: this.shared.formatEmailDate(
              new Date(),
              ownerContact.prefLang,
            ),
            dashboardUrl: this.shared.storeDashboardUrl(ownerContact.prefLang),
          },
        );
      }
    }

    return {
      isSuccess: true,
      message: getMessage(
        'creatorStore_pickupAddressUpdatedSuccessfully',
        lang,
      ),
      data: this.shared.presentForOwner(updated),
    };
  }

  async getPublicStoreByHandle(
    handle: string,
    lang: Locale = 'en',
  ): Promise<DataResponse<CreatorStore>> {
    const store = await this.storeModel
      .findOne({
        handle: handle.toLowerCase(),
        status: CreatorStoreStatus.ACTIVE,
        isActive: true,
        isDeleted: false,
      })
      .select(PUBLIC_FIELDS)
      .lean();

    if (!store) {
      throw new NotFoundException(
        getMessage('creatorStore_storeNotPubliclyAvailable', lang),
      );
    }

    // Fire-and-forget view counter.
    this.storeModel
      .updateOne(
        { _id: store._id },
        { $inc: { 'stats.viewCount': 1, 'stats.weeklyViewCount': 1 } },
      )
      .catch(() => undefined);

    return {
      isSuccess: true,
      message: getMessage('creatorStore_storeRetrievedSuccessfully', lang),
      data: store,
    };
  }

  async submitForReview(
    req: any,
    dto: SubmitForReviewDto,
  ): Promise<BaseResponse> {
    const { lang = 'en' } = dto;
    const user = req?.user;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORE_UPDATE_OWN],
      lang,
    );

    const userDoc = await this.userModel
      .findById(user.userId)
      .select('isEmailVerified email');

    if (!userDoc) {
      throw new NotFoundException(
        getMessage('authentication_userNotFound', lang),
      );
    }

    if (!userDoc.isEmailVerified) {
      throw new BadRequestException({
        isSuccess: false,
        message: getMessage('creatorStore_emailMustBeVerifiedToSubmit', lang),
        errorCode: 'EMAIL_NOT_VERIFIED',
      });
    }

    const store = await this.shared.getOwnStoreDoc(user.userId, lang, true);

    if (!SUBMITTABLE_STORE_STATUSES.includes(store.status)) {
      throw new BadRequestException(
        getMessage('creatorStore_cannotSubmitFromCurrentStatus', lang),
      );
    }

    const missing = this.shared.collectMissingForReview(store);
    if (missing.length) {
      throw new BadRequestException({
        isSuccess: false,
        message: getMessage('creatorStore_incompleteProfileForReview', lang),
        details: missing,
      });
    }

    store.status = CreatorStoreStatus.PENDING_REVIEW;
    store.submittedForReviewAt = new Date();
    store.statusReason = null;
    store.updatedBy = new Types.ObjectId(user.userId) as any;
    await store.save();

    // Logging
    await this.historyService.log(
      LogModule.CREATOR_STORE,
      LogAction.UPDATE,
      user?.userId,
      'submit_for_review',
      { storeId: store._id, status: store.status },
    );

    return {
      isSuccess: true,
      message: getMessage('creatorStore_submittedForReviewSuccessfully', lang),
    };
  }
}
