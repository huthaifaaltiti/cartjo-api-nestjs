import { Prop } from '@nestjs/mongoose';

export class NameRef {
  @Prop({ required: true })
  ar: string;

  @Prop({ required: true })
  en: string;
}

export class MultiLangText {
  @Prop({ required: true }) ar: string;
  @Prop({ required: true }) en: string;
}

export class MediaPreview {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, default: null })
  url: string;
}
