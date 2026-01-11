<<<<<<< HEAD
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
=======
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

export class UpdateLocationBodyDto {
  @IsString()
  @IsNotEmpty()
  ar: string;

  @IsString()
  @IsNotEmpty()
  en: string;

  @IsString()
  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  @IsOptional()
  lang: 'en' | 'ar' = 'en';
}
