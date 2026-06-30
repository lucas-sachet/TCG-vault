/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CollectionItem, Binder, BinderSlot, CardQuality } from '../types';
import { INITIAL_COLLECTION_ITEMS } from '../data/pokemonData';
import { findDefaultBinder, resolveBinderId } from '../constants/defaultBinder';
import { services } from '../services/serviceProvider';
import { COLLECTION_QUERY_KEYS } from './collectionQueryKeys';
import { usePersistFeedback } from './usePersistFeedback';

const HOLDINGS_QUERY_KEY = COLLECTION_QUERY_KEYS.holdings;
const BINDERS_QUERY_KEY = COLLECTION_QUERY_KEYS.binders;
const BINDER_SLOTS_QUERY_KEY = COLLECTION_QUERY_KEYS.binderSlots;

function findSlotIndex(
  slots: BinderSlot[],
  binderId: string,
  pageNumber: number,
  slotNumber: number,
): number {
  return slots.findIndex(
    (slot) =>
      slot.binderId === binderId &&
      slot.pageNumber === pageNumber &&
      slot.slotNumber === slotNumber,
  );
}

export function useHoldings() {
  const queryClient = useQueryClient();
  const { notifySaveFailure } = usePersistFeedback();

  const { data: collectionItems = [] } = useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: () => services.holdings.getHoldings(),
    initialData: () => services.holdings.getHoldings(),
    staleTime: Infinity,
  });

  const { data: binders = [] } = useQuery({
    queryKey: BINDERS_QUERY_KEY,
    queryFn: () => services.binders.getBinders(),
    initialData: () => services.binders.getBinders(),
    staleTime: Infinity,
  });

  const { data: binderSlots = [] } = useQuery({
    queryKey: BINDER_SLOTS_QUERY_KEY,
    queryFn: () => services.binderSlots.getBinderSlots(),
    initialData: () => services.binderSlots.getBinderSlots(),
    staleTime: Infinity,
  });

  async function persistHoldings(nextHoldings: CollectionItem[]): Promise<boolean> {
    const previousHoldings =
      queryClient.getQueryData<CollectionItem[]>(HOLDINGS_QUERY_KEY) ?? collectionItems;
    queryClient.setQueryData(HOLDINGS_QUERY_KEY, nextHoldings);

    const saved = await services.holdings.saveHoldings(nextHoldings);
    if (!saved) {
      queryClient.setQueryData(HOLDINGS_QUERY_KEY, previousHoldings);
      services.holdings.setHoldings(previousHoldings);
      notifySaveFailure('a coleção');
      return false;
    }

    return true;
  }

  async function persistBinders(nextBinders: Binder[]): Promise<boolean> {
    const previousBinders = queryClient.getQueryData<Binder[]>(BINDERS_QUERY_KEY) ?? binders;
    queryClient.setQueryData(BINDERS_QUERY_KEY, nextBinders);

    const saved = await services.binders.saveBinders(nextBinders);
    if (!saved) {
      queryClient.setQueryData(BINDERS_QUERY_KEY, previousBinders);
      services.binders.setBinders(previousBinders);
      notifySaveFailure('os binders');
      return false;
    }

    return true;
  }

  async function persistBinderSlots(nextSlots: BinderSlot[]): Promise<boolean> {
    const previousSlots = queryClient.getQueryData<BinderSlot[]>(BINDER_SLOTS_QUERY_KEY) ?? binderSlots;
    queryClient.setQueryData(BINDER_SLOTS_QUERY_KEY, nextSlots);

    const saved = await services.binderSlots.saveBinderSlots(nextSlots);
    if (!saved) {
      queryClient.setQueryData(BINDER_SLOTS_QUERY_KEY, previousSlots);
      services.binderSlots.setBinderSlots(previousSlots);
      notifySaveFailure('o layout do binder');
      return false;
    }

    return true;
  }

  async function syncHoldingBinderId(holdingId: string, binderId: string | undefined) {
    await persistHoldings(
      collectionItems.map((item) =>
        item.id === holdingId ? { ...item, binderId: binderId || undefined } : item,
      ),
    );
  }

  function removeSlotsForHolding(holdingId: string, slots: BinderSlot[]): BinderSlot[] {
    return slots.map((slot) =>
      slot.collectionItemId === holdingId ? { ...slot, collectionItemId: null } : slot,
    );
  }

  function removeSlotsForBinder(binderId: string, slots: BinderSlot[]): BinderSlot[] {
    return slots.filter((slot) => slot.binderId !== binderId);
  }

  function withDefaultBinder(holding: CollectionItem): CollectionItem {
    return {
      ...holding,
      binderId: resolveBinderId(holding.binderId, binders),
    };
  }

  const addHolding = (newItem: CollectionItem) => {
    void persistHoldings([withDefaultBinder(newItem), ...collectionItems]);
  };

  const deleteHolding = (itemId: string) => {
    void persistHoldings(collectionItems.filter((item) => item.id !== itemId));
    void persistBinderSlots(removeSlotsForHolding(itemId, binderSlots));
  };

  const importHoldings = (items: CollectionItem[]) => {
    const normalizedItems = items.map((item) => withDefaultBinder(item));
    void persistHoldings([...normalizedItems, ...collectionItems]);
  };

  const addBinder = (name: string, description?: string): string => {
    const newId = `binder-${Date.now()}`;
    const newBinder: Binder = {
      id: newId,
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    void persistBinders([...binders, newBinder]);
    return newId;
  };

  const updateBinder = (
    binderId: string,
    updates: { name?: string; description?: string; coverCardId?: string | null },
  ) => {
    void persistBinders(
      binders.map((binder) => {
        if (binder.id !== binderId) {
          return binder;
        }
        const nextBinder: Binder = {
          ...binder,
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.description !== undefined ? { description: updates.description } : {}),
        };
        if ('coverCardId' in updates) {
          nextBinder.coverCardId =
            updates.coverCardId === null ? undefined : updates.coverCardId;
        }
        return nextBinder;
      }),
    );
  };

  const deleteBinder = (binderId: string) => {
    const targetBinder = binders.find((binder) => binder.id === binderId);
    if (targetBinder?.isDefault) {
      return;
    }

    const defaultBinderId = findDefaultBinder(binders)?.id;
    void persistBinders(binders.filter((binder) => binder.id !== binderId));
    void persistHoldings(
      collectionItems.map((item) =>
        item.binderId === binderId ? { ...item, binderId: defaultBinderId } : item,
      ),
    );
    void persistBinderSlots(removeSlotsForBinder(binderId, binderSlots));
  };

  const updateHoldingBinder = async (itemId: string, binderId: string) => {
    const resolvedBinderId = resolveBinderId(binderId, binders);
    const currentHolding = collectionItems.find((item) => item.id === itemId);
    const hasSlotAssignment = binderSlots.some((slot) => slot.collectionItemId === itemId);

    if (hasSlotAssignment && currentHolding?.binderId !== resolvedBinderId) {
      const nextSlots = removeSlotsForHolding(itemId, binderSlots);
      const saved = await persistBinderSlots(nextSlots);
      if (!saved) {
        return;
      }
    }

    void persistHoldings(
      collectionItems.map((item) =>
        item.id === itemId ? { ...item, binderId: resolvedBinderId } : item,
      ),
    );
  };

  const assignHoldingToSlot = async (
    binderId: string,
    pageNumber: number,
    slotNumber: number,
    holdingId: string,
  ) => {
    let nextSlots = removeSlotsForHolding(holdingId, [...binderSlots]);
    const targetIndex = findSlotIndex(nextSlots, binderId, pageNumber, slotNumber);
    const displacedHoldingId =
      targetIndex >= 0 ? nextSlots[targetIndex].collectionItemId : null;

    if (targetIndex >= 0) {
      nextSlots[targetIndex] = { ...nextSlots[targetIndex], collectionItemId: holdingId };
    } else {
      nextSlots = [
        ...nextSlots,
        services.binderSlots.createSlotRecord(binderId, pageNumber, slotNumber, holdingId),
      ];
    }

    if (displacedHoldingId && displacedHoldingId !== holdingId) {
      nextSlots = removeSlotsForHolding(displacedHoldingId, nextSlots);
    }

    const saved = await persistBinderSlots(nextSlots);
    if (!saved) {
      return;
    }

    await syncHoldingBinderId(holdingId, binderId);
    if (displacedHoldingId && displacedHoldingId !== holdingId) {
      await syncHoldingBinderId(displacedHoldingId, undefined);
    }
  };

  const clearSlot = async (binderId: string, pageNumber: number, slotNumber: number) => {
    const slotIndex = findSlotIndex(binderSlots, binderId, pageNumber, slotNumber);
    if (slotIndex < 0) {
      return;
    }

    const holdingId = binderSlots[slotIndex].collectionItemId;
    const nextSlots = binderSlots.map((slot, index) =>
      index === slotIndex ? { ...slot, collectionItemId: null } : slot,
    );
    const saved = await persistBinderSlots(nextSlots);
    if (!saved) {
      return;
    }

    if (holdingId) {
      const defaultBinderId = findDefaultBinder(binders)?.id;
      await syncHoldingBinderId(holdingId, defaultBinderId);
    }
  };

  const moveHoldingBetweenSlots = async (
    sourceBinderId: string,
    sourcePage: number,
    sourceSlot: number,
    targetBinderId: string,
    targetPage: number,
    targetSlot: number,
  ) => {
    const sourceIndex = findSlotIndex(binderSlots, sourceBinderId, sourcePage, sourceSlot);
    if (sourceIndex < 0 || !binderSlots[sourceIndex].collectionItemId) {
      return;
    }

    const holdingId = binderSlots[sourceIndex].collectionItemId;
    let nextSlots = removeSlotsForHolding(holdingId, [...binderSlots]);

    const targetIndex = findSlotIndex(nextSlots, targetBinderId, targetPage, targetSlot);
    const displacedHoldingId =
      targetIndex >= 0 ? nextSlots[targetIndex].collectionItemId : null;

    if (targetIndex >= 0) {
      nextSlots[targetIndex] = { ...nextSlots[targetIndex], collectionItemId: holdingId };
    } else {
      nextSlots = [
        ...nextSlots,
        services.binderSlots.createSlotRecord(
          targetBinderId,
          targetPage,
          targetSlot,
          holdingId,
        ),
      ];
    }

    if (displacedHoldingId && displacedHoldingId !== holdingId) {
      const sourceSlotIndex = findSlotIndex(nextSlots, sourceBinderId, sourcePage, sourceSlot);
      if (sourceSlotIndex >= 0) {
        nextSlots[sourceSlotIndex] = {
          ...nextSlots[sourceSlotIndex],
          collectionItemId: displacedHoldingId,
        };
      } else {
        nextSlots = [
          ...nextSlots,
          services.binderSlots.createSlotRecord(
            sourceBinderId,
            sourcePage,
            sourceSlot,
            displacedHoldingId,
          ),
        ];
      }
    }

    const saved = await persistBinderSlots(nextSlots);
    if (!saved) {
      return;
    }

    await syncHoldingBinderId(holdingId, targetBinderId);
    if (displacedHoldingId && displacedHoldingId !== holdingId) {
      await syncHoldingBinderId(displacedHoldingId, sourceBinderId);
    }
  };

  const getSlotHoldingId = (
    binderId: string,
    pageNumber: number,
    slotNumber: number,
  ): string | null => {
    const slot = binderSlots.find(
      (entry) =>
        entry.binderId === binderId &&
        entry.pageNumber === pageNumber &&
        entry.slotNumber === slotNumber,
    );
    return slot?.collectionItemId ?? null;
  };

  const getSlottedHoldingIds = (): Set<string> => {
    return new Set(
      binderSlots
        .map((slot) => slot.collectionItemId)
        .filter((holdingId): holdingId is string => Boolean(holdingId)),
    );
  };

  const getBinderPageCount = (binderId: string): number => {
    const pagesForBinder = binderSlots
      .filter((slot) => slot.binderId === binderId)
      .map((slot) => slot.pageNumber);
    const maxPage = pagesForBinder.length > 0 ? Math.max(...pagesForBinder) : 0;
    return maxPage + 1;
  };

  const updateHoldingNotes = (itemId: string, notes: string) => {
    void persistHoldings(
      collectionItems.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    );
  };

  const updateHoldingQuality = (itemId: string, quality: CardQuality) => {
    void persistHoldings(
      collectionItems.map((item) => (item.id === itemId ? { ...item, quality } : item)),
    );
  };

  const updateHoldingPhotos = (
    itemId: string,
    frontPhotoUrl?: string,
    backPhotoUrl?: string,
  ) => {
    void persistHoldings(
      collectionItems.map((item) =>
        item.id === itemId ? { ...item, frontPhotoUrl, backPhotoUrl } : item,
      ),
    );
  };

  const updateHoldingPurchaseDetails = (
    itemId: string,
    updates: {
      purchasePrice?: number;
      purchaseDate?: string;
      gradeType?: 'Raw' | 'PSA' | 'CGC' | 'BGS';
      gradeValue?: string | number;
      certNumber?: string;
    },
  ) => {
    void persistHoldings(
      collectionItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    );
  };

  const resetHoldings = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      void persistHoldings(INITIAL_COLLECTION_ITEMS);
      void persistBinders([]);
      void persistBinderSlots([]);
      return;
    }

    void persistHoldings([]);
    void persistBinders([]);
    void persistBinderSlots([]);
  };

  const setCollectionItems = (
    updater: CollectionItem[] | ((previousItems: CollectionItem[]) => CollectionItem[]),
  ) => {
    const nextItems =
      typeof updater === 'function' ? updater(collectionItems) : updater;
    void persistHoldings(nextItems);
  };

  const setBinders = (updater: Binder[] | ((previousBinders: Binder[]) => Binder[])) => {
    const nextBinders = typeof updater === 'function' ? updater(binders) : updater;
    void persistBinders(nextBinders);
  };

  return {
    collectionItems,
    setCollectionItems,
    binders,
    setBinders,
    binderSlots,
    addHolding,
    deleteHolding,
    importHoldings,
    addBinder,
    updateBinder,
    deleteBinder,
    updateHoldingBinder,
    assignHoldingToSlot,
    clearSlot,
    moveHoldingBetweenSlots,
    getSlotHoldingId,
    getSlottedHoldingIds,
    getBinderPageCount,
    updateHoldingNotes,
    updateHoldingQuality,
    updateHoldingPhotos,
    updateHoldingPurchaseDetails,
    resetHoldings,
  };
}
