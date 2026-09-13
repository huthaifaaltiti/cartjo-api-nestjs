import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import {
  CreatorStore,
  CreatorStoreDocument,
} from '../../schemas/creatorStore.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { validationConfig } from '../../configs/validationConfig';
import { CreatorStoreStatus } from '../../enums/creatorStoreStatus.enum';
import { EmailService } from '../email/email.service';
import { EmailTemplates } from '../../enums/emailTemplates.enum';
import { PreferredLanguage } from '../../enums/preferredLanguage.enum';
import commonEmailTemplateData from '../../common/utils/commonEmailTemplateData';
import { getAppUrl } from '../../common/utils/getAppUrl';
import { HandleAvailability } from '../../enums/handleAvailability.enum';
import { PayoutMethod } from '../../enums/payoutMethod.enum';
import { getMessage } from '../../common/utils/translator';
import { Locale } from '../../types/Locale';
import { Locale as LocaleEnum } from '../../enums/locale.enum';
import { AppConfigService } from '../appConfig/appConfig.service';
import {
  HandleAvailabilityCheck,
  StoreOwnerContact,
} from '../../types/creators/creator-store.types';

const cfg = validationConfig.creatorStore;

const HANDLE_REASON_MESSAGE_KEYS: Record<HandleAvailability, string> = {
  [HandleAvailability.AVAILABLE]: 'creatorStore_handleAvailable',
  [HandleAvailability.INVALID]: 'creatorStore_handleInvalid',
  [HandleAvailability.CURRENT]: 'creatorStore_handleCurrent',
  [HandleAvailability.TAKEN]: 'creatorStore_handleTaken',
  [HandleAvailability.RESERVED]: 'creatorStore_handleReserved',
  [HandleAvailability.RECENTLY_RELEASED]: 'creatorStore_handleRecentlyReleased',
};

@Injectable()
export class CreatorStoreSharedService {
  private readonly logger = new Logger(CreatorStoreSharedService.name);

