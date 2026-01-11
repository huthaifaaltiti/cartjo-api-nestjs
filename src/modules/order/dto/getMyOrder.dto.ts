import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { Locale } from 'src/types/Locale';

export class GetMyOrderQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetMyOrderParamDto {
  @IsNotEmpty()
  @IsString()
  oid?: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  uid?: mongoose.Types.ObjectId;
}
