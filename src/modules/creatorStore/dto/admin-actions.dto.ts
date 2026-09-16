import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { validationConfig } from '../../../configs/validationConfig';
import { CreatorStoreStatus } from '../../../enums/creatorStoreStatus.enum';
import { Locale as LocaleEnum } from '../../../enums/locale.enum';

const c = validationConfig.creatorStore;

export class AdminUpdateStoreDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'commissionRate must be a number' })
  @Min(c.minCommissionRate)
  @Max(c.maxCommissionRate)
  commissionRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsEnum(CreatorStoreStatus)
  status?: CreatorStoreStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(c.statusReasonMaxChars)
  statusReason?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class VerifyStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Also flip the store to ACTIVE (default true). */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activate?: boolean;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class RejectStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'A rejection reason is required' })
  @MinLength(c.statusReasonMinChars)
  @MaxLength(c.statusReasonMaxChars)
  reason: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class SuspendStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'A suspension reason is required' })
  @MinLength(c.statusReasonMinChars)
  @MaxLength(c.statusReasonMaxChars)
  reason: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class ActivateStoreDto {
  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class SetCommissionDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'commissionRate must be a number' })
  @Min(c.minCommissionRate)
  @Max(c.maxCommissionRate)
  commissionRate: number;

  @IsOptional()
  @IsString()
  @MaxLength(c.statusReasonMaxChars)
  reason?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class SetFeaturedDto {
  @Type(() => Boolean)
  @IsBoolean({ message: 'isFeatured must be a boolean' })
  isFeatured: boolean;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class ConfirmPayoutInfoDto {
  @Type(() => Boolean)
  @IsBoolean({ message: 'confirmed must be a boolean' })
  confirmed: boolean;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class RecalculateStatsDto {
  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class DeleteStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}

export class UnDeleteStoreDto {
  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}
