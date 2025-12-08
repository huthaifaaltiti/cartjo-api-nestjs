import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ _id: false }) // For embedded sub-documents, this prevents auto-generating _id for each subLocation
class LocationName {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

@Schema()
export class Location {
  @Prop({ type: LocationName, required: true })
  name: LocationName;

  @Prop({ required: true })
  price: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  subLocations: Location[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
