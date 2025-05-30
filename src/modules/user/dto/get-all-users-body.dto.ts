import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAllUsersBodyDto {
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  lastId: string | null;

  @IsString()
  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  @IsOptional()
  lang: 'en' | 'ar' = 'en';
}
