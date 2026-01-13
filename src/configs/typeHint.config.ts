import { SystemTypeHints } from "src/enums/systemTypeHints.enum";

export const SYSTEM_GENERATED_HINTS = [
  SystemTypeHints.MOST_VIEWED as string,
  SystemTypeHints.BEST_SELLERS as string,
  SystemTypeHints.TRENDING as string,
  SystemTypeHints.MOST_FAVORITED as string,
];

export const ADMIN_MANAGED_HINTS = [
  SystemTypeHints.STATIC as string,
  SystemTypeHints.PICKED as string,
  SystemTypeHints.RECOMMENDED as string,
];

export const TYPE_HINT_THRESHOLDS = {
  most_viewed: 10,
  best_sellers: 10,
  most_favorited: 10,
  trending: 10
};

export type SystemGeneratedHint = (typeof SYSTEM_GENERATED_HINTS)[number];