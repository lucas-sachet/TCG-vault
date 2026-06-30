import { describe, expect, it } from 'vitest';
import {
  mapOnboardingGoalToCollectionGoal,
  ONBOARDING_GOAL_OPTIONS,
} from '@/src/utils/onboardingMappings';

describe('onboardingMappings', () => {
  it('maps onboarding goals to valid collection goal types', () => {
    ONBOARDING_GOAL_OPTIONS.forEach((goalOption, index) => {
      const goal = mapOnboardingGoalToCollectionGoal(goalOption.key, index);
      expect(['set', 'master_set', 'pokemon', 'value']).toContain(goal.type);
      expect(goal.name.length).toBeGreaterThan(0);
    });
  });
});
