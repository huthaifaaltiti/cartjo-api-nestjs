import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import { UpdateBannerDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UnDeleteDto } from './dto/unDelete.dto';

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

    const query: any = { isDeleted: false };

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

  async getActiveOne(lang?: Locale): Promise<DataResponse<Banner>> {
    const banner = await this.bannerModel
      .findOne({ isActive: true, isDeleted: false })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!banner) {
      throw new NotFoundException(
        getMessage('banner_noActiveBannerFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage('banner_activeBannerRetrievedSuccessfully', lang),
      data: banner,
    };
  }

  async create(
    requestingUser: any,
    dto: CreateBannerDto,
    image?: Express.Multer.File,
  ): Promise<DataResponse<Banner>> {
    const {
      lang,
      label_ar,
      label_en,
      title_ar,
      title_en,
      subTitle_ar,
      subTitle_en,
      ctaBtn_text,
      ctaBtn_link,
      offerDetails_preSalePrice,
      offerDetails_afterSalePrice,
      offerDetails_desc,
    } = dto;

    validateUserRoleAccess(requestingUser, lang);

    let mediaUrl: string | undefined = undefined;
    let mediaId: string | undefined = undefined;

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.BANNER_IMAGE, lang);
      fileTypeValidator(image, ['webp', 'gif'], lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.BANNER,
      );

      if (result?.isSuccess) {
        mediaUrl = result.fileUrl;
        mediaId = result.mediaId;
      }
    }

    const banner = new this.bannerModel({
      label: { ar: label_ar, en: label_en },
      title: { ar: title_ar, en: title_en },
      subTitle: { ar: subTitle_ar, en: subTitle_en },
      ctaBtn: { text: ctaBtn_text, link: ctaBtn_link },
      offerDetails: {
        preSalePrice: offerDetails_preSalePrice,
        afterSalePrice: offerDetails_afterSalePrice,
        desc: offerDetails_desc,
      },
      media: mediaId && mediaUrl ? { id: mediaId, url: mediaUrl } : undefined,
      createdBy: requestingUser?.userId,
      isActive: true,
      isDeleted: false,
    });

    await banner.save();

    return {
      isSuccess: true,
      message: getMessage('banner_bannerCreatedSuccessfully', lang),
      data: banner.toObject(),
    };
  }

  async update(
    requestingUser: any,
    dto: UpdateBannerDto,
    image: Express.Multer.File,
    id: string,
  ): Promise<DataResponse<Banner>> {
    const {
      lang,
      label_ar,
      label_en,
      title_ar,
      title_en,
      subTitle_ar,
      subTitle_en,
      ctaBtn_text,
      ctaBtn_link,
      offerDetails_preSalePrice,
      offerDetails_afterSalePrice,
      offerDetails_desc,
    } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const bannerToUpdate = await this.bannerModel.findById(id);

    if (!bannerToUpdate) {
      throw new NotFoundException(getMessage('banner_bannerNotFound', lang));
    }

    let mediaUrl: string | undefined = bannerToUpdate.media?.url;
    let mediaId: string | undefined = bannerToUpdate.media?.id?.toString();

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.BANNER_IMAGE, lang);
      fileTypeValidator(image, ['webp', 'gif'], lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.BANNER,
      );

      if (result?.isSuccess) {
        mediaUrl = result.fileUrl;
        mediaId = result.mediaId;
      }
    }

    const updateData: Partial<Banner> = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (label_ar || label_en) {
      updateData.label = {
        ar: label_ar ?? bannerToUpdate.label.ar,
        en: label_en ?? bannerToUpdate.label.en,
      };
    }

    if (title_ar || title_en) {
      updateData.title = {
        ar: title_ar ?? bannerToUpdate.title.ar,
        en: title_en ?? bannerToUpdate.title.en,
      };
    }

    if (subTitle_ar || subTitle_en) {
      updateData.subTitle = {
        ar: subTitle_ar ?? bannerToUpdate.subTitle.ar,
        en: subTitle_en ?? bannerToUpdate.subTitle.en,
      };
    }

    if (ctaBtn_text || ctaBtn_link) {
      updateData.ctaBtn = {
        text: ctaBtn_text ?? bannerToUpdate.ctaBtn.text,
        link: ctaBtn_link ?? bannerToUpdate.ctaBtn.link,
      };
    }

    if (
      offerDetails_preSalePrice !== undefined ||
      offerDetails_afterSalePrice !== undefined ||
      offerDetails_desc
    ) {
      updateData.offerDetails = {
        preSalePrice:
          offerDetails_preSalePrice ?? bannerToUpdate.offerDetails.preSalePrice,
        afterSalePrice:
          offerDetails_afterSalePrice ??
          bannerToUpdate.offerDetails.afterSalePrice,
        desc: offerDetails_desc ?? bannerToUpdate.offerDetails.desc,
      };
    }

    if (mediaUrl && mediaId && mediaUrl !== bannerToUpdate.media?.url) {
      updateData.media = {
        id: new Types.ObjectId(mediaId),
        url: mediaUrl,
      };
    }

    const updatedBanner = await this.bannerModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
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

    // if (isActive) {
    //   // Deactivate all other banners
    //   await this.bannerModel.updateMany(
    //     { _id: { $ne: id } },
    //     {
    //       $set: {
    //         isActive: false,
    //         isDeleted: false,
    //         deletedAt: null,
    //       },
    //     },
    //   );

    //   // Activate current banner
    //   banner.isActive = true;
    //   banner.isDeleted = false;
    //   banner.deletedAt = null;
    // } else {
    //   // Deactivate current banner
    //   banner.isActive = false;
    // }

    banner.isActive = isActive;

    await banner.save();

    // Activate default banner if all are inactive
    await activateDefaultIfAllInactive(this.bannerModel, this.defaultBannerId);

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'banner_bannerActivatedSuccessfully'
          : 'banner_bannerDeactivatedSuccessfully',
        lang,
      ),
    };
  }
}
