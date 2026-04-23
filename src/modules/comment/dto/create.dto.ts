import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { Locale } from '../../../types/Locale';

export class CreateCommentDto {
  @IsString()
  lang?: Locale;

  @IsMongoId()
  @IsNotEmpty()
  productId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  content: string;

  @IsOptional()
  @Min(1)
  @Max(5)
  @Transform(({ value }) =>
    value !== null && value !== undefined ? Number(value) : value,
  )
  rating?: number;
}
