import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { LocationService } from './location.service';

import { BulkUploadBodyDto } from './dto/bulk-upload-body.dto';
import { DeleteLocationBodyDto } from './dto/delete-location-body.dto';

@Controller('api/v1/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  bulkUpload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BulkUploadBodyDto,
  ) {
    const { lang } = body;
    const { user } = req;

    return this.locationService.handleBulkFileUpload(file, user, lang);
  }

  @Get('all')
  getLocations() {
    return this.locationService.getLocations();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  deleteLocation(
    @Param('id') id: string,
    @Body() body: DeleteLocationBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.locationService.deleteLocation(id, body, user);
  }
}
