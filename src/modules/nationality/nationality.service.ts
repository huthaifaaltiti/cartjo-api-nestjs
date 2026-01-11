import { Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getMessage } from 'src/common/utils/translator';
import {
  Nationality,
  NationalityDocument,
} from 'src/schemas/nationality.schema';
=======
import { getMessage } from 'src/common/utils/translator';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { NATIONALITIES } from 'src/common/constants/nationalities';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';

@Injectable()
export class NationalityService {
  constructor(
<<<<<<< HEAD
    @InjectModel(Nationality.name)
    private readonly nationalityModel: Model<NationalityDocument>,
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
