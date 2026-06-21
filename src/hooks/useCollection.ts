/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Card } from '../types';
import { POKEMON_CARDS } from '../data/pokemonData';
import { services } from '../services/serviceProvider';

export function useCollection() {
  const [cards, setCards] = useState<Card[]>(() => services.cards.getCards());

  // Persistent syncing to card service
  useEffect(() => {
    services.cards.saveCards(cards);
  }, [cards]);

  const addCard = (newCard: Card) => {
    setCards(prev => {
      if (prev.some(c => c.id === newCard.id)) return prev;
      return [newCard, ...prev];
    });
  };

  const importCards = (newCards: Card[]) => {
    setCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const filteredNew = newCards.filter(c => !existingIds.has(c.id));
      return [...filteredNew, ...prev];
    });
  };

  const resetCollection = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      setCards(POKEMON_CARDS);
    }
    // For 'empty', we keep reference catalog cards intact (as done in the original App.tsx)
  };

  return {
    cards,
    setCards,
    addCard,
    importCards,
    resetCollection
  };
}
