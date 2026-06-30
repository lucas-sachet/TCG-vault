/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

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
      if (allOwnedCardIds.has(cardEntry.id) || allOwnedCardIds.has(`track-${cardEntry.id}`)) {
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
    const key = `page_${binderPage}_slot_${slotNumber}`;
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
