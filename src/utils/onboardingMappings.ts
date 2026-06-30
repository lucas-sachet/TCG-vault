import { CardLanguage, CollectionGoal, GoalType } from '../types';

export type OnboardingGoalKey =
  | 'collection_tracking'
  | 'investment_tracking'
  | 'master_sets'
  | 'wishlist_management';

export interface OnboardingLanguageOption {
  code: CardLanguage;
  label: string;
}

export const ONBOARDING_LANGUAGE_OPTIONS: OnboardingLanguageOption[] = [
  { code: 'EN', label: 'English Cards' },
  { code: 'JP', label: 'Japanese Cards' },
  { code: 'BR', label: 'Portuguese Cards' },
];

export interface OnboardingGoalOption {
  key: OnboardingGoalKey;
  label: string;
  description: string;
}

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  {
    key: 'collection_tracking',
    label: 'Collection Tracking',
    description:
      'Track raw/graded item coordinates, preserve condition profiles, and view photo cards.',
  },
  {
    key: 'investment_tracking',
    label: 'Investment Tracking',
    description:
      'Analyze ROI, cost basis distributions, historical charts, and financial gain ratios.',
  },
  {
    key: 'master_sets',
    label: 'Master Sets',
    description:
      'Audit checklist maps for set completion, find missing spots, and optimize binders.',
  },
  {
    key: 'wishlist_management',
    label: 'Wishlist Management',
    description:
      'Track upcoming set desires, target dynamic buying prices, and plan transactions.',
  },
];

export function mapOnboardingLanguagesToCodes(languageLabels: string[]): CardLanguage[] {
  const labelToCode = new Map(
    ONBOARDING_LANGUAGE_OPTIONS.map((option) => [option.label, option.code]),
  );

  const mappedLanguages = languageLabels
    .map((languageLabel) => labelToCode.get(languageLabel))
    .filter((code): code is CardLanguage => code !== undefined);

  if (mappedLanguages.length > 0) {
    return mappedLanguages;
  }

  return languageLabels.filter(
    (language): language is CardLanguage =>
      language === 'EN' || language === 'JP' || language === 'BR',
  );
}

export function mapOnboardingGoalToCollectionGoal(
  goalKey: OnboardingGoalKey,
  index: number,
): CollectionGoal {
  const goalDefinitions: Record<
    OnboardingGoalKey,
    { name: string; type: GoalType; targetValue: string }
  > = {
    collection_tracking: {
      name: 'Set Completion',
      type: 'set',
      targetValue: '',
    },
    investment_tracking: {
      name: 'Investment Milestone',
      type: 'value',
      targetValue: '1000',
    },
    master_sets: {
      name: 'Master Set Progress',
      type: 'master_set',
      targetValue: '',
    },
    wishlist_management: {
      name: 'Wishlist Targets',
      type: 'value',
      targetValue: '500',
    },
  };

  const definition = goalDefinitions[goalKey];

  return {
    id: `goal-${Date.now()}-${index}`,
    name: definition.name,
    type: definition.type,
    targetValue: definition.targetValue,
    createdAt: new Date().toISOString(),
  };
}
