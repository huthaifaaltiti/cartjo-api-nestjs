import { IsMongoId, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import mongoose from 'mongoose';

import { CreateDto } from './create.dto';

export class UpdateDto extends PartialType(CreateDto) {}

export class UpdateParamsDto {
  @IsMongoId({ message: 'Invalid banner ID format' })
  @IsNotEmpty({ message: 'Banner ID is required' })
  id: mongoose.Types.ObjectId;
}
