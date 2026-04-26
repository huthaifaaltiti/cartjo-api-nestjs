import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { LogAction } from '../enums/logAction.enum';
import { LogModule } from '../enums/logModules.enum';

export type HistoryDocument = History & Document;

export enum ActionActorType {
  USER = 'user',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class History {
  @Prop({ type: String, enum: Object.values(LogAction), required: true })
  action: LogAction;

  @Prop({ type: String, enum: Object.values(LogModule), required: true })
  module: LogModule;

  @Prop({
    type: String,
    enum: Object.values(ActionActorType),
    default: ActionActorType.USER,
  })
  actorType: ActionActorType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  user: mongoose.Types.ObjectId | null;

  @Prop({ type: String, default: null })
  reason?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  details?: any; // store entity snapshot or extra info
}

export const HistorySchema = SchemaFactory.createForClass(History);
