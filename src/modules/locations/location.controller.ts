import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';

// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { CreateLocationDto } from './dto/create-location.dto';
// import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('api/v1/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  findAll() {
    return this.locationService.findAll(); // Public
  }

  // @Post()
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  // create(@Body() dto: CreateLocationDto) {
  //   return this.locationService.create(dto);
  // }

  // @Patch(':id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  // update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
  //   return this.locationService.update(id, dto);
  // }

  // @Delete(':id')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  // remove(@Param('id') id: string) {
  //   return this.locationService.remove(id);
  // }
}
