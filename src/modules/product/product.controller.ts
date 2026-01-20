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
import { GetSuggestedProductsQueryDto } from './dto/get-suggested-products.dto';
import { OptionalJwtAuthGuard } from 'src/common/utils/optionalJwtAuthGuard';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Product.Root)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  @Post(ApiPaths.Product.Create)
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
    @Request() req: any,
  ) {
    const mainImage = files.find(file => file.fieldname === 'mainImage');
    const images = files.filter(
      file => file.fieldname === 'images' || file.fieldname === 'images[]',
    );

    return this.productService.create(req, dto, mainImage, images);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  @Put(ApiPaths.Product.Update)
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductBodyDto,
    @Request() req: any,
    @Param() param: UpdateProductParamsDto,
  ) {
    const { id } = param;

    const mainImage = files.find(file => file.fieldname === 'mainImage');
    const images = files.filter(
      file => file.fieldname === 'images' || file.fieldname === 'images[]',
    );

    return this.productService.update(id, req, body, mainImage, images);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Product.GetAll)
  async getAll(@Query() query: GetProductsQueryDto, @Request() req: any) {
    const userId = req.user?.userId; // userId will be undefined if no logged user, user => null

    return this.productService.getAll(query, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Product.Suggested)
  async geSuggestedItems(
    @Query() query: GetSuggestedProductsQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId;

    return this.productService.geSuggestedItems(query, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Product.CategoriesPicks)
  async getCategoriesPicks(
    @Query() query: GetProductsQueryDto,
    @Request() req: any,
  ) {
    const { lang, limit, categoryId } = query;
    const userId = req?.user?.userId;

    return this.productService.getCategoriesPicks(
      {
        lang,
        limit,
        categoryId,
      },
      userId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Product.GetOne)
  async getOne(
    @Param() param: GetProductParamDto,
    @Query() query: GetProductQueryDto,
    @Request() req: any,
  ) {
    const { id } = param;
    const { lang } = query;
    const userId = req.user?.userId;

    return this.productService.getOne(id, lang, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Product.UpdateStatus)
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
  @Delete(ApiPaths.Product.Delete)
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
  @Delete(ApiPaths.Product.UnDelete)
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
