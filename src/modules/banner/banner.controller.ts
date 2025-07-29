import { Controller } from '@nestjs/common';

import { BannerService } from './banner.service';

@Controller('/api/v1/logo')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}
}
