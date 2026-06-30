/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { TrainerLabTabProps, TrainerLabToolId } from './types';
import { useTrainerLabData } from './useTrainerLabData';
import { useTrainerLabActions } from './useTrainerLabActions';
import { TrainerLabToolNav } from './TrainerLabToolNav';
import { SetChecklistTool } from './SetChecklistTool';
import { VirtualBinderTool } from './VirtualBinderTool';
import { GradingCalculatorTool } from './GradingCalculatorTool';
import { PriceSniperTool } from './PriceSniperTool';
import { TrainerLabAiPanel } from './TrainerLabAiPanel';

export function TrainerLabTabContent({
  cards,
  collectionItems,
  marketPrices,
  onViewCardDetails,
  onAddHolding,
  onUpdateCollectionItemQuality,
  onUpdateCollectionItemNotes,
  onAddWishlistItem,
  currencySymbol = '$',
}: TrainerLabTabProps) {
  const [activeTool, setActiveTool] = useState<TrainerLabToolId>('checklist');
  const labData = useTrainerLabData(cards, collectionItems);
  const { saveSimulationToNotes, addNewSniperRule, removeSniperRule, snipPurchaseCard } = useTrainerLabActions({
    collectionItems,
    marketPrices,
    labData,
    onAddHolding,
    onUpdateCollectionItemQuality,
    onUpdateCollectionItemNotes,
  });

  return (
    <div className="space-y-6 text-left">
      <TrainerLabToolNav activeTool={activeTool} onSelectTool={setActiveTool} />

      <AnimatePresence mode="wait">
        {activeTool === 'checklist' && (
          <SetChecklistTool
            selectedSetIndex={labData.selectedSetIndex}
            setSelectedSetIndex={labData.setSelectedSetIndex}
            activeSet={labData.activeSet}
            setProgress={labData.setProgress}
            allOwnedCardIds={labData.allOwnedCardIds}
            collectionItems={collectionItems}
            cards={cards}
            currencySymbol={currencySymbol}
            onAddWishlistItem={onAddWishlistItem}
            onAddHolding={onAddHolding}
          />
        )}

        {activeTool === 'binder' && (
          <VirtualBinderTool
            binderPage={labData.binderPage}
            setBinderPage={labData.setBinderPage}
            binderPageSlots={labData.binderPageSlots}
            allKnownCards={labData.allKnownCards}
            assignableCards={labData.assignableCards}
            assigningSlot={labData.assigningSlot}
            setAssigningSlot={labData.setAssigningSlot}
            placeCardInSlot={labData.placeCardInSlot}
            onViewCardDetails={onViewCardDetails}
          />
        )}

        {activeTool === 'grading' && (
          <GradingCalculatorTool
            allKnownCards={labData.allKnownCards}
            gradingSelectedCardId={labData.gradingSelectedCardId}
            setGradingSelectedCardId={labData.setGradingSelectedCardId}
            gradingCard={labData.gradingCard}
            centeringLeftRight={labData.centeringLeftRight}
            setCenteringLeftRight={labData.setCenteringLeftRight}
            centeringTopBottom={labData.centeringTopBottom}
            setCenteringTopBottom={labData.setCenteringTopBottom}
            condCorners={labData.condCorners}
            setCondCorners={labData.setCondCorners}
            condEdges={labData.condEdges}
            setCondEdges={labData.setCondEdges}
            condSurface={labData.condSurface}
            setCondSurface={labData.setCondSurface}
            gradingScoreCalculated={labData.gradingScoreCalculated}
            savingGradeResult={labData.savingGradeResult}
            savedGradesHistory={labData.savedGradesHistory}
            onSaveSimulation={saveSimulationToNotes}
          />
        )}

        {activeTool === 'sniper' && (
          <PriceSniperTool
            allKnownCards={labData.allKnownCards}
            marketPrices={marketPrices}
            currencySymbol={currencySymbol}
            alertFormCardId={labData.alertFormCardId}
            setAlertFormCardId={labData.setAlertFormCardId}
            alertTargetPrice={labData.alertTargetPrice}
            setAlertTargetPrice={labData.setAlertTargetPrice}
            sniperRules={labData.sniperRules}
            sniperDeals={labData.sniperDeals}
            onAddRule={addNewSniperRule}
            onRemoveRule={removeSniperRule}
            onSnipPurchase={snipPurchaseCard}
          />
        )}
      </AnimatePresence>

      <TrainerLabAiPanel
        collectionSummary={`Owned copies: ${collectionItems.length}. Unique cards: ${cards.length}.`}
      />
    </div>
  );
}
