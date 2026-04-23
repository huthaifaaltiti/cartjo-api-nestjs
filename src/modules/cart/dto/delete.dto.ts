import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class DeleteAllItemsBodyDto {
  @IsString()
  @IsOptional()
  lang?: Locale;
}
