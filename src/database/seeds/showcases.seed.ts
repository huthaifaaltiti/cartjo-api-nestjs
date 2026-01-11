import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
import { SYSTEM_TYPE_HINTS } from './type-hints.seed';

const SYSTEM_USER_ID =
  process.env.DB_SYSTEM_OBJ_ID ?? '6847e72641171e61ab2295e6';

const SHOWCASE_CONFIG: Partial<
  Record<
    SystemTypeHints,
    {
      description: { en: string; ar: string };
      showAllButtonLink: string;
    }
  >
> = {
  [SystemTypeHints.STATIC]: {
    description: {
      en: 'Our hand-picked selections',
      ar: 'اختياراتنا المختارة بعناية',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.STATIC}`,
  },
  [SystemTypeHints.BEST_SELLERS]: {
    description: {
      en: 'Most popular items',
      ar: 'العناصر الأكثر شعبية',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.BEST_SELLERS}`,
  },
  [SystemTypeHints.MOST_VIEWED]: {
    description: {
      en: 'What everyone is looking at',
      ar: 'ما يشاهده الجميع حالياً',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.MOST_VIEWED}`,
  },
  [SystemTypeHints.TRENDING]: {
    description: {
      en: 'Hot items right now',
      ar: 'العناصر الرائجة حالياً',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.TRENDING}`,
  },
  [SystemTypeHints.MOST_FAVORITED]: {
    description: {
      en: 'Most loved by users',
      ar: 'الأكثر تفضيلاً من المستخدمين',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.MOST_FAVORITED}`,
  },
  [SystemTypeHints.PICKED]: {
    description: {
      en: 'Special items for you',
      ar: 'عناصر خاصة من أجلك',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.PICKED}`,
  },
  [SystemTypeHints.RECOMMENDED]: {
    description: {
      en: 'Based on your interests',
      ar: 'بناءً على اهتماماتك',
    },
    showAllButtonLink: `/search?typeHint=${SystemTypeHints.RECOMMENDED}`,
  },
};

export const SYSTEM_SHOWCASES = SYSTEM_TYPE_HINTS.map(hint => {
  const config = SHOWCASE_CONFIG[hint.key];

  return {
    type: hint.key,
    title: hint.label,
    description: config?.description ?? { en: '', ar: '' },
    showAllButtonText: { en: 'View All', ar: 'عرض الكل' },
    showAllButtonLink: config?.showAllButtonLink ?? '',
    isActive: true,
    isDeleted: false,
    isSystem: true,
    priority: hint.priority,
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID,
  };
});
