import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductBodyDto,
  UpdateProductParamsDto,
} from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { GetProductParamDto, GetProductQueryDto } from './dto/get-product.dto';
import {
  UpdateProductStatusBodyDto,
  UpdateProductStatusParamsDto,
} from './dto/update-product-status.dto';
import {
  DeleteProductDto,
  DeleteProductParamsDto,
} from './dto/delete-product.dto';
import {
  UnDeleteProductBodyDto,
  UnDeleteProductParamsDto,
} from './dto/unDelete-product.dto';

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

    return this.productService.create(req?.user, dto, mainImage, images);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  @Put('update/:id')
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductBodyDto,
    @Request() req: any,
    @Param() param: UpdateProductParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    const mainImage = files.find(file => file.fieldname === 'mainImage');
    const images = files.filter(file => file.fieldname === 'images');

    return this.productService.update(id, user, body, mainImage, images);
  }

  @Get('all')
  async getAll(@Query() query: GetProductsQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.productService.getAll({
      lang,
      limit,
      lastId,
      search,
    });
  }

  @Get('/:id')
  async getOne(
    @Param() param: GetProductParamDto,
    @Query() query: GetProductQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.productService.getOne(id, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
  async updateStatus(
    @Param() param: UpdateProductStatusParamsDto,
    @Body() body: UpdateProductStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.productService.updateStatus(id, isActive, lang, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async delete(
    @Request() req: any,
    @Body() body: DeleteProductDto,
    @Param() param: DeleteProductParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.productService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('un-delete/:id')
  async unDelete(
    @Request() req: any,
    @Param() param: UnDeleteProductParamsDto,
    @Body() body: UnDeleteProductBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.productService.unDelete(user, body, id);
  }
}
