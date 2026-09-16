import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreatorStore,
  CreatorStoreDocument,
} from '../../schemas/creatorStore.schema';
import { getMessage } from '../../common/utils/translator';
import { checkRequiredPermissions } from '../../common/utils/permission-check.utils';
import { Permission } from '../../enums/permission.enum';
import {
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { AdminGetStoresQueryDto } from './dto/list.dto';
import { Locale } from '../../enums/locale.enum';
import { LangDto } from './dto/params.dto';
import { CreatorStoreStatus } from '../../enums/creatorStoreStatus.enum';
import { AdminStoreCounts } from '../../types/creators/creator-store.types';

@Injectable()
export class CreatorStoreAdminService {
  constructor(
    @InjectModel(CreatorStore.name)
    private readonly storeModel: Model<CreatorStoreDocument>,
  ) {}

  async adminGetAll(
    user: any,
    query: AdminGetStoresQueryDto,
  ): Promise<DataListResponse<CreatorStore>> {
    const { lang = Locale.EN, limit = '10', lastId, search } = query;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORES_READ],
      lang,
    );

    const q: any = {};

    if (query.status) q.status = query.status;
    if (query.isVerified !== undefined)
      q.isVerified = query.isVerified === 'true';
    if (query.isFeatured !== undefined)
      q.isFeatured = query.isFeatured === 'true';
    if (query.isDeleted !== undefined) q.isDeleted = query.isDeleted === 'true';
    if (query.vacationMode !== undefined) {
      q.vacationMode = query.vacationMode === 'true';
    }
    if (query.ownerId && Types.ObjectId.isValid(query.ownerId)) {
      q.ownerId = new Types.ObjectId(query.ownerId);
    }
    if (lastId && Types.ObjectId.isValid(lastId)) {
      q._id = { $lt: new Types.ObjectId(lastId) };
    }
    if (search) {
      const rx = new RegExp(search, 'i');
      q.$or = [
        { 'name.ar': rx },
        { 'name.en': rx },
        { handle: rx },
        { slug: rx },
      ];
    }

    const stores = await this.storeModel
      .find(q)
      .sort({ _id: -1 })
      .limit(Math.min(Number(limit) || 10, 100))
      .populate('ownerId', 'firstName lastName email _id')
      .populate('verifiedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('creatorStore_storesRetrievedSuccessfully', lang),
      dataCount: stores.length,
      data: stores as any,
    };
  }

  async adminGetCounts(
    user: any,
    query: LangDto,
  ): Promise<DataResponse<AdminStoreCounts>> {
    const { lang = Locale.EN } = query;

    checkRequiredPermissions(
      user?.permissions,
      [Permission.CREATOR_STORES_READ],
      lang,
    );

    const countIf = (condition: any) => ({
      $sum: { $cond: [condition, 1, 0] },
    });

    const [counts] = await this.storeModel.aggregate<AdminStoreCounts>([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          all: { $sum: 1 },
          pending: countIf({
            $eq: ['$status', CreatorStoreStatus.PENDING_REVIEW],
          }),
          approved: countIf({ $eq: ['$status', CreatorStoreStatus.ACTIVE] }),
          suspended: countIf({
            $eq: ['$status', CreatorStoreStatus.SUSPENDED],
          }),
          unverified: countIf({ $ne: ['$isVerified', true] }),
        },
      },
      { $project: { _id: 0 } },
    ]);

    return {
      isSuccess: true,
      message: getMessage(
        'creatorStore_storeCountsRetrievedSuccessfully',
        lang,
      ),
      data: {
        all: counts?.all ?? 0,
        pending: counts?.pending ?? 0,
        approved: counts?.approved ?? 0,
        suspended: counts?.suspended ?? 0,
        unverified: counts?.unverified ?? 0,
      },
    };
  }
}
