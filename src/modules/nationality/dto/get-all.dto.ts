import { IsOptional, IsString } from "class-validator";
import { Locale } from "../../../types/Locale";

export class GetStaticNationalitiesQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
