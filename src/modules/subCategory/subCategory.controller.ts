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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubCategoryService } from './subCategory.service';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import {
  UpdateSubCategoryDto,
  UpdateSubCategoryParamsDto,
} from './dto/update-subCategory.dto';
import {
  DeleteSubCategoryDto,
  DeleteSubCategoryParamsDto,
} from './dto/delete-subCategory.dto';
import {
  UnDeleteSubCategoryBodyDto,
  UnDeleteSubCategoryParamsDto,
} from './dto/unDelete-subCategory.dto';
import {
  UpdateSubCategoryStatusBodyDto,
  UpdateSubCategoryStatusParamsDto,
} from './dto/update-subCategory-status.dto';
import { GetSubCategoriesQueryDto } from './dto/get-subCategories-query.dto';
import {
  GetSubCategoryParamDto,
  GetSubCategoryQueryDto,
} from './dto/get-subCategory.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(ApiPaths.SubCategory.Root)
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @RequirePermissions(Permission.SUB_CATEGORIES_CREATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  @Post(ApiPaths.SubCategory.Create)
  async create(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: CreateSubCategoryDto,
  ) {
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.subCategoryService.create(req, body, image_ar, image_en);
  }

  @RequirePermissions(Permission.SUB_CATEGORIES_UPDATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.SubCategory.Update)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  async update(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: UpdateSubCategoryDto,
    @Param() param: UpdateSubCategoryParamsDto,
  ) {
    const { id } = param;
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.subCategoryService.update(req, body, image_ar, image_en, id);
  }

  @RequirePermissions(Permission.SUB_CATEGORIES_DELETE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.SubCategory.Delete)
  async delete(
    @Request() req: any,
    @Body() body: DeleteSubCategoryDto,
    @Param() param: DeleteSubCategoryParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.subCategoryService.delete(user, body, id);
  }

  @RequirePermissions(Permission.SUB_CATEGORIES_RESTORE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.SubCategory.UnDelete)
  async unDelete(
    @Request() req: any,
    @Param() param: UnDeleteSubCategoryParamsDto,
    @Body() body: UnDeleteSubCategoryBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.subCategoryService.unDelete(user, body, id);
  }

  @RequirePermissions(
    Permission.SUB_CATEGORIES_ACTIVATE,
    Permission.SUB_CATEGORIES_DEACTIVATE,
  )
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.SubCategory.UpdateStatus)
  async updateStatus(
    @Param() param: UpdateSubCategoryStatusParamsDto,
    @Body() body: UpdateSubCategoryStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.subCategoryService.updateStatus(id, isActive, lang, user);
  }

  @RequirePermissions(Permission.SUB_CATEGORIES_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.SubCategory.GetAll)
  async getAll(@Request() req: any, @Query() query: GetSubCategoriesQueryDto) {
    const { lang, limit, lastId, search, catId } = query;
    const { user } = req;

    return this.subCategoryService.getAll(user, {
      lang,
      limit,
      lastId,
      search,
      catId,
    });
  }

  @RequirePermissions(Permission.SUB_CATEGORIES_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.SubCategory.GetOne)
  async getOne(
    @Request() req: any,
    @Param() param: GetSubCategoryParamDto,
    @Query() query: GetSubCategoryQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;
    const { user } = req;

    return this.subCategoryService.getOne(user, id, lang);
  }
}
