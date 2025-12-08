import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetCommentQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetCommentParamDto {
  @IsMongoId({ message: 'Invalid comment ID format' })
  @IsNotEmpty({ message: 'Comment ID is required' })
  id: string;
}
