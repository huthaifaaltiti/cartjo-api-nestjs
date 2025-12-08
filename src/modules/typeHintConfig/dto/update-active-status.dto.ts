import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';
import { Locale } from 'src/types/Locale';
export class UpdateStatusParamsDto {
  @IsMongoId({ message: 'Invalid ID format' })
  @IsNotEmpty({ message: 'ID is required' })
  id: mongoose.Types.ObjectId;
}
export class UpdateStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
