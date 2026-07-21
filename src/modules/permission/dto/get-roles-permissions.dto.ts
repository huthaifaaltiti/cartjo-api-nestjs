import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class GetRolesPermissionsQueryDto {
  @IsString()
  @IsOptional()
  lang?: Locale = 'en';
}
