import { Injectable } from '@nestjs/common';
import { getMessage } from 'src/common/utils/translator';
import { NATIONALITIES } from 'src/common/constants/nationalities';
import { GetStaticNationalitiesQueryDto } from './dto/get-all.dto';

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
