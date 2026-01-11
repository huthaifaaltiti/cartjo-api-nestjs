import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';

const SYSTEM_USER_ID =
  process.env.DB_SYSTEM_OBJ_ID ?? '6847e72641171e61ab2295e6';

export const SYSTEM_TYPE_HINTS = [
  {
    key: SystemTypeHints.STATIC,
    label: { en: 'Static', ar: 'أساسي' },
    priority: 1,
  },
  {
    key: SystemTypeHints.BEST_SELLERS,
    label: { en: 'Best Sellers', ar: 'الأفضل مبيعاً' },
    priority: 2,
  },
  {
    key: SystemTypeHints.MOST_VIEWED,
    label: { en: 'Most Viewed', ar: 'الأكثر مشاهدة' },
    priority: 3,
  },
  {
    key: SystemTypeHints.TRENDING,
    label: { en: 'Trending', ar: 'الأكثر رواجاً' },
    priority: 4,
  },
  {
    key: SystemTypeHints.MOST_FAVORITED,
    label: { en: 'Most Favorited', ar: 'الأكثر تفضيلاً' },
    priority: 5,
  },
  {
    key: SystemTypeHints.PICKED,
    label: { en: 'Picked Items', ar: 'عناصر مختارة' },
    priority: 6,
  },
  {
    key: SystemTypeHints.RECOMMENDED,
    label: { en: 'Recommended', ar: 'مقترحاتنا' },
    priority: 7,
  },
].map(item => ({
  ...item,
  isSystem: true,
  isActive: true,
  createdBy: SYSTEM_USER_ID,
  updatedBy: SYSTEM_USER_ID,
}));
