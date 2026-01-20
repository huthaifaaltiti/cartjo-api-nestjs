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
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.SubCategory.Root)
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @Get(ApiPaths.SubCategory.GetAll)
  async getAll(@Query() query: GetSubCategoriesQueryDto) {
    const { lang, limit, lastId, search, catId } = query;

    return this.subCategoryService.getAll({
      lang,
      limit,
      lastId,
      search,
      catId,
    });
  }

  @Get(ApiPaths.SubCategory.GetOne)
  async getOne(
    @Param() param: GetSubCategoryParamDto,
    @Query() query: GetSubCategoryQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.subCategoryService.getOne(id, lang);
  }
}
