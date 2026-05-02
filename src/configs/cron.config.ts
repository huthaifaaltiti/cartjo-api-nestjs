import { CronExpression } from '@nestjs/schedule';

export const CRON_JOBS = {
  BANNER: {
    DEACTIVATE_EXPIRED_BANNERS: CronExpression.EVERY_10_MINUTES,
  },
  PRODUCT: {
    RESET_WEEKLY_STATS: '0 0 * * 0', // Sunday midnight
  },
  TYPE_HINT: {
    DEACTIVATE_EXPIRED_TYPE_HINTS: '0 * * * * *', // Step 1: Runs every minute at 00 seconds
  },
  SHOWCASE: {
    CHECK_INACTIVE_TYPE_HINT: '20 * * * * *', // Step 2: Runs every minute at 20 seconds (after Type Hint)
    DEACTIVATE_EXPIRED_SHOWCASES: '40 * * * * *', // Step 3: Runs every minute at 40 seconds (after Step 2)
  },
};
