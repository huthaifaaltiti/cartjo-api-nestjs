import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppConfigDocument = AppConfig & Document;

@Schema({ timestamps: true })
export class AppConfig {
  @Prop({
    type: Number,
    default: 2,
    min: 1,
  })
  minActiveCategories: number;

  @Prop({
    type: Number,
    default: 2,
    min: 1,
  })
  minActiveBanners: number;

  @Prop({
    type: Number,
    default: 1,
    min: 1,
  })
  minActiveLogos: number;

  /**
   * How many days a live creator store must wait between handle changes.
   * Runtime-tunable mirror of `validationConfig.creatorStore.handleChangeCooldownDays`.
   */
  @Prop({
    type: Number,
    default: 30,
    min: 1,
  })
  handleChangeCooldownDays: number;

  /**
   * Platform commission (%) applied to a creator store on creation.
   * Runtime-tunable mirror of `validationConfig.creatorStore.defaultCommissionRate`.
   */
  @Prop({
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  })
  defaultCreatorStoreCommissionRate: number;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
