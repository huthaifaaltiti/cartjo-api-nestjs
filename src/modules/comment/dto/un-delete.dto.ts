import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class UnDeleteCommentBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UnDeleteCommentParamsDto {
  @IsMongoId({ message: 'Invalid Comment ID format' })
  @IsNotEmpty({ message: 'Comment ID is required' })
  id: string;
}
