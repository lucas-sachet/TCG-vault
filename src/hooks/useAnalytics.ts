/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CollectionGoal, CollectionItem, Card } from '../types';
import { services } from '../services/serviceProvider';

export function useAnalytics() {
  const [goals, setGoals] = useState<CollectionGoal[]>(() => services.goals.getGoals());

  // Persistent syncing to goals service
  useEffect(() => {
    services.goals.saveGoals(goals);
  }, [goals]);

  const addGoal = (goalData: Omit<CollectionGoal, 'id' | 'createdAt'>) => {
    const newGoal: CollectionGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Portfolio aggregates helpers for deep analytics tracking
  const calculateTotalValue = (items: CollectionItem[], marketPrices: Record<string, number>): number => {
    return items.reduce((sum, item) => {
      const price = marketPrices[item.cardId] || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const calculateTotalCost = (items: CollectionItem[]): number => {
    return items.reduce((sum, item) => {
      return sum + (item.purchasePrice * (item.quantity || 1));
    }, 0);
  };

  const calculateProfitLoss = (items: CollectionItem[], marketPrices: Record<string, number>) => {
    const totalCost = calculateTotalCost(items);
    const totalValue = calculateTotalValue(items, marketPrices);
    const absolute = totalValue - totalCost;
    const percentage = totalCost > 0 ? (absolute / totalCost) * 100 : 0;
    return {
      absolute,
      percentage,
      isProfit: absolute >= 0
    };
  };

  return {
    goals,
    setGoals,
    addGoal,
    deleteGoal,
    calculateTotalValue,
    calculateTotalCost,
    calculateProfitLoss
  };
}
