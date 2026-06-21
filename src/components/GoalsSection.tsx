/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Target, Trophy, Award, Plus, Trash2, Coins, ChevronDown, ChevronUp, Check, BookOpen, Flame, Sparkles } from 'lucide-react';
import { Card, CollectionItem, CollectionGoal, GoalType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface GoalsSectionProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  goals: CollectionGoal[];
  onAddGoal: (goal: Omit<CollectionGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (goalId: string) => void;
  currencySymbol?: string;
  isCompactMode?: boolean;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  cards,
  collectionItems,
  marketPrices,
  goals,
  onAddGoal,
  onDeleteGoal,
  currencySymbol = '$',
  isCompactMode = false,
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalIdToDelete, setGoalIdToDelete] = useState<string | null>(null);
  const [goalType, setGoalType] = useState<GoalType>('value');
  const [customGoalName, setCustomGoalName] = useState('');
  const [setTargetValue, setSetTargetValue] = useState('');
  const [pokemonTargetValue, setPokemonTargetValue] = useState('');
  const [valuationTargetValue, setValuationTargetValue] = useState('');

  // Extract unique sets from the existing cards database for dropdown population
  const uniqueSets = useMemo(() => {
    const setList = cards.map(c => c.set);
    return Array.from(new Set(setList)).sort();
  }, [cards]);

  // Extract unique Pokemon names from cards to make it even more fun and easy to select!
  const popularPokemon = ['Charizard', 'Umbreon', 'Gengar', 'Mew', 'Lugia', 'Pikachu', 'Rayquaza', 'Giratina'];

  // Portfolio total valuation helper
  const totalCurrentValue = useMemo(() => {
    return collectionItems.reduce((sum, item) => {
      const marketVal = marketPrices[item.cardId] || 0;
      return sum + (marketVal * item.quantity);
    }, 0);
  }, [collectionItems, marketPrices]);

  // Dynamic progress calculator per goal
  const calculatedGoals = useMemo(() => {
    return goals.map(goal => {
      let current = 0;
      let target = 0;
      let progressPercentage = 0;

      if (goal.type === 'set' || goal.type === 'master_set') {
        const setCardsList = cards.filter(c => c.set === goal.targetValue);
        target = setCardsList.length || 1;

        if (goal.type === 'set') {
          // Collected at least one copy
          current = setCardsList.filter(c => 
            collectionItems.some(item => item.cardId === c.id)
          ).length;
        } else {
          // Master Set option requires M/NM quality or graded score >= 9
          current = setCardsList.filter(c => 
            collectionItems.some(item => 
              item.cardId === c.id && 
              (item.quality === 'M' || item.quality === 'NM' || (item.gradeType !== 'Raw' && Number(item.gradeValue) >= 9))
            )
          ).length;
        }
      } else if (goal.type === 'pokemon') {
        const pkmnCardsList = cards.filter(c => 
          c.name.toLowerCase().includes(goal.targetValue.toLowerCase())
        );
        target = pkmnCardsList.length || 1;
        current = pkmnCardsList.filter(c => 
          collectionItems.some(item => item.cardId === c.id)
        ).length;
      } else if (goal.type === 'value') {
        target = Number(goal.targetValue) || 100;
        current = totalCurrentValue;
      }

      progressPercentage = Math.min(100, Math.round((current / target) * 100));

      return {
        ...goal,
        current,
        target,
        progressPercentage,
        isCompleted: progressPercentage >= 100,
      };
    });
  }, [goals, cards, collectionItems, totalCurrentValue]);

  // Handle goal creation submit
  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetVal = '';
    if (goalType === 'set' || goalType === 'master_set') {
      targetVal = setTargetValue || uniqueSets[0] || 'Base Set';
    } else if (goalType === 'pokemon') {
      targetVal = pokemonTargetValue || popularPokemon[0];
    } else if (goalType === 'value') {
      targetVal = valuationTargetValue || '1000';
    }

    if (!targetVal) return;

    let defaultName = '';
    if (goalType === 'set') {
      defaultName = `Complete Set: ${targetVal}`;
    } else if (goalType === 'master_set') {
      defaultName = `Master Set: ${targetVal}`;
    } else if (goalType === 'pokemon') {
      defaultName = `Collect all ${targetVal}s`;
    } else if (goalType === 'value') {
      defaultName = `Reach ${currencySymbol}${Number(targetVal).toLocaleString()} TCG Portfolio`;
    }

    onAddGoal({
      name: customGoalName.trim() || defaultName,
      type: goalType,
      targetValue: targetVal,
    });

    // Reset fields
    setCustomGoalName('');
    setSetTargetValue('');
    setPokemonTargetValue('');
    setValuationTargetValue('');
    setIsAddingGoal(false);
  };

  return (
    <div id="goals-widget" className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-4">
      {/* Header and Controls */}
      <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Active Collecting Goals</span>
        </h3>
        <button
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          className="text-xs bg-slate-900 h-10 px-3.5 rounded-xl text-emerald-400 hover:text-white border border-slate-800 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:bg-[#1E222C]"
        >
          {isAddingGoal ? (
            <>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create Goal</span>
            </>
          )}
        </button>
      </div>

      {/* Goal creation drawer / card block */}
      {isAddingGoal && (
        <form onSubmit={handleCreateGoalSubmit} className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Goal Type Choice */}
            <div>
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500 mb-1">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => {
                  setGoalType(e.target.value as GoalType);
                  // preset defaults
                  if (e.target.value === 'set' || e.target.value === 'master_set') {
                    setSetTargetValue(uniqueSets[0] || '');
                  } else if (e.target.value === 'pokemon') {
                    setPokemonTargetValue(popularPokemon[0]);
                  } else if (e.target.value === 'value') {
                    setValuationTargetValue('1000');
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="value">Reach Portfolio Value Target</option>
                <option value="set">Complete standard Card Set</option>
                <option value="master_set">Complete pristine Master Set</option>
                <option value="pokemon">Collect Pokémon Species</option>
              </select>
            </div>

            {/* Target Value Input Block conditional */}
            <div>
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500 mb-1">Target Criteria</label>
              
              {/* Type: Values */}
              {goalType === 'value' && (
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold text-xs">{currencySymbol}</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2500"
                    value={valuationTargetValue}
                    onChange={(e) => setValuationTargetValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 pl-6 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Type: Sets */}
              {(goalType === 'set' || goalType === 'master_set') && (
                <select
                  value={setTargetValue}
                  onChange={(e) => setSetTargetValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
                >
                  {uniqueSets.map(setName => (
                    <option key={setName} value={setName}>{setName}</option>
                  ))}
                </select>
              )}

              {/* Type: Pokemon */}
              {goalType === 'pokemon' && (
                <div className="flex gap-2">
                  <select
                    value={pokemonTargetValue}
                    onChange={(e) => setPokemonTargetValue(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
                  >
                    {popularPokemon.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="_custom">Custom Name...</option>
                  </select>
                  {pokemonTargetValue === '_custom' ? (
                    <input
                      type="text"
                      placeholder="Pokemon Name"
                      value={pokemonTargetValue === '_custom' ? '' : pokemonTargetValue}
                      onChange={(e) => setPokemonTargetValue(e.target.value)}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Active Species"
                      disabled
                      value={pokemonTargetValue}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-500 select-none outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase font-black text-slate-500 mb-1">Custom Goal Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Ultimate Shiny Charizard Hunt! (Leave blank for default)"
              value={customGoalName}
              onChange={(e) => setCustomGoalName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500"
              maxLength={60}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Launch Collecting Goal
          </button>
        </form>
      )}

      {/* Checklist / list of active goals */}
      {calculatedGoals.length === 0 ? (
        <div className="text-center py-6 bg-slate-950/20 rounded-xl border border-dashed border-slate-850">
          <Award className="w-8 h-8 text-slate-600 mx-auto mb-1 opacity-60" />
          <p className="text-xs text-slate-500 font-medium">No tracking goals declared.</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Define milestones to test your collectors zeal!</p>
        </div>
      ) : (
        <div className={`grid col-span-1 ${isCompactMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {calculatedGoals.map((goal) => {
            const getGoalBadgeColor = (type: GoalType) => {
              if (type === 'set') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
              if (type === 'master_set') return 'bg-amber-500/10 text-[#FFCB05] border-amber-500/20';
              if (type === 'pokemon') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
              return 'bg-green-500/10 text-green-400 border-green-500/20';
            };

            const getGoalTypeLabel = (type: GoalType) => {
              if (type === 'set') return 'Set Progress';
              if (type === 'master_set') return 'Master Set';
              if (type === 'pokemon') return 'Species Master';
              return 'Collection Value';
            };

            return (
              <div
                key={goal.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  goal.isCompleted
                    ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900/90 to-[#0F1C18]/80'
                    : 'border-slate-800 bg-[#14161E]/80'
                }`}
              >
                {/* Complete Watermark Icon */}
                {goal.isCompleted && (
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 animate-pulse" title="Goal Achieved!">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <span className={`inline-block text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getGoalBadgeColor(goal.type)}`}>
                        {getGoalTypeLabel(goal.type)}
                      </span>
                      <h4 className="font-bold text-slate-200 text-xs mt-1.5 truncate pr-5" title={goal.name}>
                        {goal.name}
                      </h4>
                    </div>

                    {/* Bin Icon */}
                    {!goal.isCompleted && (
                       <button
                         onClick={() => setGoalIdToDelete(goal.id)}
                         className="text-slate-500 hover:text-rose-500 h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900/60 transition-all shrink-0 cursor-pointer"
                         title="Delete Goal"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                  </div>

                  {/* Dynamic Metric Description */}
                  <div className="flex justify-between items-baseline font-mono text-[10px]">
                    <span className="text-slate-500 uppercase font-black">PROGRESS</span>
                    <span className={`font-bold ${goal.isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {goal.type === 'value' ? (
                        <>
                          {currencySymbol}{goal.current.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {currencySymbol}{goal.target.toLocaleString()}
                        </>
                      ) : (
                        <>
                          {goal.current} / {goal.target} Card{goal.target > 1 ? 's' : ''}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850 flex relative">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          goal.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                            : goal.type === 'master_set'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : goal.type === 'set'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                            : goal.type === 'pokemon'
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-400'
                            : 'bg-gradient-to-r from-green-500 to-emerald-400'
                        }`}
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-500">
                        {goal.isCompleted ? 'Target Achieved' : (
                          <>
                            {goal.type === 'master_set' && 'Pristine Cond.'}
                            {goal.type === 'set' && 'Expansion Sets'}
                            {goal.type === 'pokemon' && 'Species Hunt'}
                            {goal.type === 'value' && 'Valuation Gap'}
                          </>
                        )}
                      </span>
                      <span className={`font-black ${goal.isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {goal.progressPercentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Banner Badge on Achieved */}
                {goal.isCompleted && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/10 flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Success! Milestone reached.</span>
                    <button
                      onClick={() => setGoalIdToDelete(goal.id)}
                      className="ml-auto text-[9px] text-slate-500 hover:text-rose-400 font-normal font-mono uppercase bg-slate-905 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer"
                      title="Clear Completed Goal"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Confirm goal deleting alert safeguard */}
      <ConfirmationModal
        isOpen={goalIdToDelete !== null}
        onClose={() => setGoalIdToDelete(null)}
        onConfirm={() => {
          if (goalIdToDelete) {
            onDeleteGoal(goalIdToDelete);
          }
        }}
        title="Delete Milestone Goal?"
        description="Are you sure you want to remove this active target? This will cease progress logs and clear this tracker from your journey board."
        confirmText="Yes, delete goal"
        cancelText="No, keep it"
        type="danger"
      />
    </div>
  );
};
