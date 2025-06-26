import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';

import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('/api/v1/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  @Post('create')
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
    @Request() req: any,
  ) {
    const mainImage = files.find(file => file.fieldname === 'mainImage');
    const images = files.filter(file => file.fieldname === 'images');

    // console.log({ dto, mainImage, images });
    return this.productService.create(req.user, dto, mainImage, images);
  }
}
