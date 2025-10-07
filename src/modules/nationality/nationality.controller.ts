import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { NationalityService } from './nationality.service';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';

@Controller(ApiPaths.Nationality.Root)
export class NationalityController {
  constructor(private readonly nationalityService: NationalityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Nationality.GetAllStatic)
  async getStaticNationalities(@Query() query: GetStaticNationalitiesQueryDto,) {
    return this.nationalityService.getAllStatic(query);
  }
}
