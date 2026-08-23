import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaService } from '../media/media.service';
import { HistoryService } from '../history/history.service';
import {
  CreatorsVideo,
  CreatorsVideoDocument,
} from '../../schemas/creatorsVideo.schema';
import { CreateCreatorsVideoDto } from './dto/create-video.dto';
import { UpdateCreatorsVideoDto } from './dto/update-video.dto';
import { GetCreatorsVideosQueryDto } from './dto/get-all-videos.dto';
import { DeleteCreatorsVideoDto } from './dto/delete-video.dto';
import { UnDeleteCreatorsVideoBodyDto } from './dto/unDelete-video.dto';
import { Locale } from '../../types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { checkRequiredPermissions } from '../../common/utils/permission-check.utils';
import { Permission } from '../../enums/permission.enum';
import { getMessage } from '../../common/utils/translator';
import { MEDIA_CONFIG } from '../../configs/media.config';
import { Modules } from '../../enums/appModules.enum';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/logAction.enum';
import { CreatorsVideoType } from '../../enums/creatorsVideoType.enum';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(CreatorsVideo.name)
    private creatorsVideoModel: Model<CreatorsVideoDocument>,
    private mediaService: MediaService,
    private historyService: HistoryService,
  ) {}

  async getAllVideos(
    requestingUser: any,
    params: GetCreatorsVideosQueryDto,
  ): Promise<DataListResponse<CreatorsVideo>> {
    const { lang = 'en', limit = 10, lastId, search, type } = params;

    validateUserRoleAccess(requestingUser, lang);
    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.CREATORS_VIDEOS_READ],
      lang,
    );

    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ 'title.ar': searchRegex }, { 'title.en': searchRegex }];
    }

    const videos = await this.creatorsVideoModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message:
        getMessage('creators_videosRetrievedSuccessfully', lang) ||
        'Videos retrieved successfully',
      dataCount: videos.length,
      data: videos as any,
    };
  }

  async getActiveVideos(
    lang: Locale = 'en',
    type?: CreatorsVideoType,
  ): Promise<DataResponse<CreatorsVideo[]>> {
    const query: any = { isActive: true, isDeleted: false };
    if (type) {
      query.type = type;
    }
    const videos = await this.creatorsVideoModel
      .find(query)
      .sort({ _id: -1 })
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message:
        getMessage('creators_activeVideosRetrievedSuccessfully', lang) ||
        'Active videos retrieved successfully',
      data: videos as any,
    };
  }

  async getVideo(
    id: string,
    requestingUser: any,
    lang: Locale = 'en',
  ): Promise<DataResponse<CreatorsVideo>> {
    validateUserRoleAccess(requestingUser, lang);
    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.CREATORS_VIDEOS_READ],
      lang,
    );

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('creators_invalidVideoId', lang) || 'Invalid video ID',
      );
    }

    const video = await this.creatorsVideoModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .lean();

    if (!video || video.isDeleted) {
      throw new NotFoundException(
        getMessage('creators_videoNotFound', lang) || 'Video not found',
      );
    }

    return {
      isSuccess: true,
      message:
        getMessage('creators_videoRetrievedSuccessfully', lang) ||
        'Video retrieved successfully',
      data: video as any,
    };
  }

  async createVideo(
    req: any,
    dto: CreateCreatorsVideoDto,
    file?: Express.Multer.File,
  ): Promise<DataResponse<CreatorsVideo>> {
    const { lang = 'en', title_ar, title_en, type } = dto;

    validateUserRoleAccess(req?.user, lang);
    checkRequiredPermissions(
      req?.user?.permissions,
      [Permission.CREATORS_VIDEOS_CREATE],
      lang,
    );

    const existingVideo = await this.creatorsVideoModel.findOne({
      isDeleted: false,
      $or: [{ 'title.ar': title_ar }, { 'title.en': title_en }],
    });

    if (existingVideo) {
      throw new BadRequestException(
        getMessage('creators_videoAlreadyExists', lang) ||
          'Video title already exists',
      );
    }

    const mediaObj = await this.mediaService.mediaProcessor({
      file,
      reqMsg: 'creators_shouldHasVideoFile',
      user: req?.user,
      maxSize: MEDIA_CONFIG.CREATORS.VIDEO.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.CREATORS.VIDEO.ALLOWED_TYPES,
      lang,
      key: Modules.CREATORS,
      req,
    });

    const video = new this.creatorsVideoModel({
      title: { ar: title_ar, en: title_en },
      type,
      media: {
        id: mediaObj.id,
        url: mediaObj.url,
      },
      createdBy: req?.user?.userId,
      isActive: true,
      isDeleted: false,
    });

    await video.save();

    await this.historyService.log(
      LogModule.CREATORS,
      LogAction.CREATE,
      req?.user?.userId,
      null,
      {
        videoId: video._id,
        title: video.title,
      },
    );

    return {
      isSuccess: true,
      message:
        getMessage('creators_videoCreatedSuccessfully', lang) ||
        'Video created successfully',
      data: video as any,
    };
  }

  async updateVideo(
    req: any,
    dto: UpdateCreatorsVideoDto,
    id: string,
    file?: Express.Multer.File,
  ): Promise<DataResponse<CreatorsVideo>> {
    const { lang = 'en', title_ar, title_en, type } = dto;

    validateUserRoleAccess(req?.user, lang);
    checkRequiredPermissions(
      req?.user?.permissions,
      [Permission.CREATORS_VIDEOS_UPDATE],
      lang,
    );

    const videoToUpdate = await this.creatorsVideoModel.findById(id);
    if (!videoToUpdate || videoToUpdate.isDeleted) {
      throw new NotFoundException(
        getMessage('creators_videoNotFound', lang) || 'Video not found',
      );
    }

    const before = videoToUpdate.toObject();

    const uniqueFields: any[] = [];
    if (title_ar) uniqueFields.push({ 'title.ar': title_ar });
    if (title_en) uniqueFields.push({ 'title.en': title_en });

    if (uniqueFields.length > 0) {
      const existingVideo = await this.creatorsVideoModel.findOne({
        _id: { $ne: id },
        isDeleted: false,
        $or: uniqueFields,
      });

      if (existingVideo) {
        throw new BadRequestException(
          getMessage('creators_videoAlreadyExists', lang) ||
            'Video title already exists',
        );
      }
    }

    const updateData: any = {
      updatedBy: req?.user?.userId,
      updatedAt: new Date(),
    };

    if (type) {
      updateData.type = type;
    }

    if (file) {
      const result = await this.mediaService.hardDeleteAndUpload({
        file,
        user: req?.user,
        reqMsg: 'creators_shouldHasVideoFile',
        maxSize: MEDIA_CONFIG.CREATORS.VIDEO.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.CREATORS.VIDEO.ALLOWED_TYPES,
        lang,
        key: Modules.CREATORS,
        req,
        existingMediaId: videoToUpdate.media?.id,
      });

      updateData.media = {
        id: result.id,
        url: result.url,
      };
    }

    if (title_ar || title_en) {
      updateData.title = {
        ar: title_ar || videoToUpdate.title.ar,
        en: title_en || videoToUpdate.title.en,
      };
    }

    const updatedVideo = await this.creatorsVideoModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );

    await this.historyService.log(
      LogModule.CREATORS,
      LogAction.UPDATE,
      req?.user?.userId,
      null,
      {
        videoId: id,
        before,
        after: updatedVideo.toObject(),
      },
    );

    return {
      isSuccess: true,
      message:
        getMessage('creators_videoUpdatedSuccessfully', lang) ||
        'Video updated successfully',
      data: updatedVideo as any,
    };
  }

  async deleteVideo(
    requestingUser: any,
    body: DeleteCreatorsVideoDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang = 'en' } = body;

    validateUserRoleAccess(requestingUser, lang);
    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.CREATORS_VIDEOS_DELETE],
      lang,
    );

    const video = await this.creatorsVideoModel.findById(id);
    if (!video || video.isDeleted) {
      throw new BadRequestException(
        getMessage('creators_videoNotFound', lang) || 'Video not found',
      );
    }

    if (video.isActive) {
      const activeCount = await this.creatorsVideoModel.countDocuments({
        type: video.type,
        isActive: true,
        isDeleted: false,
      });

      if (activeCount <= 1) {
        throw new BadRequestException(
          getMessage('creators_atLeastOneVideoMustRemainActive', lang),
        );
      }
    }

    video.isDeleted = true;
    video.isActive = false;
    video.deletedAt = new Date();
    video.deletedBy = requestingUser.userId;
    video.unDeletedBy = null;

    await video.save();

    await this.historyService.log(
      LogModule.CREATORS,
      LogAction.DELETE,
      requestingUser.userId,
      null,
      {
        videoId: id,
        title: video.title,
      },
    );

    return {
      isSuccess: true,
      message:
        getMessage('creators_videoDeletedSuccessfully', lang) ||
        'Video deleted successfully',
    };
  }

  async unDeleteVideo(
    requestingUser: any,
    body: UnDeleteCreatorsVideoBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang = 'en' } = body;

    validateUserRoleAccess(requestingUser, lang);
    checkRequiredPermissions(
      requestingUser?.permissions,
      [Permission.CREATORS_VIDEOS_RESTORE],
      lang,
    );

    const video = await this.creatorsVideoModel.findById(id);
    if (!video) {
      throw new BadRequestException(
        getMessage('creators_videoNotFound', lang) || 'Video not found',
      );
    }

    video.isDeleted = false;
    video.deletedAt = null;
    video.deletedBy = null;
    video.unDeletedBy = requestingUser.userId;
    video.unDeletedAt = new Date();

    await video.save();

    await this.historyService.log(
      LogModule.CREATORS,
      LogAction.UNDELETE,
      requestingUser.userId,
      null,
      {
        videoId: id,
        title: video.title,
      },
    );

    return {
      isSuccess: true,
      message:
        getMessage('creators_videoUnDeletedSuccessfully', lang) ||
        'Video un-deleted successfully',
    };
  }

  async updateVideoStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);
    checkRequiredPermissions(
      requestingUser?.permissions,
      [
        isActive
          ? Permission.CREATORS_VIDEOS_ACTIVATE
          : Permission.CREATORS_VIDEOS_DEACTIVATE,
      ],
      lang,
    );

    const video = await this.creatorsVideoModel.findById(id);
    if (!video || video.isDeleted) {
      throw new NotFoundException(
        getMessage('creators_videoNotFound', lang) || 'Video not found',
      );
    }

    if (!isActive && video.isActive) {
      const activeCount = await this.creatorsVideoModel.countDocuments({
        type: video.type,
        isActive: true,
        isDeleted: false,
      });

      if (activeCount <= 1) {
        throw new BadRequestException(
          getMessage('creators_atLeastOneVideoMustRemainActive', lang) ||
            'At least one video of this type must remain active',
        );
      }
    }

    video.isActive = isActive;
    await video.save();

    await this.historyService.log(
      LogModule.CREATORS,
      isActive ? LogAction.ACTIVATE : LogAction.DEACTIVATE,
      requestingUser.userId,
      null,
      { videoId: id, title: video.title },
    );

    return {
      isSuccess: true,
      message:
        getMessage(
          isActive
            ? 'creators_videoActivatedSuccessfully'
            : 'creators_videoDeactivatedSuccessfully',
          lang,
        ) ||
        (isActive
          ? 'Video activated successfully'
          : 'Video deactivated successfully'),
    };
  }
}
