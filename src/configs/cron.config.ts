import { CronExpression } from "@nestjs/schedule";

export const CRON_JOBS = {
  BANNER: {
    DEACTIVATE_EXPIRED_BANNERS: CronExpression.EVERY_HOUR,
  },
  PRODUCT: {
    RESET_WEEKLY_STATS: CronExpression.EVERY_WEEK,
  },
  TYPE_HINT: {
    DEACTIVATE_EXPIRED_TYPE_HINTS: CronExpression.EVERY_HOUR,
  },
  SHOWCASE: {
    CHECK_INACTIVE_TYPE_HINT: CronExpression.EVERY_HOUR,
  }
};
