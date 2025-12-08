import { IsOptional, IsString } from "class-validator";
import { Locale } from "src/types/Locale";

export class GetStaticNationalitiesQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
