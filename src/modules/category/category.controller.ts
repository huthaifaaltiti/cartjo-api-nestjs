import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { CategoryService } from './category.service';
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

@Controller('/api/v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateCategoryDto,
  ) {
    const { user } = req;

    return this.categoryService.create(user, body, image);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateCategoryDto,
    @Param() param: UpdateCategoryParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.categoryService.update(user, body, image, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
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
  @Delete('un-delete/:id')
  async unDeleteCategory(
    @Request() req: any,
    @Param() param: UnDeleteCategoryParamsDto,
    @Body() body: UnDeleteCategoryBodyDto,
  ) {
    const { user } = req;
    const { lang } = body;
    const { id } = param;

    return this.categoryService.unDelete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
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

  @Get('all')
  async getCategories(@Query() query: GetCategoriesQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.categoryService.getCategories({
      lang,
      limit,
      lastId,
      search,
    });
  }

  @Get('/:id')
  async getCategory(
    @Param() param: GetCategoryParamDto,
    @Query() query: GetCategoryQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.categoryService.getCategory(id, lang);
  }
}
