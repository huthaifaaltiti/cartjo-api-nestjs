import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShowCase, ShowCaseDocument } from 'src/schemas/showcase.schema';
import { SYSTEM_SHOWCASES } from '../seeds/showcases.seed';

@Injectable()
export class ShowcaseSeeder {
  constructor(
    @InjectModel(ShowCase.name)
    private readonly showcaseModel: Model<ShowCaseDocument>,
  ) {}

  async seed() {
    await this.seedSystemShowcases();
  }

  private async seedSystemShowcases() {
    console.log('🚀 Seeding system showcases...');

    for (const showcaseData of SYSTEM_SHOWCASES) {
      const exists = await this.showcaseModel.findOne({
        type: showcaseData.type,
        isDeleted: false,
      });

      if (exists) {
        console.log(
          `⚠️ Showcase for type "${showcaseData.type}" already exists. Skipping.`,
        );
        continue;
      }

      const showcase = new this.showcaseModel({
        ...showcaseData,
        startDate: null,
        endDate: null,
      });

      await showcase.save();
      console.log(`✅ Created showcase: ${showcaseData.type}`);
    }

    console.log('✨ System showcases seeding completed.');
  }
}
