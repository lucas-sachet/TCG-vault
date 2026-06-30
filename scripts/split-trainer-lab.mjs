/** Split TrainerLabTab into src/features/trainer-lab/ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const license = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

`;
const created = [];
const tDir = 'src/features/trainer-lab';
const lines = fs.readFileSync(path.join(root, 'src/components/_TrainerLabTab.backup.tsx'), 'utf8').split('\n');

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  const count = content.split('\n').length;
  created.push({ path: rel, lines: count });
  if (count > 300) console.warn(`WARN ${count}L ${rel}`);
}

function slice(a, b) { return lines.slice(a - 1, b).join('\n'); }

write(`${tDir}/types.ts`, `${license}import type { Card, CollectionItem, WishlistItem } from '../../types';

export interface TrainerLabTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  onViewCardDetails: (cardId: string) => void;
  onAddHolding: (holding: CollectionItem) => void;
  onUpdateCollectionItemQuality: (id: string, quality: CollectionItem['quality']) => void;
  onUpdateCollectionItemNotes: (id: string, notes: string) => void;
  wishlistItems: WishlistItem[];
  onAddWishlistItem: (item: WishlistItem) => void;
  currencySymbol?: string;
  onViewCardDetailsDirect?: (cardId: string) => void;
}

export type TrainerLabToolId = 'checklist' | 'binder' | 'grading' | 'sniper';
`);

write(`${tDir}/presetTrackSets.ts`, `${license}${slice(54, 97).replace('const PRESET_TRACK_SETS = ', 'export const PRESET_TRACK_SETS = ')}
`);

write(`${tDir}/useTrainerLabData.ts`, `${license}'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Card, CollectionItem } from '../../types';
import { PRESET_TRACK_SETS } from './presetTrackSets';

export function useTrainerLabData(cards: Card[], collectionItems: CollectionItem[]) {
  const allKnownCards = useMemo(() => {
    const map = new Map<string, Card>();
    PRESET_TRACK_SETS.forEach(set => {
      set.cards.forEach(cardEntry => {
        map.set(cardEntry.id, {
          id: cardEntry.id,
          name: cardEntry.name,
          set: set.name,
          number: cardEntry.number,
          rarity: cardEntry.rarity,
          language: 'EN',
          imageUrl: cardEntry.imageUrl,
        });
      });
    });
    cards.forEach(card => { map.set(card.id, card); });
    return Array.from(map.values());
  }, [cards]);

  const allOwnedCardIds = useMemo(
    () => new Set(collectionItems.map(item => item.cardId)),
    [collectionItems]
  );

  const userOwnedCards = useMemo(
    () => collectionItems.map(item => {
      const card = allKnownCards.find(c => c.id === item.cardId);
      return { item, card };
    }).filter(entry => !!entry.card),
    [collectionItems, allKnownCards]
  );

  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const activeSet = PRESET_TRACK_SETS[selectedSetIndex];

  const setProgress = useMemo(() => {
    if (!activeSet) return { total: 0, owned: 0, percent: 0 };
    const total = activeSet.cards.length;
    let owned = 0;
    activeSet.cards.forEach(cardEntry => {
      if (allOwnedCardIds.has(cardEntry.id) || allOwnedCardIds.has(\`track-\${cardEntry.id}\`)) {
        owned++;
      } else {
        const matchingSimilar = collectionItems.some(item => {
          const userCard = cards.find(userCardEntry => userCardEntry.id === item.cardId);
          return userCard && userCard.name.toLowerCase().includes(cardEntry.name.split('-')[0].trim().toLowerCase());
        });
        if (matchingSimilar) owned++;
      }
    });
    return { total, owned, percent: total > 0 ? Math.round((owned / total) * 100) : 0 };
  }, [activeSet, allOwnedCardIds, collectionItems, cards]);

  const [binderPage, setBinderPage] = useState(1);
  const [binderPageSlots, setBinderPageSlots] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pokevault_virtual_binder');
    return saved ? JSON.parse(saved) : {};
  });

  function saveBinderSlots(newSlots: Record<string, string>) {
    setBinderPageSlots(newSlots);
    localStorage.setItem('pokevault_virtual_binder', JSON.stringify(newSlots));
  }

  const assignableCards = useMemo(
    () => userOwnedCards.map(entry => ({
      id: entry.card!.id,
      name: entry.card!.name,
      imageUrl: entry.card!.imageUrl,
      set: entry.card!.set,
    })),
    [userOwnedCards]
  );

  const [assigningSlot, setAssigningSlot] = useState<number | null>(null);

  function placeCardInSlot(slotNumber: number, cardId: string) {
    const key = \`page_\${binderPage}_slot_\${slotNumber}\`;
    const updated = { ...binderPageSlots };
    if (cardId === 'empty') delete updated[key];
    else updated[key] = cardId;
    saveBinderSlots(updated);
    setAssigningSlot(null);
  }

  const [gradingSelectedCardId, setGradingSelectedCardId] = useState('');
  const [centeringLeftRight, setCenteringLeftRight] = useState(50);
  const [centeringTopBottom, setCenteringTopBottom] = useState(50);
  const [condCorners, setCondCorners] = useState(10);
  const [condEdges, setCondEdges] = useState(10);
  const [condSurface, setCondSurface] = useState(10);
  const [savingGradeResult, setSavingGradeResult] = useState(false);
  const [savedGradesHistory, setSavedGradesHistory] = useState<Array<{ id: string; cardName: string; grade: string; text: string; date: string }>>(() => {
    const historical = localStorage.getItem('pokevault_grading_sims');
    return historical ? JSON.parse(historical) : [];
  });

  const gradingCard = useMemo(() => {
    if (!gradingSelectedCardId) return null;
    return allKnownCards.find(c => c.id === gradingSelectedCardId) || null;
  }, [gradingSelectedCardId, allKnownCards]);

  useEffect(() => {
    if (userOwnedCards.length > 0 && !gradingSelectedCardId) {
      setGradingSelectedCardId(userOwnedCards[0].card!.id);
    } else if (allKnownCards.length > 0 && !gradingSelectedCardId) {
      setGradingSelectedCardId(allKnownCards[0].id);
    }
  }, [userOwnedCards, allKnownCards, gradingSelectedCardId]);

  const gradingScoreCalculated = useMemo(() => {
    const diffLeftRight = Math.abs(50 - centeringLeftRight);
    const diffTopBottom = Math.abs(50 - centeringTopBottom);
    let centeringGrade = 10;
    const maxDiff = Math.max(diffLeftRight, diffTopBottom);
    if (maxDiff > 3) centeringGrade = 9.5;
    if (maxDiff > 6) centeringGrade = 9;
    if (maxDiff > 10) centeringGrade = 8.5;
    if (maxDiff > 15) centeringGrade = 7.5;
    if (maxDiff > 20) centeringGrade = 6.0;
    const subscores = [centeringGrade, condCorners, condEdges, condSurface];
    const average = subscores.reduce((sum, value) => sum + value, 0) / 4;
    let predictedPSA = 10;
    if (average >= 9.85) predictedPSA = 10;
    else if (average >= 9.3) predictedPSA = 9;
    else if (average >= 8.5) predictedPSA = 8;
    else if (average >= 7.5) predictedPSA = 7;
    else if (average >= 6.5) predictedPSA = 6;
    else if (average >= 5.5) predictedPSA = 5;
    else predictedPSA = 4;
    let label = '💎 GEM MINT';
    let text = 'Flawless centering eligible for PSA 10 gem certification. Symmetrical alignment and glossy finishes.';
    if (predictedPSA === 9) { label = '✨ MINT'; text = 'Virtually pristine specimen with minor alignment offset or micro surface scratch invisible to naked eye.'; }
    else if (predictedPSA === 8) { label = '🏆 NEAR MINT-MINT'; text = 'Slight corner white point or light silvering at back edges; high overall eye appeal.'; }
    else if (predictedPSA === 7) { label = '🛡️ NEAR MINT'; text = 'Definitive surface hair scuff or minor edge chipping. Suitable for binder display.'; }
    else if (predictedPSA <= 6) { label = '⚠️ EXCELLENT / PLAYED'; text = 'Moderate whitening or noticeable print line. Recommended to keep raw or sleeved.'; }
    return { average: average.toFixed(1), predictedPSA, label, text, centeringScore: centeringGrade };
  }, [centeringLeftRight, centeringTopBottom, condCorners, condEdges, condSurface]);

  const [alertFormCardId, setAlertFormCardId] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number | ''>('');
  const [sniperRules, setSniperRules] = useState<Array<{ id: string; cardId: string; cardName: string; targetPrice: number; currentPrice: number }>>(() => {
    const saved = localStorage.getItem('pokevault_sniper_rules');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rule-1', cardId: 'track-151-1', cardName: 'Charizard ex AA (151)', targetPrice: 100, currentPrice: 124.5 },
      { id: 'rule-2', cardId: 'track-bset-1', cardName: 'Charizard Holo (Base Set)', targetPrice: 320, currentPrice: 380 },
    ];
  });

  const sniperDeals = useMemo(() => [
    { id: 'deal-1', cardId: 'track-151-1', name: 'Charizard ex - Alt Art', set: '151 Classic Collection', source: 'eBay Auction Deal', discount: '32%', marketVal: 124.50, dealPrice: 84.00, shipping: 4.50, endsIn: '4 mins remaining', trusted: true, imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png' },
    { id: 'deal-2', cardId: 'track-obf-1', name: 'Charizard ex - Tera', set: 'Obsidian Flames', source: 'Discord Trade Group', discount: '23%', marketVal: 62.00, dealPrice: 48.00, shipping: 2.00, endsIn: 'Direct offer', trusted: false, imageUrl: 'https://images.pokemontcg.io/sv3/223_hires.png' },
    { id: 'deal-3', cardId: 'track-151-4', name: 'Pikachu IR', set: '151 Classic Collection', source: 'Cardmarket Listing', discount: '42%', marketVal: 24.90, dealPrice: 14.50, shipping: 1.50, endsIn: 'Instant Buy', trusted: true, imageUrl: 'https://images.pokemontcg.io/sv3pt5/173_hires.png' },
  ], []);

  return {
    allKnownCards, allOwnedCardIds, userOwnedCards,
    selectedSetIndex, setSelectedSetIndex, activeSet, setProgress,
    binderPage, setBinderPage, binderPageSlots, saveBinderSlots,
    assignableCards, assigningSlot, setAssigningSlot, placeCardInSlot,
    gradingSelectedCardId, setGradingSelectedCardId,
    centeringLeftRight, setCenteringLeftRight, centeringTopBottom, setCenteringTopBottom,
    condCorners, setCondCorners, condEdges, setCondEdges, condSurface, setCondSurface,
    savingGradeResult, setSavingGradeResult, savedGradesHistory, setSavedGradesHistory,
    gradingCard, gradingScoreCalculated,
    alertFormCardId, setAlertFormCardId, alertTargetPrice, setAlertTargetPrice,
    sniperRules, setSniperRules, sniperDeals,
  };
}
`);

// Tool components from JSX slices - need handler props for sniper/checklist
write(`${tDir}/SetChecklistTool.tsx`, `${license}'use client';

import { BookMarked, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { PRESET_TRACK_SETS } from './presetTrackSets';
import type { Card, CollectionItem } from '../../types';

export interface SetChecklistToolProps {
  selectedSetIndex: number;
  setSelectedSetIndex: (index: number) => void;
  activeSet: (typeof PRESET_TRACK_SETS)[number];
  setProgress: { total: number; owned: number; percent: number };
  allOwnedCardIds: Set<string>;
  collectionItems: CollectionItem[];
  cards: Card[];
  currencySymbol: string;
  onAddWishlistItem: (item: WishlistItem) => void;
  onAddHolding: (holding: CollectionItem) => void;
}

import type { WishlistItem } from '../../types';

export function SetChecklistTool(props: SetChecklistToolProps) {
  const {
    selectedSetIndex, setSelectedSetIndex, activeSet, setProgress,
    allOwnedCardIds, collectionItems, cards, currencySymbol,
    onAddWishlistItem, onAddHolding,
  } = props;

  return (
    <motion.div
      key="tool-checklist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
${slice(525, 701).replace(/^            /gm, '      ')}
    </motion.div>
  );
}
`);

write(`${tDir}/VirtualBinderTool.tsx`, `${license}'use client';

import { BadgeAlert, ChevronLeft, ChevronRight, Compass, Eye, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Card } from '../../types';

export interface VirtualBinderToolProps {
  binderPage: number;
  setBinderPage: (updater: (prev: number) => number) => void;
  binderPageSlots: Record<string, string>;
  allKnownCards: Card[];
  assignableCards: Array<{ id: string; name: string; imageUrl: string; set: string }>;
  assigningSlot: number | null;
  setAssigningSlot: (slot: number | null) => void;
  placeCardInSlot: (slotNumber: number, cardId: string) => void;
  onViewCardDetails: (cardId: string) => void;
}

export function VirtualBinderTool(props: VirtualBinderToolProps) {
  const {
    binderPage, setBinderPage, binderPageSlots, allKnownCards, assignableCards,
    assigningSlot, setAssigningSlot, placeCardInSlot, onViewCardDetails,
  } = props;

  return (
    <motion.div key="tool-binder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
${slice(719, 913)}
    </motion.div>
  );
}
`);

write(`${tDir}/GradingCalculatorTool.tsx`, `${license}'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Card } from '../../types';

export interface GradingCalculatorToolProps {
  allKnownCards: Card[];
  gradingSelectedCardId: string;
  setGradingSelectedCardId: (id: string) => void;
  gradingCard: Card | null;
  centeringLeftRight: number;
  setCenteringLeftRight: (value: number) => void;
  centeringTopBottom: number;
  setCenteringTopBottom: (value: number) => void;
  condCorners: number;
  setCondCorners: (value: number) => void;
  condEdges: number;
  setCondEdges: (value: number) => void;
  condSurface: number;
  setCondSurface: (value: number) => void;
  gradingScoreCalculated: { average: string; predictedPSA: number; label: string; text: string; centeringScore: number };
  savingGradeResult: boolean;
  savedGradesHistory: Array<{ id: string; cardName: string; grade: string; text: string; date: string }>;
  onSaveSimulation: () => void;
}

export function GradingCalculatorTool(props: GradingCalculatorToolProps) {
  const {
    allKnownCards, gradingSelectedCardId, setGradingSelectedCardId, gradingCard,
    centeringLeftRight, setCenteringLeftRight, centeringTopBottom, setCenteringTopBottom,
    condCorners, setCondCorners, condEdges, setCondEdges, condSurface, setCondSurface,
    gradingScoreCalculated, savingGradeResult, savedGradesHistory, onSaveSimulation,
  } = props;

  return (
    <motion.div key="tool-grading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
${slice(929, 1177).replace(/saveSimulationToNotes/g, 'onSaveSimulation')}
    </motion.div>
  );
}
`);

write(`${tDir}/PriceSniperTool.tsx`, `${license}'use client';

import { DollarSign, Flame, HelpCircle as InfoIcon, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import type { Card } from '../../types';

export interface SniperDeal {
  id: string;
  cardId: string;
  name: string;
  set: string;
  source: string;
  discount: string;
  marketVal: number;
  dealPrice: number;
  shipping: number;
  endsIn: string;
  trusted: boolean;
  imageUrl: string;
}

export interface PriceSniperToolProps {
  allKnownCards: Card[];
  marketPrices: Record<string, number>;
  currencySymbol: string;
  alertFormCardId: string;
  setAlertFormCardId: (id: string) => void;
  alertTargetPrice: number | '';
  setAlertTargetPrice: (value: number | '') => void;
  sniperRules: Array<{ id: string; cardId: string; cardName: string; targetPrice: number; currentPrice: number }>;
  sniperDeals: SniperDeal[];
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  onSnipPurchase: (deal: SniperDeal) => void;
}

export function PriceSniperTool(props: PriceSniperToolProps) {
  const {
    allKnownCards, marketPrices, currencySymbol,
    alertFormCardId, setAlertFormCardId, alertTargetPrice, setAlertTargetPrice,
    sniperRules, sniperDeals, onAddRule, onRemoveRule, onSnipPurchase,
  } = props;

  return (
    <motion.div key="tool-sniper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
${slice(1193, 1357).replace(/addNewSniperRule/g, 'onAddRule').replace(/removeSniperRule/g, 'onRemoveRule').replace(/snipPurchaseCard/g, 'onSnipPurchase')}
    </motion.div>
  );
}
`);

write(`${tDir}/TrainerLabTabContent.tsx`, `${license}'use client';

import { useState } from 'react';
import { BookMarked, Grid, Sliders, TrendingUp } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { TrainerLabTabProps, TrainerLabToolId } from './types';
import { useTrainerLabData } from './useTrainerLabData';
import { SetChecklistTool } from './SetChecklistTool';
import { VirtualBinderTool } from './VirtualBinderTool';
import { GradingCalculatorTool } from './GradingCalculatorTool';
import { PriceSniperTool } from './PriceSniperTool';
import { TrainerLabAiPanel } from './TrainerLabAiPanel';
import type { CollectionItem, WishlistItem } from '../../types';

export function TrainerLabTabContent({
  cards, collectionItems, marketPrices, onViewCardDetails, onAddHolding,
  onUpdateCollectionItemQuality, onUpdateCollectionItemNotes,
  wishlistItems, onAddWishlistItem, currencySymbol = '$',
}: TrainerLabTabProps) {
  const [activeTool, setActiveTool] = useState<TrainerLabToolId>('checklist');
  const data = useTrainerLabData(cards, collectionItems);

  function saveSimulationToNotes() {
    if (!data.gradingCard) return;
    data.setSavingGradeResult(true);
    const holding = collectionItems.find(item => item.cardId === data.gradingCard!.id);
    const newEntry = {
      id: \`grad-sim-\${Date.now()}\`,
      cardName: data.gradingCard.name,
      grade: \`PSA \${data.gradingScoreCalculated.predictedPSA}\`,
      text: \`\${data.gradingScoreCalculated.label} (Subnotes: Centering \${data.gradingScoreCalculated.centeringScore}/10, Corners \${data.condCorners}/10, Edges \${data.condEdges}/10, Surface \${data.condSurface}/10)\`,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    const updatedSims = [newEntry, ...data.savedGradesHistory].slice(0, 5);
    data.setSavedGradesHistory(updatedSims);
    localStorage.setItem('pokevault_grading_sims', JSON.stringify(updatedSims));
    if (holding) {
      const qualityMap: Record<number, CollectionItem['quality']> = { 10: 'M', 9: 'NM', 8: 'NM', 7: 'SP', 6: 'MP', 5: 'HP', 4: 'D' };
      onUpdateCollectionItemQuality(holding.id, qualityMap[data.gradingScoreCalculated.predictedPSA] || 'SP');
      onUpdateCollectionItemNotes(holding.id, \`\${holding.notes || ''}\\n[Pre-grading: \${newEntry.grade} - Cent \${data.centeringLeftRight}/\${100 - data.centeringLeftRight}]\`.trim());
    }
    setTimeout(() => data.setSavingGradeResult(false), 1200);
  }

  function addNewSniperRule() {
    if (!data.alertFormCardId || !data.alertTargetPrice) return;
    const cardSelected = data.allKnownCards.find(c => c.id === data.alertFormCardId);
    if (!cardSelected) return;
    const currentPrice = marketPrices[data.alertFormCardId] || 25.00;
    const newRule = {
      id: \`rule-\${Date.now()}\`,
      cardId: data.alertFormCardId,
      cardName: \`\${cardSelected.name} (\${cardSelected.number})\`,
      targetPrice: Number(data.alertTargetPrice),
      currentPrice,
    };
    const updated = [...data.sniperRules, newRule];
    data.setSniperRules(updated);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updated));
    data.setAlertTargetPrice('');
  }

  function removeSniperRule(id: string) {
    const updated = data.sniperRules.filter(rule => rule.id !== id);
    data.setSniperRules(updated);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updated));
  }

  function snipPurchaseCard(deal: typeof data.sniperDeals[number]) {
    onAddHolding({
      id: \`own-item-\${Date.now()}\`,
      cardId: deal.cardId,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: deal.dealPrice,
      currency: 'USD',
      quantity: 1,
      gradeType: 'Raw',
      notes: \`Sniped via Trainer Lab Sniper Engine! Source: \${deal.source} (Saved \${deal.discount})\`,
    } as CollectionItem);
    const toastDiv = document.createElement('div');
    toastDiv.className = 'fixed bottom-10 right-10 z-50 bg-[#161a21] border-2 border-emerald-500 font-bold p-4.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce';
    toastDiv.innerHTML = \`
      <div class="p-2 bg-emerald-500/10 rounded-full text-emerald-400">🏆</div>
      <div class="text-left">
        <div class="text-xs text-emerald-400 uppercase tracking-widest font-mono">SNIPE COMPLETO!</div>
        <div class="text-xs text-white">Adicionado com sucesso pela pechincha de $\${deal.dealPrice.toFixed(2)}!</div>
      </div>
    \`;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 4000);
  }

  return (
    <div className="space-y-6 text-left">
${slice(459, 507)}
      <AnimatePresence mode="wait">
        {activeTool === 'checklist' && (
          <SetChecklistTool
            selectedSetIndex={data.selectedSetIndex}
            setSelectedSetIndex={data.setSelectedSetIndex}
            activeSet={data.activeSet}
            setProgress={data.setProgress}
            allOwnedCardIds={data.allOwnedCardIds}
            collectionItems={collectionItems}
            cards={cards}
            currencySymbol={currencySymbol}
            onAddWishlistItem={onAddWishlistItem}
            onAddHolding={onAddHolding}
          />
        )}
        {activeTool === 'binder' && (
          <VirtualBinderTool
            binderPage={data.binderPage}
            setBinderPage={data.setBinderPage}
            binderPageSlots={data.binderPageSlots}
            allKnownCards={data.allKnownCards}
            assignableCards={data.assignableCards}
            assigningSlot={data.assigningSlot}
            setAssigningSlot={data.setAssigningSlot}
            placeCardInSlot={data.placeCardInSlot}
            onViewCardDetails={onViewCardDetails}
          />
        )}
        {activeTool === 'grading' && (
          <GradingCalculatorTool
            allKnownCards={data.allKnownCards}
            gradingSelectedCardId={data.gradingSelectedCardId}
            setGradingSelectedCardId={data.setGradingSelectedCardId}
            gradingCard={data.gradingCard}
            centeringLeftRight={data.centeringLeftRight}
            setCenteringLeftRight={data.setCenteringLeftRight}
            centeringTopBottom={data.centeringTopBottom}
            setCenteringTopBottom={data.setCenteringTopBottom}
            condCorners={data.condCorners}
            setCondCorners={data.setCondCorners}
            condEdges={data.condEdges}
            setCondEdges={data.setCondEdges}
            condSurface={data.condSurface}
            setCondSurface={data.setCondSurface}
            gradingScoreCalculated={data.gradingScoreCalculated}
            savingGradeResult={data.savingGradeResult}
            savedGradesHistory={data.savedGradesHistory}
            onSaveSimulation={saveSimulationToNotes}
          />
        )}
        {activeTool === 'sniper' && (
          <PriceSniperTool
            allKnownCards={data.allKnownCards}
            marketPrices={marketPrices}
            currencySymbol={currencySymbol}
            alertFormCardId={data.alertFormCardId}
            setAlertFormCardId={data.setAlertFormCardId}
            alertTargetPrice={data.alertTargetPrice}
            setAlertTargetPrice={data.setAlertTargetPrice}
            sniperRules={data.sniperRules}
            sniperDeals={data.sniperDeals}
            onAddRule={addNewSniperRule}
            onRemoveRule={removeSniperRule}
            onSnipPurchase={snipPurchaseCard}
          />
        )}
      </AnimatePresence>
      <TrainerLabAiPanel collectionSummary={\`Owned copies: \${collectionItems.length}. Unique cards: \${cards.length}.\`} />
    </div>
  );
}
`);

// Update index.ts
const existingIndex = fs.existsSync(path.join(root, `${tDir}/index.ts`))
  ? fs.readFileSync(path.join(root, `${tDir}/index.ts`), 'utf8')
  : '';
write(`${tDir}/index.ts`, `${license}export type { TrainerLabTabProps } from './types';
export { TrainerLabTabContent } from './TrainerLabTabContent';
export { TrainerLabAiPanel } from './TrainerLabAiPanel';
export { SetChecklistTool } from './SetChecklistTool';
export { VirtualBinderTool } from './VirtualBinderTool';
export { GradingCalculatorTool } from './GradingCalculatorTool';
export { PriceSniperTool } from './PriceSniperTool';
export { useTrainerLabData } from './useTrainerLabData';
export { PRESET_TRACK_SETS } from './presetTrackSets';
`);

write('src/components/TrainerLabTab.tsx', `${license}'use client';

export { TrainerLabTabContent as TrainerLabTab } from '../features/trainer-lab';
export type { TrainerLabTabProps } from '../features/trainer-lab';
`);

console.log('TrainerLab files:');
created.forEach(f => console.log(`${f.lines}\t${f.path}`));
