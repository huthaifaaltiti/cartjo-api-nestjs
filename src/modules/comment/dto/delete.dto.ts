import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Locale } from 'src/types/Locale';

export class DeleteCommentBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteCommentParamsDto {
  @IsMongoId({ message: 'Invalid Comment ID format' })
  @IsNotEmpty({ message: 'Comment ID is required' })
  id: Types.ObjectId;
}
