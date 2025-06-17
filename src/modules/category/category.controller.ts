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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryParamsDto,
} from './dto/update-category.dto';
import { GetAllCategoriesQueryDto } from './dto/get-all-categories-query.dto';

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

  @Get('all')
  async getCategories(@Query() query: GetAllCategoriesQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.categoryService.getCategories({
      lang,
      limit,
      lastId,
      search,
    });
  }
}