  constructor(
    @InjectModel(CreatorStore.name)
    private readonly storeModel: Model<CreatorStoreDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {}

  get handleChangeCooldownDays(): number {
    return (
      this.appConfigService.config.handleChangeCooldownDays ??
      cfg.handleChangeCooldownDays
    );
  }

  get defaultCommissionRate(): number {
    return (
      this.appConfigService.config.defaultCreatorStoreCommissionRate ??
      cfg.defaultCommissionRate
    );
  }

  async resolveHandleAvailability(
    handle: string,
    exceptId: Types.ObjectId | unknown,
    lang: Locale = LocaleEnum.EN,
  ): Promise<HandleAvailabilityCheck> {
    const reason = await this.classifyHandle(handle, exceptId);
    return {
      reason,
      available: reason === HandleAvailability.AVAILABLE,
      message: getMessage(HANDLE_REASON_MESSAGE_KEYS[reason], lang),
    };
  }

  private isValidHandleFormat(handle: string): boolean {
    if (
      handle.length < cfg.handleMinChars ||
      handle.length > cfg.handleMaxChars
    ) {
      return false;
    }
    if (!cfg.handlePattern.test(handle)) return false;
    if (/[-_]{2,}/.test(handle)) return false;
    if (/^\d+$/.test(handle)) return false;
    return true;
  }

  private async classifyHandle(
    handle: string,
    exceptId: Types.ObjectId | unknown,
  ): Promise<HandleAvailability> {
    const normalizedHandle = handle.trim().toLowerCase();

    if (!this.isValidHandleFormat(normalizedHandle)) {
      return HandleAvailability.INVALID;
    }

    const holder = await this.storeModel
      .findOne({ handle: normalizedHandle })
      .select('_id')
      .lean();

    if (holder) {
      return String(holder._id) === String(exceptId)
        ? HandleAvailability.CURRENT
        : HandleAvailability.TAKEN;
    }

    if ((cfg.reservedHandles as string[]).includes(normalizedHandle)) {
      return HandleAvailability.RESERVED;
    }

    const cutoff = new Date(
      Date.now() - this.handleChangeCooldownDays * 24 * 60 * 60 * 1000,
    );

    const releasedElsewhere = await this.storeModel
      .findOne({
        _id: { $ne: exceptId },
        previousHandles: {
          $elemMatch: { handle: normalizedHandle, changedAt: { $gte: cutoff } },
        },
      })
      .select('_id')
      .lean();

    if (releasedElsewhere) return HandleAvailability.RECENTLY_RELEASED;

    return HandleAvailability.AVAILABLE;
  }

  async generateUniqueSlug(
    nameEn: string,
    exceptId?: Types.ObjectId,
  ): Promise<string> {
    const base =
      slugify(nameEn ?? '', { lower: true, strict: true }) || 'store';
    let slug = base;
    let n = 1;
    // eslint-disable-next-line no-await-in-loop
    while (
      await this.storeModel.exists({
        slug,
        ...(exceptId ? { _id: { $ne: exceptId } } : {}),
      })
    ) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  buildTranslated(
    ar?: string,
    en?: string,
  ): { ar: string | null; en: string | null } | null {
    if (ar === undefined && en === undefined) return null;
    return { ar: ar ?? null, en: en ?? null };
  }

  socialDtoToMap(dto: Record<string, any>): Record<string, string | undefined> {
    return {
      instagram: dto.social_instagram,
      facebook: dto.social_facebook,
      tiktok: dto.social_tiktok,
      youtube: dto.social_youtube,
      x: dto.social_x,
      snapchat: dto.social_snapchat,
      whatsapp: dto.social_whatsapp,
      telegram: dto.social_telegram,
      website: dto.social_website,
    };
  }

  buildSocialLinks(dto: Record<string, any>): Record<string, string | null> {
    const out: Record<string, string | null> = {};
    Object.entries(this.socialDtoToMap(dto)).forEach(([k, v]) => {
      if (v !== undefined) out[k] = v === '' ? null : String(v).trim();
    });
    return out;
  }

  async loadOwnerContact(
    ownerId: Types.ObjectId | string | unknown,
  ): Promise<StoreOwnerContact | null> {
    const owner = await this.userModel
      .findById(ownerId as string)
      .select('email firstName preferredLang')
      .lean();
    if (!owner?.email) return null;
    return {
      email: owner.email,
      firstName: owner.firstName ?? '',
      prefLang:
        (owner.preferredLang as PreferredLanguage) ?? PreferredLanguage.ARABIC,
    };
  }

  notifyOwner(
    contact: StoreOwnerContact,
    templateName: EmailTemplates,
    data: Record<string, any>,
  ): void {
    Promise.resolve(
      this.emailService.sendTemplateEmail({
        to: contact.email,
        templateName,
        templateData: {
          firstName: contact.firstName,
          ...data,
          ...commonEmailTemplateData(),
        },
        prefLang: contact.prefLang,
      }),
    ).catch(err =>
      this.logger.error(
        `Failed to send ${templateName} to ${contact.email}: ${
          (err as Error)?.message
        }`,
      ),
    );
  }

  localizedName(name: any, prefLang: PreferredLanguage): string {
    return name?.[prefLang] ?? name?.en ?? name?.ar ?? '';
  }

  storePublicUrl(handle: string, prefLang: PreferredLanguage): string {
    return `${getAppUrl()}/${prefLang}/@${handle}`;
  }

  storeDashboardUrl(prefLang: PreferredLanguage): string {
    return `${getAppUrl()}/${prefLang}/creators/dashboard/store`;
  }

  storeStatusLabel(
    status: CreatorStoreStatus,
    prefLang: PreferredLanguage,
  ): string {
    const ar = prefLang === PreferredLanguage.ARABIC;
    const map: Record<CreatorStoreStatus, [string, string]> = {
      [CreatorStoreStatus.DRAFT]: ['Draft', 'مسودة'],
      [CreatorStoreStatus.PENDING_REVIEW]: ['Pending review', 'قيد المراجعة'],
      [CreatorStoreStatus.ACTIVE]: ['Active', 'نشط'],
      [CreatorStoreStatus.REJECTED]: ['Rejected', 'مرفوض'],
      [CreatorStoreStatus.SUSPENDED]: ['Suspended', 'موقوف'],
      [CreatorStoreStatus.CLOSED]: ['Closed', 'مغلق'],
    };
    const [en, arLabel] = map[status] ?? [status, status];
    return ar ? arLabel : en;
  }

  presentForOwner(store: any): any {
    if (!store) return store;
    // Owner may see their own payout / tax details but not admin-only notes.
    delete store.internalNotes;
    return store;
  }

  async getOwnStoreDoc(
    userId: string,
    lang: Locale,
    withSensitive = false,
  ): Promise<CreatorStoreDocument> {
    const query = this.storeModel.findOne({
      ownerId: new Types.ObjectId(userId),
    });
    if (withSensitive) {
      query.select('+payoutInfo +taxId +registrationNumber');
    }
    const store = await query.exec();
    if (!store) {
      throw new NotFoundException(
        getMessage('creatorStore_storeNotFound', lang),
      );
    }
    return store;
  }

  handleCooldownEndsAt(changedAt: Date): Date {
    return new Date(
      changedAt.getTime() + cfg.handleChangeCooldownDays * 24 * 60 * 60 * 1000,
    );
  }

  formatEmailDate(d: Date, prefLang: PreferredLanguage): string {
    try {
      return new Intl.DateTimeFormat(
        prefLang === PreferredLanguage.ARABIC ? 'ar-JO' : 'en-GB',
        { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Amman' },
      ).format(d);
    } catch {
      return d.toISOString();
    }
  }

  //   /**
  //    * Builds the `<tr>` rows for the "store updated" email from the `$set` object
  //    * that `updateStore` / admin actions applied. Contact + financial fields show
  //    * their old → new value; everything else is listed as "Updated".
  //    */
  buildStoreChangeRows(
    before: Record<string, any>,
    set: Record<string, any>,
    prefLang: PreferredLanguage,
  ): { rows: string; count: number } {
    const ar = prefLang === PreferredLanguage.ARABIC;
    const labels: Record<string, [string, string]> = {
      name: ['Store name', 'اسم المتجر'],
      email: ['Contact email', 'البريد الإلكتروني للتواصل'],
      phone: ['Contact phone', 'هاتف التواصل'],
      countryCode: ['Country', 'الدولة'],
      currency: ['Currency', 'العملة'],
      minOrderAmount: ['Minimum order amount', 'الحد الأدنى للطلب'],
      businessType: ['Business type', 'نوع النشاط'],
      registrationNumber: ['Registration number', 'رقم السجل التجاري'],
      taxId: ['Tax ID', 'الرقم الضريبي'],
      themeColor: ['Theme color', 'لون الواجهة'],
      bio: ['Store bio', 'نبذة المتجر'],
      tagline: ['Tagline', 'الشعار النصي'],
      commissionRate: ['Commission rate', 'نسبة العمولة'],
      socialLinks: ['Social links', 'روابط التواصل'],
      policies: ['Store policies', 'سياسات المتجر'],
      payoutInfo: ['Payout & banking details', 'بيانات الحساب البنكي'],
      pickupAddress: ['Pickup address', 'عنوان الاستلام'],
      logo: ['Logo', 'الشعار'],
      banner: ['Banner', 'الغلاف'],
    };
    const showValue = new Set([
      'email',
      'phone',
      'commissionRate',
      'currency',
      'minOrderAmount',
      'countryCode',
    ]);
    const updatedWord = ar ? 'تم التحديث' : 'Updated';

    const seen = new Set<string>();
    const groups: string[] = [];
    for (const rawKey of Object.keys(set)) {
      if (rawKey === 'updatedBy' || rawKey === 'slug') continue;
      const key = rawKey.includes('.') ? rawKey.split('.')[0] : rawKey;
      if (seen.has(key)) continue;
      seen.add(key);
      groups.push(key);
    }
    if (!groups.length) return { rows: '', count: 0 };

    const esc = (v: any) =>
      String(v ?? '—').replace(/[<>&]/g, c =>
        c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;',
      );

    const rows = groups
      .map(key => {
        const [enL, arL] = labels[key] ?? [key, key];
        const label = ar ? arL : enL;
        let change = updatedWord;
        if (showValue.has(key)) {
          const oldV =
            key === 'commissionRate' && before[key] != null
              ? `${before[key]}%`
              : esc(before[key]);
          const newV =
            key === 'commissionRate' && set[key] != null
              ? `${set[key]}%`
              : esc(set[key]);
          change = `${oldV} <span style="color:#8b85b5;">&rarr;</span> <strong>${newV}</strong>`;
        }
        return `<tr><td style="padding:10px 16px;border-top:1px solid #ece9f7;color:#2d2a3d;font-size:14px;">${label}</td><td style="padding:10px 16px;border-top:1px solid #ece9f7;color:#2d2a3d;font-size:14px;">${change}</td></tr>`;
      })
      .join('');

    return { rows, count: groups.length };
  }

  collectMissingForReview(store: CreatorStoreDocument): string[] {
    const missing: string[] = [];

    if (!store.name?.ar || !store.name?.en) missing.push('name');
    if (!store.logo?.url) missing.push('logo');
    if (!store.phone) missing.push('phone');
    if (!store.email) missing.push('email');

    const p = store.pickupAddress;
    if (!p?.city || !p?.street) missing.push('pickupAddress');

    const pay = store.payoutInfo;
    const method = pay?.method ?? PayoutMethod.BANK_TRANSFER;
    const hasPayoutDetails =
      !!pay &&
      ((method === PayoutMethod.BANK_TRANSFER && !!pay.iban) ||
        (method === PayoutMethod.CLIQ && !!pay.cliqAlias) ||
        (method === PayoutMethod.WALLET && !!pay.walletNumber));
    if (!hasPayoutDetails) missing.push('payoutInfo');

    return missing;
  }
}
