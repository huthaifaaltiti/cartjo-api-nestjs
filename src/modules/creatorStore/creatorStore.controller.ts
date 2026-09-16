import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiPaths } from '../../common/constants/api-paths';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../enums/permission.enum';
import { CreatorStoreCreatorService } from './creatorStore.creator.service';
import { CreateCreatorStoreDto } from './dto/create-store.dto';
import { HandleParamDto, IdParamDto, LangDto } from './dto/params.dto';
import { ChangeHandleDto } from './dto/handle.dto';
import { UpdateCreatorStoreDto } from './dto/update-store.dto';
import { UpdatePayoutInfoDto } from './dto/payout-info.dto';
import { UpdatePickupAddressDto } from './dto/pickup-address.dto';
import { SubmitForReviewDto } from './dto/lifecycle.dto';
import { CreatorStoreAdminService } from './creatorStore.admin.service';
import { AdminGetStoresQueryDto } from './dto/list.dto';

const JWT = AuthGuard('jwt');

@Controller(ApiPaths.CreatorStore.Root)
export class CreatorStoreController {
  constructor(
    private readonly creatorService: CreatorStoreCreatorService,
    private readonly adminService: CreatorStoreAdminService,
  ) {}

  /* Users */
  @RequirePermissions(Permission.CREATOR_STORE_CREATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Post(ApiPaths.CreatorStore.Create)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async createStore(
    @Request() req: any,
    @Body() body: CreateCreatorStoreDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.creatorService.createStore(
      req,
      body,
      files?.logo?.[0],
      files?.banner?.[0],
    );
  }

  @Get(ApiPaths.CreatorStore.PublicGetByHandle)
  async getPublicStoreByHandle(
    @Param() param: HandleParamDto,
    @Query() query: LangDto,
  ) {
    return this.creatorService.getPublicStoreByHandle(param.handle, query.lang);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.CreatorStore.CheckHandleAvailability)
  async checkHandleAvailability(
    @Param() param: HandleParamDto,
    @Query() query: LangDto,
    @Request() req: any,
  ) {
    return this.creatorService.checkHandleAvailability(
      req.user,
      param.handle,
      query.lang,
    );
  }

  @RequirePermissions(Permission.CREATOR_STORE_READ_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.CreatorStore.Me)
  async getMyStore(@Query() query: LangDto, @Request() req: any) {
    return this.creatorService.getMyStore(req.user, query.lang);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.CreatorStore.ChangeHandle)
  async changeHandle(@Body() body: ChangeHandleDto, @Request() req: any) {
    return this.creatorService.changeHandle(req, body);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.CreatorStore.Update)
  async updateStore(@Body() body: UpdateCreatorStoreDto, @Request() req: any) {
    return this.creatorService.updateStore(req, body);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.CreatorStore.UpdatePayoutInfo)
  async updatePayoutInfo(
    @Body() body: UpdatePayoutInfoDto,
    @Request() req: any,
  ) {
    return this.creatorService.updatePayoutInfo(req, body);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.CreatorStore.UpdatePickupAddress)
  async updatePickupAddress(
    @Body() body: UpdatePickupAddressDto,
    @Request() req: any,
  ) {
    return this.creatorService.updatePickupAddress(req, body);
  }

  @RequirePermissions(Permission.CREATOR_STORE_UPDATE_OWN)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.CreatorStore.SubmitForReview)
  async submitForReview(@Body() body: SubmitForReviewDto, @Request() req: any) {
    return this.creatorService.submitForReview(req, body);
  }

  /*  Administration  */
  @RequirePermissions(Permission.CREATOR_STORES_READ)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.CreatorStore.AdminGetAll)
  async adminGetAll(
    @Query() query: AdminGetStoresQueryDto,
    @Request() req: any,
  ) {
    return this.adminService.adminGetAll(req.user, query);
  }

  /*  Administration  */
  @RequirePermissions(Permission.CREATOR_STORES_READ)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.CreatorStore.AdminGetCounts)
  async adminGetCounts(@Query() query: LangDto, @Request() req: any) {
    return this.adminService.adminGetCounts(req.user, query);
  }

  @RequirePermissions(Permission.CREATOR_STORES_READ)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.CreatorStore.AdminGetOne)
  async adminGetOne(
    @Param() param: IdParamDto,
    @Query() query: LangDto,
    @Request() req: any,
  ) {
    return this.adminService.adminGetOne(req.user, param.id, query.lang);
  }
}
