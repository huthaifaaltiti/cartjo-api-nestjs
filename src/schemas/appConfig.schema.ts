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
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
