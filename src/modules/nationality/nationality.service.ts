import { Injectable } from '@nestjs/common';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';
import { NATIONALITIES } from '../../common/constants/nationalities';
import { getMessage } from '../../common/utils/translator';

@Injectable()
export class NationalityService {
  constructor(
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
