import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { Locale } from 'src/types/Locale';

export class DeleteDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteParamsDto {
  @IsMongoId({ message: 'Invalid ID format' })
  @IsNotEmpty({ message: 'ID is required' })
  id: mongoose.Types.ObjectId;
}
