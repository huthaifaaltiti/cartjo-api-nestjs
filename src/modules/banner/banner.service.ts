import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MediaService } from '../media/media.service';

import { Banner, BannerDocument } from 'src/schemas/banner.schema';

import { Model } from 'mongoose';

@Injectable()
export class BannerService {
  private readonly defaultBannerId: string;

  constructor(
    @InjectModel(Banner.name)
    private bannerModel: Model<BannerDocument>,
    private mediaService: MediaService,
  ) {
    this.defaultBannerId = process.env.DEFAULT_BANNER_ID;
  }
}
