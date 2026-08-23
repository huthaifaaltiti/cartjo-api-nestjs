import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatorsService } from './creators.service';
import { GetCreatorsVideosQueryDto } from './dto/get-all-videos.dto';
import {
  GetCreatorsVideoParamDto,
  GetCreatorsVideoQueryDto,
} from './dto/get-one-video.dto';
import { CreateCreatorsVideoDto } from './dto/create-video.dto';
import {
  UpdateCreatorsVideoDto,
  UpdateCreatorsVideoParamsDto,
} from './dto/update-video.dto';
import {
  DeleteCreatorsVideoDto,
  DeleteCreatorsVideoParamsDto,
} from './dto/delete-video.dto';
import {
  UnDeleteCreatorsVideoBodyDto,
  UnDeleteCreatorsVideoParamsDto,
} from './dto/unDelete-video.dto';
import {
  UpdateCreatorsVideoStatusBodyDto,
  UpdateCreatorsVideoStatusParamsDto,
} from './dto/update-video-status.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(ApiPaths.Creators.Root)
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @RequirePermissions(Permission.CREATORS_VIDEOS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.Creators.GetAllVideos)
  async getAllVideos(
    @Query() query: GetCreatorsVideosQueryDto,
    @Request() req: any,
  ) {
    return this.creatorsService.getAllVideos(req.user, query);
  }

  @Get(ApiPaths.Creators.GetActiveVideos)
  async getActiveVideos(@Query() query: GetCreatorsVideoQueryDto) {
    const { lang, type } = query;
    return this.creatorsService.getActiveVideos(lang, type);
  }

  @RequirePermissions(Permission.CREATORS_VIDEOS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.Creators.GetVideo)
  async getVideo(
    @Param() param: GetCreatorsVideoParamDto,
    @Query() query: GetCreatorsVideoQueryDto,
    @Request() req: any,
  ) {
    const { id } = param;
    const { lang } = query;
    return this.creatorsService.getVideo(id, req.user, lang);
  }

  @RequirePermissions(Permission.CREATORS_VIDEOS_CREATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post(ApiPaths.Creators.CreateVideo)
  @UseInterceptors(FileInterceptor('video'))
  async createVideo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateCreatorsVideoDto,
  ) {
    return this.creatorsService.createVideo(req, body, file);
  }

  @RequirePermissions(Permission.CREATORS_VIDEOS_UPDATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.Creators.UpdateVideo)
  @UseInterceptors(FileInterceptor('video'))
  async updateVideo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateCreatorsVideoDto,
    @Param() param: UpdateCreatorsVideoParamsDto,
  ) {
    const { id } = param;
    return this.creatorsService.updateVideo(req, body, id, file);
  }

  @RequirePermissions(Permission.CREATORS_VIDEOS_DELETE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.Creators.DeleteVideo)
  async deleteVideo(
    @Request() req: any,
    @Body() body: DeleteCreatorsVideoDto,
    @Param() param: DeleteCreatorsVideoParamsDto,
  ) {
    const { user } = req;
    const { id } = param;
    return this.creatorsService.deleteVideo(user, body, id);
  }

  @RequirePermissions(Permission.CREATORS_VIDEOS_RESTORE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.Creators.UnDeleteVideo)
  async unDeleteVideo(
    @Request() req: any,
    @Param() param: UnDeleteCreatorsVideoParamsDto,
    @Body() body: UnDeleteCreatorsVideoBodyDto,
  ) {
    const { user } = req;
    const { id } = param;
    return this.creatorsService.unDeleteVideo(user, body, id);
  }

  @RequirePermissions(
    Permission.CREATORS_VIDEOS_DEACTIVATE,
    Permission.CREATORS_VIDEOS_ACTIVATE,
  )
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.Creators.UpdateVideoStatus)
  async updateVideoStatus(
    @Param() param: UpdateCreatorsVideoStatusParamsDto,
    @Body() body: UpdateCreatorsVideoStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;
    return this.creatorsService.updateVideoStatus(id, isActive, lang, user);
  }
}
