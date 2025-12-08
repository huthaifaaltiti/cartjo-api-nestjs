import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserStatusParamsDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  id: string;
}

export class UpdateUserStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  @IsOptional()
  lang: 'en' | 'ar' = 'en';
}
