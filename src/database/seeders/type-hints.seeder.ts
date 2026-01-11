import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeHintConfig } from 'src/schemas/typeHintConfig.schema';
import { SYSTEM_TYPE_HINTS } from '../seeds/type-hints.seed';

@Injectable()
export class TypeHintsSeeder {
  constructor(
    @InjectModel(TypeHintConfig.name)
    private readonly typeHintModel: Model<TypeHintConfig>,
  ) {}

  async seed() {
    await this.seedSystemTypeHints();
  }

  private async seedSystemTypeHints() {
    for (const hint of SYSTEM_TYPE_HINTS) {
      await this.typeHintModel.updateOne(
        { key: hint.key },
        { $setOnInsert: hint },
        { upsert: true }, // 👈 creates only if not exists
      );
    }

    console.log('✅ System type hints seeded successfully');
  }
}
