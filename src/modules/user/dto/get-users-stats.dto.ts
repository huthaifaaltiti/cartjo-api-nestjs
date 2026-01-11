<<<<<<< HEAD
import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
=======
import { IsOptional, IsString } from 'class-validator';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { Locale } from 'src/types/Locale';

export class GetUsersStatsQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
