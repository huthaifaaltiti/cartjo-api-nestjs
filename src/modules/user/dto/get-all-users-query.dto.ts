import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class GetAllUsersQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  @IsOptional()
  lang: 'en' | 'ar' = 'en';
}
