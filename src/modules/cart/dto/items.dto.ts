import { PartialType } from '@nestjs/mapped-types';
import { ItemBodyDto } from './item.dto';
import { IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class ItemsBodyDto extends PartialType(ItemBodyDto) {}

export class WishlistItemsBodyDto {
  @IsString()
  @IsOptional()
  lang?: Locale;
}

