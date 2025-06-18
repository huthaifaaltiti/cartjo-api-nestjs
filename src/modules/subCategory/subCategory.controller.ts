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

import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { SubCategoryService } from './subCategory.service';
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

@Controller('/api/v1/sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  @Post('create')
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateSubCategoryDto,
  ) {
    const { user } = req;
    return this.subCategoryService.create(user, body, image);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateSubCategoryDto,
    @Param() param: UpdateSubCategoryParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.subCategoryService.update(user, body, image, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
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
  @Delete('un-delete/:id')
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
  @Put('status/:id')
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

  @Get('all')
  async getAll(@Query() query: GetSubCategoriesQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.subCategoryService.getAll({
      lang,
      limit,
      lastId,
      search,
    });
  }

  @Get('/:id')
  async getOne(
    @Param() param: GetSubCategoryParamDto,
    @Query() query: GetSubCategoryQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.subCategoryService.getOne(id, lang);
  }
}
