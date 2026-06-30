import { CollectionGoal } from '@/src/types';
import { IGoalService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

export class SupabaseGoalService implements IGoalService {
  private cache: CollectionGoal[] = [];

  getGoals(): CollectionGoal[] {
    return this.cache;
  }

  setGoals(goals: CollectionGoal[]): void {
    this.cache = goals;
    localStorage.setItem('tcgvault_goals', JSON.stringify(goals));
  }

  async saveGoals(goals: CollectionGoal[]): Promise<void> {
    this.cache = goals;
    localStorage.setItem('tcgvault_goals', JSON.stringify(goals));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;

    try {
      const localIds = goals.map((goal) => goal.id);
      if (localIds.length > 0) {
        await supabase
          .from('goals')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('goals')
          .delete()
          .eq('user_id', userId);
      }

      if (goals.length === 0) {
        return;
      }

      const databaseGoals = goals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        type: goal.type,
        target_value: goal.targetValue,
        user_id: userId,
        created_at: goal.createdAt,
      }));

      await supabase.from('goals').upsert(databaseGoals);
    } catch (error) {
      console.error('Error saving goals to Supabase:', error);
    }
  }
}

export const supabaseGoalService = new SupabaseGoalService();
