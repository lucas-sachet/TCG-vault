/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../types';
import { POKEMON_CARDS } from '../data/pokemonData';
import { services } from '../services/serviceProvider';
import { COLLECTION_QUERY_KEYS } from './collectionQueryKeys';
import { usePersistFeedback } from './usePersistFeedback';

const CARDS_QUERY_KEY = COLLECTION_QUERY_KEYS.cards;

export function useCollection() {
  const queryClient = useQueryClient();
  const { notifySaveFailure } = usePersistFeedback();

  const { data: cards = [] } = useQuery({
    queryKey: CARDS_QUERY_KEY,
    queryFn: () => services.cards.getCards(),
    initialData: () => services.cards.getCards(),
    staleTime: Infinity,
  });

  async function persistCards(nextCards: Card[]): Promise<boolean> {
    const previousCards = queryClient.getQueryData<Card[]>(CARDS_QUERY_KEY) ?? cards;
    queryClient.setQueryData(CARDS_QUERY_KEY, nextCards);

    const saved = await services.cards.saveCards(nextCards);
    if (!saved) {
      queryClient.setQueryData(CARDS_QUERY_KEY, previousCards);
      services.cards.setCards(previousCards);
      notifySaveFailure('o catálogo de cartas');
      return false;
    }

    return true;
  }

  const addCard = (newCard: Card) => {
    const nextCards = cards.some((card) => card.id === newCard.id)
      ? cards
      : [newCard, ...cards];
    void persistCards(nextCards);
  };

  const importCards = async (newCards: Card[]) => {
    const existingIds = new Set(cards.map((card) => card.id));
    const filteredNewCards = newCards.filter((card) => !existingIds.has(card.id));
    return persistCards([...filteredNewCards, ...cards]);
  };

  const resetCollection = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      void persistCards(POKEMON_CARDS);
    }
  };

  const setCards = (updater: Card[] | ((previousCards: Card[]) => Card[])) => {
    const nextCards = typeof updater === 'function' ? updater(cards) : updater;
    void persistCards(nextCards);
  };

  return {
    cards,
    setCards,
    addCard,
    importCards,
    resetCollection,
  };
}
