import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NationalityService } from './nationality.service';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';
import { ApiPaths } from '../../common/constants/api-paths';

@Controller(ApiPaths.Nationality.Root)
export class NationalityController {
  constructor(private readonly nationalityService: NationalityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Nationality.GetAllStatic)
  async getStaticNationalities(@Query() query: GetStaticNationalitiesQueryDto,) {
    return this.nationalityService.getAllStatic(query);
  }
}
