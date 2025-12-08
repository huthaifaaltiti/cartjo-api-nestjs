import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateCommentQueryDto extends PartialType(CreateCommentDto) {}

export class UpdateCommentParamsDto {
  @IsMongoId({ message: 'Invalid comment ID format' })
  @IsNotEmpty({ message: 'Comment ID is required' })
  id: Types.ObjectId;
}