import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MediaService } from '../media/media.service';

import { Banner, BannerDocument } from 'src/schemas/banner.schema';
import {
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Locale } from 'src/types/Locale';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';

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

  async getActiveOne(lang?: Locale): Promise<DataResponse<Banner>> {
    const banner = await this.bannerModel
      .findOne({ isActive: true, isDeleted: false })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!banner) {
      throw new NotFoundException(getMessage('banner_noActiveBannerFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('banner_activeBannerRetrievedSuccessfully', lang),
      data: banner,
    };
  }
}
