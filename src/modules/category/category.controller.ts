import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
  Request,
  Put,
  Param,
  Get,
  Query,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryParamsDto,
} from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import {
  GetCategoryParamDto,
  GetCategoryQueryDto,
} from './dto/get-category.dto';
import {
  DeleteCategoryDto,
  DeleteCategoryParamsDto,
} from './dto/delete-category.dto';
import {
  UnDeleteCategoryBodyDto,
  UnDeleteCategoryParamsDto,
} from './dto/unDelete-category.dto';
import {
  UpdateCategoryStatusBodyDto,
  UpdateCategoryStatusParamsDto,
} from './dto/update-category-status.dto';
import { CategoryService } from './category.service';
import { GetActiveOnesQueryDto } from './dto/get-active-ones.dto';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Category.Root)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Category.Create)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: CreateCategoryDto,
  ) {
    const { user } = req;
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.categoryService.create(user, body, image_ar, image_en, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Category.Update)
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
    @Body() body: UpdateCategoryDto,
    @Param() param: UpdateCategoryParamsDto,
  ) {
    const { user } = req;
    const { id } = param;
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.categoryService.update(user, body, image_ar, image_en, id, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Category.Delete)
  async delete(
    @Request() req: any,
    @Body() body: DeleteCategoryDto,
    @Param() param: DeleteCategoryParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.categoryService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Category.UnDelete)
  async unDeleteCategory(
    @Request() req: any,
    @Param() param: UnDeleteCategoryParamsDto,
    @Body() body: UnDeleteCategoryBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.categoryService.unDelete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Category.UpdateStatus)
  async updateCategoryStatus(
    @Param() param: UpdateCategoryStatusParamsDto,
    @Body() body: UpdateCategoryStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.categoryService.updateStatus(id, isActive, lang, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Category.GetAll)
  async getCategories(@Query() query: GetCategoriesQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.categoryService.getAll({
      lang,
      limit,
      lastId,
      search,
    });
  }

  @Get(ApiPaths.Category.GetActiveOnes)
  async getActiveOnes(@Query() query: GetActiveOnesQueryDto) {
    return this.categoryService.getActiveOnes(query);
  }

  @Get(ApiPaths.Category.GetOne)
  async getCategory(
    @Param() param: GetCategoryParamDto,
    @Query() query: GetCategoryQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.categoryService.getOne(id, lang);
  }
}
