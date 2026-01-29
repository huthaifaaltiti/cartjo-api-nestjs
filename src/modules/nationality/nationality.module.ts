import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Nationality, NationalitySchema } from 'src/schemas/nationality.schema';
import { NationalityService } from './nationality.service';
import { NationalityController } from './nationality.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Nationality.name, schema: NationalitySchema },
    ]),
  ],
  providers: [NationalityService],
  controllers: [NationalityController],
  exports: [NationalityService],
})
export class NationalityModule {}
