import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getMessage } from 'src/common/utils/translator';
import {
  Nationality,
  NationalityDocument,
} from 'src/schemas/nationality.schema';
import { NATIONALITIES } from 'src/common/constants/nationalities';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';

@Injectable()
export class NationalityService {
  constructor(
    @InjectModel(Nationality.name)
    private readonly nationalityModel: Model<NationalityDocument>,
  ) {}

  async getAllStatic(query: GetStaticNationalitiesQueryDto) {
    const { lang = "en" } = query;

    const nationalities = [...NATIONALITIES];

    return {
      isSuccess: true,
      message: getMessage(
        'nationality_staticNationalitiesRetrievedSuccessfully',
        lang,
      ),
      dataCount: nationalities.length,
      data: nationalities,
    };
  }
}
