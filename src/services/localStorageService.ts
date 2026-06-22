/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionGoal } from '../types';
import { IGoalService, ISettingsService } from './interfaces';

export class LocalStorageGoalService implements IGoalService {
  getGoals(): CollectionGoal[] {
    const saved = localStorage.getItem('tcgvault_goals') || localStorage.getItem('pokevault_goals');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'g-1',
        name: 'Pikachu Collector',
        type: 'pokemon',
        targetValue: 'Pikachu',
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-2',
        name: 'Complete Obsidian Flames',
        type: 'set',
        targetValue: 'Obsidian Flames',
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-3',
        name: 'Reach $2000 Value Milestone',
        type: 'value',
        targetValue: '2000',
        createdAt: new Date().toISOString()
      }
    ];
  }

  saveGoals(goals: CollectionGoal[]): void {
    localStorage.setItem('tcgvault_goals', JSON.stringify(goals));
  }
}

export class LocalStorageSettingsService implements ISettingsService {
  getPreferSpecimenPhoto(): boolean {
    return localStorage.getItem('preferSpecimenPhoto') === 'true';
  }

  setPreferSpecimenPhoto(value: boolean): void {
    localStorage.setItem('preferSpecimenPhoto', String(value));
  }

  getOnboarded(): boolean {
    return localStorage.getItem('onboarded') === 'true';
  }

  setOnboarded(value: boolean): void {
    localStorage.setItem('onboarded', String(value));
  }

  getLanguages(): string[] {
    const saved = localStorage.getItem('languages');
    return saved ? JSON.parse(saved) : [];
  }

  setLanguages(value: string[]): void {
    localStorage.setItem('languages', JSON.stringify(value));
  }
}
