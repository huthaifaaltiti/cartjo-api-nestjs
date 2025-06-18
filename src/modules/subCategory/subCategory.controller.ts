import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { SubCategoryService } from './subCategory.service';
import { UpdateSubCategoryDto, UpdateSubCategoryParamsDto } from './dto/update-subCategory.dto';

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
}
