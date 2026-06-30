/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CollectionGoal, CollectionItem } from '../types';
import { services } from '../services/serviceProvider';
import { calculatePortfolioValue } from '../utils/valuation';

const GOALS_QUERY_KEY = ['collection', 'goals'] as const;

export function useAnalytics() {
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => services.goals.getGoals(),
    initialData: () => services.goals.getGoals(),
    staleTime: Infinity,
  });

  async function persistGoals(nextGoals: CollectionGoal[]) {
    queryClient.setQueryData(GOALS_QUERY_KEY, nextGoals);
    await services.goals.saveGoals(nextGoals);
  }

  const addGoal = (goalData: Omit<CollectionGoal, 'id' | 'createdAt'>) => {
    const newGoal: CollectionGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    void persistGoals([newGoal, ...goals]);
  };

  const deleteGoal = (goalId: string) => {
    void persistGoals(goals.filter((goal) => goal.id !== goalId));
  };

  const calculateTotalValue = (
    items: CollectionItem[],
    marketPrices: Record<string, number>,
  ): number => calculatePortfolioValue(items, marketPrices);

  const calculateTotalCost = (items: CollectionItem[]): number => {
    return items.reduce((sum, item) => sum + item.purchasePrice * (item.quantity || 1), 0);
  };

  const calculateProfitLoss = (
    items: CollectionItem[],
    marketPrices: Record<string, number>,
  ) => {
    const totalCost = calculateTotalCost(items);
    const totalValue = calculateTotalValue(items, marketPrices);
    const absolute = totalValue - totalCost;
    const percentage = totalCost > 0 ? (absolute / totalCost) * 100 : 0;

    return {
      absolute,
      percentage,
      isProfit: absolute >= 0,
    };
  };

  const setGoals = (
    updater: CollectionGoal[] | ((previousGoals: CollectionGoal[]) => CollectionGoal[]),
  ) => {
    const nextGoals = typeof updater === 'function' ? updater(goals) : updater;
    void persistGoals(nextGoals);
  };

  return {
    goals,
    setGoals,
    addGoal,
    deleteGoal,
    calculateTotalValue,
    calculateTotalCost,
    calculateProfitLoss,
  };
}
