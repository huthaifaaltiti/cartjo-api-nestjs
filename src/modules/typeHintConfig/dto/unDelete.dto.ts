import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

import { Locale } from 'src/types/Locale';

export class UnDeleteDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UnDeleteParamsDto {
  @IsMongoId({ message: 'Invalid ID format' })
  @IsNotEmpty({ message: 'ID is required' })
  id: mongoose.Types.ObjectId;
}
