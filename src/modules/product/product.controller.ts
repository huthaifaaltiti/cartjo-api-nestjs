import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
  Param,
  Get,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { GetProductParamDto, GetProductQueryDto } from './dto/get-product.dto';
import { GetSuggestedProductsQueryDto } from './dto/get-suggested-products.dto';
import { OptionalJwtAuthGuard } from 'src/common/utils/optionalJwtAuthGuard';
import { ApiPaths } from 'src/common/constants/api-paths';
import {
  UpdateProductBodyDto,
  UpdateProductParamsDto,
  UpdateProductVariantBodyDto,
  UpdateProductVariantParamsDto,
} from './dto/update-product.dto';
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
    const mainImage = files.find(f => f.fieldname === 'mainImage');

    const variantImages: Record<number, Express.Multer.File[]> = {};
    const variantMainImages: Record<number, Express.Multer.File> = {};

    files.forEach(file => {
      let match = file.fieldname.match(/^variant_(\d+)_images$/);
      if (match) {
        const index = Number(match[1]);
        if (!variantImages[index]) variantImages[index] = [];
        variantImages[index].push(file);
      }

      match = file.fieldname.match(/^variant_(\d+)_mainImage$/);
      if (match) {
        const index = Number(match[1]);
        variantMainImages[index] = file;
      }
    });

    return this.productService.create(
      req,
      dto,
      mainImage,
      variantImages,
      variantMainImages,
    );
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

    return this.productService.update(id, req, body, mainImage);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  @Put(ApiPaths.Product.UpdateVariant)
  async updateVariant(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductVariantBodyDto,
    @Request() req: any,
    @Param() param: UpdateProductVariantParamsDto,
  ) {
    const variantMainImage = files?.find(
      file => file.fieldname === 'mainImage',
    );
    const variantImages = files?.filter(f => f.fieldname === 'images') ?? [];

    return this.productService.updateVariant(
      param,
      req,
      body,
      variantMainImage,
      variantImages,
    );
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
  async deleteProduct(
    @Request() req: any,
    @Body() body: DeleteProductDto,
    @Param() param: DeleteProductParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.productService.deleteProduct(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Product.UnDelete)
  async unDeleteProduct(
    @Request() req: any,
    @Param() param: UnDeleteProductParamsDto,
    @Body() body: UnDeleteProductBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.productService.unDeleteProduct(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Product.UpdateVariantStatus)
  async updateVariantStatus(
    @Param() param: UpdateProductVariantParamsDto,
    @Body() body: UpdateProductStatusBodyDto,
    @Request() req: any,
  ) {
    return this.productService.updateVariantStatus(body, param, req?.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Product.DeleteVariant)
  async deleteVariant(
    @Param() param: UpdateProductVariantParamsDto,
    @Body() body: DeleteProductDto,
    @Request() req: any,
  ) {
    return this.productService.deleteVariant(param, body, req?.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Product.UnDeleteVariant)
  async unDeleteVariant(
    @Param() param: UpdateProductVariantParamsDto,
    @Body() body: UnDeleteProductBodyDto,
    @Request() req: any,
  ) {
    return this.productService.unDeleteVariant(param, body, req?.user);
  }
}
