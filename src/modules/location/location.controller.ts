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
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Location.Root)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Location.BulkUpload)
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

  @Get(ApiPaths.Location.GetAll)
  getLocations() {
    return this.locationService.getLocations();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Location.Delete)
  deleteLocation(
    @Param('id') id: string,
    @Body() body: DeleteLocationBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.locationService.deleteLocation(id, body, user);
  }
}
