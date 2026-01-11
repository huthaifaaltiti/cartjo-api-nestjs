import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
<<<<<<< HEAD

import { UserRole } from 'src/enums/user-role.enum';
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { Locale } from 'src/types/Locale';

export class GetAllUsersQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isDeleted: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  canManage: boolean;
}
