import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetUsersStatsBodyDto {
  @IsString()
  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  @IsOptional()
  lang: 'en' | 'ar' = 'en';
}
