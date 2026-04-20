import { CronExpression } from '@nestjs/schedule';

export const CRON_JOBS = {
  BANNER: {
    DEACTIVATE_EXPIRED_BANNERS: CronExpression.EVERY_10_MINUTES,
  },
  PRODUCT: {
    RESET_WEEKLY_STATS: '0 0 * * 0', // Sunday midnight
  },
  TYPE_HINT: {
    DEACTIVATE_EXPIRED_TYPE_HINTS: CronExpression.EVERY_2_HOURS,
  },
  SHOWCASE: {
    CHECK_INACTIVE_TYPE_HINT: CronExpression.EVERY_30_MINUTES,
    DEACTIVATE_EXPIRED_SHOWCASES: CronExpression.EVERY_10_MINUTES,
  },
};
