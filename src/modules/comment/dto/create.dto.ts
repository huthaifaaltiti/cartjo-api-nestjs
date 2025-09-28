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
import { Locale } from 'src/types/Locale';

export class CreateCommentDto {
  @IsString()
  lang?: Locale;

  @IsMongoId()
  productId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  content: string;

  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}
