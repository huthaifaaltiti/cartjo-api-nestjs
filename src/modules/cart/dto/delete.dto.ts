import { IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteAllItemsBodyDto {
  @IsString()
  @IsOptional()
  lang?: Locale;
}
