import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MediaService } from '../media/media.service';
import { getMessage } from 'src/common/utils/translator';
import { excelSheetParser } from 'src/common/utils/excelSheetParser';
import { buildTownHierarchy } from 'src/common/utils/buildTownHierarchy';
import { Location, LocationDocument } from 'src/schemas/location.schema';
import { validateUserAccess } from 'src/common/utils/validateUserAccess';
import { UpdateLocationBodyDto } from './dto/update-location-body.dto';
import { DeleteLocationBodyDto } from './dto/delete-location-body.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly mediaService: MediaService,
    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

  async handleBulkFileUpload(
    file: Express.Multer.File,
    requestingUser: any,
    lang: 'en' | 'ar' = 'en',
  ): Promise<{
    isSuccess: Boolean;
    message: string;
    locations: Location[] | null;
  }> {
    validateUserAccess(requestingUser);

    if (
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('excel')) ||
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('sheet'))
    ) {
      const uploadResult = await this.mediaService.handleFileUpload(
        file,
        requestingUser,
        lang,
      );

      if (uploadResult?.fileUrl) {
        const locations = await excelSheetParser(uploadResult?.fileUrl);
        const topLevelLocations = buildTownHierarchy(locations);

        // Clear old locations
        await this.locationModel.deleteMany({});

        // Save new locations
        await this.locationModel.insertMany(topLevelLocations);

        return {
          isSuccess: true,
          message: getMessage('media_sheetUploadedSuccessfully', lang),
          locations: topLevelLocations,
        };
      }
    } else {
      return {
        isSuccess: false,
        message: getMessage('media_notSupportedDataType', lang),
        locations: null,
      };
    }
  }

  async getLocations(): Promise<Location[]> {
    return this.locationModel.find().lean().exec();
  }

  // async updateLocation(
  //   id: string,
  //   updateData: UpdateLocationBodyDto,
  //   requestingUser: any,
  // ): Promise<Location> {
  //   validateUserAccess(requestingUser);

  //   const { ar, en } = updateData;

  //   const updated = await this.locationModel.findByIdAndUpdate(
  //     id,
  //     { name: { ar, en } },
  //     { new: true },
  //   );

  //   if (!updated) {
  //     throw new NotFoundException('Location not found');
  //   }

  //   return updated;
  // }

  async deleteLocation(
    id: string,
    body: DeleteLocationBodyDto,
    requestingUser: any,
  ): Promise<{
    isSuccess: Boolean;
    message: string;
  }> {
    validateUserAccess(requestingUser);

    const { lang } = body;

    const deleted = await this.locationModel.findOneAndDelete({ _id: id });

    if (!deleted) {
      throw new NotFoundException('Location not found');
    }

    return {
      isSuccess: true,
      message: getMessage('location_locationDeletedSuccessfully', lang),
    };
  }
}
