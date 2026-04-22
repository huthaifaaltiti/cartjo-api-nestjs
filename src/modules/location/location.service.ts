import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaService } from '../media/media.service';
import { DeleteLocationBodyDto } from './dto/delete-location-body.dto';
import { Location, LocationDocument } from '../../schemas/location.schema';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { Locale } from '../../types/Locale';
import { fileSizeValidator } from '../../common/functions/validators/fileSizeValidator';
import { fileTypeValidator } from '../../common/functions/validators/fileTypeValidator';
import { MEDIA_CONFIG } from '../../configs/media.config';
import { excelSheetParser } from '../../common/utils/excelSheetParser';
import {
  buildTownHierarchy,
  LocationNode,
} from '../../common/utils/buildTownHierarchy';
import { Modules } from '../../enums/appModules.enum';
import { getMessage } from '../../common/utils/translator';

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
    locations: LocationNode[] | null;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    if (
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('excel')) ||
      (file?.mimetype?.startsWith('application/') &&
        file?.mimetype?.includes('sheet'))
    ) {
      fileSizeValidator(
        file,
        MEDIA_CONFIG.LOCATION.BULK_UPLOAD_FILE.MAX_SIZE,
        lang,
      );
      fileTypeValidator(
        file,
        MEDIA_CONFIG.LOCATION.BULK_UPLOAD_FILE.ALLOWED_TYPES,
        lang,
      );

      const uploadResult = await this.mediaService.mediaUploader(
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
    locations: LocationNode[];
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
