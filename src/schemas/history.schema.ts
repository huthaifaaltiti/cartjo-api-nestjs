import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { LogAction } from 'src/enums/LogAction.enum';
import { LogModule } from 'src/enums/logModules.enum';

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  @Prop({ type: String, enum: Object.values(LogAction), required: true })
  action: LogAction;

  @Prop({ type: String, enum: Object.values(LogModule), required: true })
  module: LogModule;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  reason?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  details?: any; // store entity snapshot or extra info
}

export const HistorySchema = SchemaFactory.createForClass(History);
