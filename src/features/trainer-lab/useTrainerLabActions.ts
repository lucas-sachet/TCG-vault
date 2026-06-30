/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import type { CardQuality, CollectionItem } from '../../types';
import type { SniperDeal } from './PriceSniperTool';

interface TrainerLabActionsOptions {
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  labData: ReturnType<typeof import('./useTrainerLabData').useTrainerLabData>;
  onAddHolding: (holding: CollectionItem) => void;
  onUpdateCollectionItemQuality: (id: string, quality: CardQuality) => void;
  onUpdateCollectionItemNotes: (id: string, notes: string) => void;
}

export function useTrainerLabActions({
  collectionItems,
  marketPrices,
  labData,
  onAddHolding,
  onUpdateCollectionItemQuality,
  onUpdateCollectionItemNotes,
}: TrainerLabActionsOptions) {
  function saveSimulationToNotes() {
    if (!labData.gradingCard) return;
    labData.setSavingGradeResult(true);

    const holding = collectionItems.find((item) => item.cardId === labData.gradingCard!.id);
    const newEntry = {
      id: `grad-sim-${Date.now()}`,
      cardName: labData.gradingCard.name,
      grade: `PSA ${labData.gradingScoreCalculated.predictedPSA}`,
      text: `${labData.gradingScoreCalculated.label} (Subnotes: Centering ${labData.gradingScoreCalculated.centeringScore}/10, Corners ${labData.condCorners}/10, Edges ${labData.condEdges}/10, Surface ${labData.condSurface}/10)`,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const updatedSimulations = [newEntry, ...labData.savedGradesHistory].slice(0, 5);
    labData.setSavedGradesHistory(updatedSimulations);
    localStorage.setItem('pokevault_grading_sims', JSON.stringify(updatedSimulations));

    if (holding) {
      const qualityMap: Record<number, CardQuality> = { 10: 'M', 9: 'NM', 8: 'NM', 7: 'SP', 6: 'MP', 5: 'HP', 4: 'D' };
      onUpdateCollectionItemQuality(holding.id, qualityMap[labData.gradingScoreCalculated.predictedPSA] || 'SP');
      onUpdateCollectionItemNotes(
        holding.id,
        `${holding.notes || ''}\n[Pre-grading: ${newEntry.grade} - Cent ${labData.centeringLeftRight}/${100 - labData.centeringLeftRight}]`.trim()
      );
    }

    setTimeout(() => labData.setSavingGradeResult(false), 1200);
  }

  function addNewSniperRule() {
    if (!labData.alertFormCardId || !labData.alertTargetPrice) return;
    const cardSelected = labData.allKnownCards.find((card) => card.id === labData.alertFormCardId);
    if (!cardSelected) return;

    const currentPrice = marketPrices[labData.alertFormCardId] || 25.0;
    const newRule = {
      id: `rule-${Date.now()}`,
      cardId: labData.alertFormCardId,
      cardName: `${cardSelected.name} (${cardSelected.number})`,
      targetPrice: Number(labData.alertTargetPrice),
      currentPrice,
    };

    const updatedRules = [...labData.sniperRules, newRule];
    labData.setSniperRules(updatedRules);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updatedRules));
    labData.setAlertTargetPrice('');
  }

  function removeSniperRule(ruleId: string) {
    const updatedRules = labData.sniperRules.filter((rule) => rule.id !== ruleId);
    labData.setSniperRules(updatedRules);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updatedRules));
  }

  function snipPurchaseCard(deal: SniperDeal) {
    onAddHolding({
      id: `own-item-${Date.now()}`,
      cardId: deal.cardId,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: deal.dealPrice,
      currency: 'USD',
      quantity: 1,
      gradeType: 'Raw',
      notes: `Sniped via Trainer Lab Sniper Engine! Source: ${deal.source} (Saved ${deal.discount})`,
    });

    const toastDiv = document.createElement('div');
    toastDiv.className =
      'fixed bottom-10 right-10 z-50 bg-[#161a21] border-2 border-emerald-500 font-bold p-4.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce';
    toastDiv.innerHTML = `
      <div class="p-2 bg-emerald-500/10 rounded-full text-emerald-400">🏆</div>
      <div class="text-left">
        <div class="text-xs text-emerald-400 uppercase tracking-widest font-mono">SNIPE COMPLETO!</div>
        <div class="text-xs text-white">Adicionado com sucesso pela pechincha de $${deal.dealPrice.toFixed(2)}!</div>
      </div>
    `;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 4000);
  }

  return { saveSimulationToNotes, addNewSniperRule, removeSniperRule, snipPurchaseCard };
}
