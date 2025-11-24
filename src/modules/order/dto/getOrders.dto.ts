import {
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { Locale } from 'src/types/Locale';

export class GetOrdersQueryDto {
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

  @IsNumberString()
  @IsOptional()
  amountMin: string;

  @IsNumberString()
  @IsOptional()
  amountMax: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsISO8601()
  createdAfter?: string;

  @IsOptional()
  @IsISO8601()
  createdBefore?: string;

  @IsOptional()
  @IsISO8601()
  updatedAfter?: string;

  @IsOptional()
  @IsISO8601()
  updatedBefore?: string;
}
