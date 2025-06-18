import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import { Currency } from 'src/enums/currency.enum';
import { TypeHint } from 'src/enums/typeHint.enums';

import { Locale } from 'src/types/Locale';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ar name is required' })
  @MinLength(10, {
    message: 'Product ar name cannot be less than 10 characters',
  })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Product en name is required' })
  @MinLength(10, {
    message: 'Product en name cannot be less than 10 characters',
  })
  name_en: string;

  @IsString()
  @IsNotEmpty({ message: 'Product ar desc is required' })
  @MinLength(15, {
    message: 'Product ar desc cannot be less than 15 characters',
  })
  description_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Product en desc is required' })
  @MinLength(15, {
    message: 'Product en desc cannot be less than 15 characters',
  })
  description_en: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Price cant be less than 1' })
  price: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Price discount rate cant be less than 1' })
  @Max(100, { message: 'Price discount rate cant be more than 100' })
  discountRate?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Total amount count cant be less than 1' })
  totalAmountCount?: number;

  @IsNotEmpty()
  @IsEnum(TypeHint)
  typeHint: TypeHint;

  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;

  @IsNotEmpty()
  @IsMongoId()
  subCategoryId: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
