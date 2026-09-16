import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Locale } from '../../../types/Locale';

/** Replaces the store's shipping-origin / courier pickup address. */
export class UpdatePickupAddressDto {
  @IsOptional() @IsString() @MaxLength(120) contactName?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsString() @MaxLength(10) countryCode?: string;
  @IsOptional() @IsString() @MaxLength(80) country?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(80) town?: string;
  @IsOptional() @IsString() @MaxLength(160) street?: string;
  @IsOptional() @IsString() @MaxLength(80) building?: string;
  @IsOptional() @IsString() @MaxLength(300) additionalInfo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude({ message: 'lat must be a valid latitude' })
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude({ message: 'lng must be a valid longitude' })
  lng?: number;

  @IsOptional() @IsString() @MaxLength(160) locationName?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
