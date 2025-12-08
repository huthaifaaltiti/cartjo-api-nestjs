import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  relativePath: string;

  @Prop({ type: Types.ObjectId, required: false })
  relatedToId?: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: false })
  supabaseBackupUrl: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({
    required: true,
    enum: ['image', 'audio', 'video', 'document', 'spreadsheet', 'others'],
    default: 'others',
  })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  uploadKey: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  description: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop()
  lastAccessedAt: Date;

  // Optional: Add metadata for images
  @Prop({ type: Object, default: null })
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
    colorSpace?: string;
  };

  // Optional: Add metadata for videos
  @Prop({ type: Object, default: null })
  videoMetadata?: {
    duration?: number;
    width?: number;
    height?: number;
    codec?: string;
    bitrate?: number;
  };

  // Optional: Add metadata for audio
  @Prop({ type: Object, default: null })
  audioMetadata?: {
    duration?: number;
    bitrate?: number;
    codec?: string;
    channels?: number;
  };
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Add indexes for better performance
MediaSchema.index({ uploadedBy: 1, category: 1 });
MediaSchema.index({ uploadKey: 1 });
MediaSchema.index({ uploadedAt: -1 });
MediaSchema.index({ isActive: 1 });
MediaSchema.index({ tags: 1 });

// Add a virtual for file size in human readable format
MediaSchema.virtual('sizeFormatted').get(function () {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return (
    Math.round((this.size / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  );
});
