import { CronExpression } from '@nestjs/schedule';

export const CRON_JOBS = {
  BANNER: {
    DEACTIVATE_EXPIRED_BANNERS: CronExpression.EVERY_5_MINUTES,
  },
  PRODUCT: {
    RESET_WEEKLY_STATS: '0 0 * * 0', // Sunday midnight
  },
  TYPE_HINT: {
    DEACTIVATE_EXPIRED_TYPE_HINTS: CronExpression.EVERY_5_MINUTES,
  },
  SHOWCASE: {
    CHECK_INACTIVE_TYPE_HINT: CronExpression.EVERY_5_MINUTES,
  },
};
