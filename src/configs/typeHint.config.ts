import { SystemTypeHints } from "src/enums/systemTypeHints.enum";

export const SYSTEM_GENERATED_HINTS = [
  SystemTypeHints.MOST_VIEWED,
  SystemTypeHints.BEST_SELLERS,
  SystemTypeHints.TRENDING,
  SystemTypeHints.MOST_FAVORITED,
];

export const ADMIN_MANAGED_HINTS = [
  SystemTypeHints.STATIC,
  SystemTypeHints.PICKED,
  SystemTypeHints.RECOMMENDED,
];

export const TYPE_HINT_THRESHOLDS = {
  most_viewed: 10,
  best_sellers: 10,
  most_favorited: 10,
  trending: 10
};

export type SystemGeneratedHint = (typeof SYSTEM_GENERATED_HINTS)[number];