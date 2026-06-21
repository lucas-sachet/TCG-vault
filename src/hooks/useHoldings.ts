/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CollectionItem, Binder, CardQuality } from '../types';
import { INITIAL_COLLECTION_ITEMS, INITIAL_BINDERS } from '../data/pokemonData';
import { services } from '../services/serviceProvider';

export function useHoldings() {
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>(() => services.holdings.getHoldings());
  const [binders, setBinders] = useState<Binder[]>(() => services.binders.getBinders());

  // Persistent syncing to holdings service
  useEffect(() => {
    services.holdings.saveHoldings(collectionItems);
  }, [collectionItems]);

  // Persistent syncing to binder service
  useEffect(() => {
    services.binders.saveBinders(binders);
  }, [binders]);

  const addHolding = (newItem: CollectionItem) => {
    setCollectionItems(prev => [newItem, ...prev]);
  };

  const deleteHolding = (itemId: string) => {
    setCollectionItems(prev => prev.filter(i => i.id !== itemId));
  };

  const importHoldings = (items: CollectionItem[]) => {
    setCollectionItems(prev => [...items, ...prev]);
  };

  const addBinder = (name: string, description?: string): string => {
    const newId = `binder-${Date.now()}`;
    const newBinder: Binder = {
      id: newId,
      name,
      description,
      createdAt: new Date().toISOString()
    };
    setBinders(prev => [...prev, newBinder]);
    return newId;
  };

  const deleteBinder = (binderId: string) => {
    setBinders(prev => prev.filter(b => b.id !== binderId));
    // Move collection items from deleted binder to default all
    setCollectionItems(prev => prev.map(item => {
      if (item.binderId === binderId) {
        return { ...item, binderId: undefined };
      }
      return item;
    }));
  };

  const updateHoldingBinder = (itemId: string, binderId: string) => {
    setCollectionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, binderId: binderId || undefined };
      }
      return item;
    }));
  };

  const updateHoldingNotes = (itemId: string, notes: string) => {
    setCollectionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  const updateHoldingQuality = (itemId: string, quality: CardQuality) => {
    setCollectionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quality };
      }
      return item;
    }));
  };

  const updateHoldingPhotos = (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => {
    setCollectionItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, frontPhotoUrl, backPhotoUrl };
      }
      return item;
    }));
  };

  const resetHoldings = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      setCollectionItems(INITIAL_COLLECTION_ITEMS);
      setBinders(INITIAL_BINDERS);
    } else {
      setCollectionItems([]);
      setBinders(INITIAL_BINDERS);
    }
  };

  return {
    collectionItems,
    setCollectionItems,
    binders,
    setBinders,
    addHolding,
    deleteHolding,
    importHoldings,
    addBinder,
    deleteBinder,
    updateHoldingBinder,
    updateHoldingNotes,
    updateHoldingQuality,
    updateHoldingPhotos,
    resetHoldings
  };
}
