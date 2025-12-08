import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MediaService } from '../media/media.service';

import { getMessage } from 'src/common/utils/translator';
import { excelSheetParser } from 'src/common/utils/excelSheetParser';
import { buildTownHierarchy } from 'src/common/utils/buildTownHierarchy';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';

import { Location, LocationDocument } from 'src/schemas/location.schema';
import { DeleteLocationBodyDto } from './dto/delete-location-body.dto';
import { Modules } from 'src/enums/appModules.enum';
import { Locale } from 'src/types/Locale';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';

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
    lang: Locale = 'en',
  ): Promise<{
    isSuccess: Boolean;
    message: string;
    locations: Location[] | null;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    if (
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('excel')) ||
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('sheet'))
    ) {
      fileSizeValidator(file, MAX_FILE_SIZES.LOCATION_EXCEL_FILE, lang);

      const uploadResult = await this.mediaService.handleFileUpload(
        file,
        requestingUser,
        lang,
        Modules.LOCATION,
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

  async getLocations(lang: Locale = 'en'): Promise<{
    isSuccess: boolean;
    message: string;
    locations: Location[];
  }> {
    const locations = await this.locationModel.find().lean().exec();

    return {
      isSuccess: true,
      message: getMessage('location_locationRetrievedSuccessfully', lang),
      locations,
    };
  }

  async deleteLocation(
    id: string,
    body: DeleteLocationBodyDto,
    requestingUser: any,
  ): Promise<{
    isSuccess: Boolean;
    message: string;
  }> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

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
