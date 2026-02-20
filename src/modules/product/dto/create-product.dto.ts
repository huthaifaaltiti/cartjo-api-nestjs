import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { validationConfig } from 'src/configs/validationConfig';
import { Currency } from 'src/enums/currency.enum';
import { ProductVariantAttributeKey } from 'src/enums/productVariantAttributeKey.enum';
import { Locale } from 'src/types/Locale';

const {
  product: {
    name,
    description: productDescription,
    typeHints: productTypeHints,
    category,
    subCategory,
    variant: {
      description,
      price,
      discountRate,
      availableCount,
      totalAmountCount,
      sku,
      tags,
    },
  },
} = validationConfig;

export class VariantAttributeDto {
  @IsString()
  @IsNotEmpty()
  key: ProductVariantAttributeKey;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ProductVariantDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];

  @IsString()
  @IsNotEmpty({ message: description.ar.required })
  @MinLength(description.ar.minCharacters.value, {
    message: description.ar.minCharacters.message,
  })
  description_ar: string;

  @IsString()
  @IsNotEmpty({ message: description.en.required })
  @MinLength(description.en.minCharacters.value, {
    message: description.en.minCharacters.message,
  })
  description_en: string;

  @IsNotEmpty({ message: price.required })
  @Min(price.min.value, { message: price.min.message })
  @Max(price.max.value, { message: price.max.message })
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? undefined
      : Number(value),
  )
  @IsNumber({}, { message: price.invalidType })
  price: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? undefined
      : Number(value),
  )
  @IsNumber({}, { message: discountRate.invalidType })
  @Min(discountRate.min.value, { message: discountRate.min.message })
  @Max(discountRate.max.value, { message: discountRate.max.message })
  discountRate?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? undefined
      : Number(value),
  )
  @IsNumber({}, { message: availableCount.invalidType })
  @Min(availableCount.min.value, { message: availableCount.min.message })
  availableCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: totalAmountCount.invalidType })
  @Min(totalAmountCount.min.value, { message: totalAmountCount.min.message })
  totalAmountCount: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: tags.invalidType })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MinLength(sku.minCharacters.value, { message: sku.minCharacters.message })
  @MaxLength(sku.maxCharacters.value, { message: sku.maxCharacters.message })
  sku?: string;

  @IsOptional()
  @IsString()
  lang: Locale = 'en';
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: name.ar.required })
  @MinLength(name.ar.minCharacters.value, {
    message: name.ar.minCharacters.message,
  })
  @MaxLength(name.ar.maxCharacters.value, {
    message: name.ar.maxCharacters.message,
  })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: name.en.required })
  @MinLength(name.en.minCharacters.value, {
    message: name.en.minCharacters.message,
  })
  @MaxLength(name.en.maxCharacters.value, {
    message: name.en.maxCharacters.message,
  })
  name_en: string;

  @IsString()
  @IsNotEmpty({ message: productDescription.ar.required })
  @MinLength(productDescription.ar.minCharacters.value, {
    message: productDescription.ar.minCharacters.message,
  })
  @MaxLength(productDescription.ar.maxCharacters.value, {
    message: productDescription.ar.maxCharacters.message,
  })
  description_ar: string;

  @IsString()
  @IsNotEmpty({ message: productDescription.en.required })
  @MinLength(productDescription.en.minCharacters.value, {
    message: productDescription.en.minCharacters.message,
  })
  @MaxLength(productDescription.en.maxCharacters.value, {
    message: productDescription.en.maxCharacters.message,
  })
  description_en: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNotEmpty({ message: productTypeHints.required })
  @IsArray()
  typeHints: string[];

  @IsNotEmpty({ message: category.required })
  @IsMongoId()
  categoryId: string;

  @IsNotEmpty({ message: subCategory.required })
  @IsMongoId()
  subCategoryId: string;

  @IsOptional()
  @IsString()
  lang: Locale = 'en';
}
