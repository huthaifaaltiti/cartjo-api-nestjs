import { PartialType } from '@nestjs/mapped-types';
import { ItemBodyDto } from './item.dto';

export class ItemsBodyDto extends PartialType(ItemBodyDto) {}
