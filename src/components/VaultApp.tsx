/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CollectionItem, CardQuality, CollectionGoal } from '../types';
import { OnboardingWizard } from './OnboardingWizard';
import { services } from '../services/serviceProvider';
import { mapOnboardingGoalToCollectionGoal } from '../utils/onboardingMappings';
import { mvpFeatures } from '../config/mvpFeatures';
import { AppHeader, type AppTabId } from '../features/navigation';
import { useCollection } from '../hooks/useCollection';
import { useHoldings } from '../hooks/useHoldings';
import { useWishlist } from '../hooks/useWishlist';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAnalytics } from '../hooks/useAnalytics';

const DashboardTab = dynamic(() =>
  import('./DashboardTab').then((module) => ({ default: module.DashboardTab })),
);
const CollectionTab = dynamic(() =>
  import('./CollectionTab').then((module) => ({ default: module.CollectionTab })),
);
const JourneyTab = dynamic(() =>
  import('./JourneyTab').then((module) => ({ default: module.JourneyTab })),
);
const WishlistTab = dynamic(() =>
  import('./WishlistTab').then((module) => ({ default: module.WishlistTab })),
);
const AnalyticsTab = dynamic(() =>
  import('./AnalyticsTab').then((module) => ({ default: module.AnalyticsTab })),
);
const SettingsTab = dynamic(() =>
  import('./SettingsTab').then((module) => ({ default: module.SettingsTab })),
);
const TrainerLabTab = dynamic(() =>
  import('./TrainerLabTab').then((module) => ({ default: module.TrainerLabTab })),
);
const AddCardModal = dynamic(() =>
  import('./AddCardModal').then((module) => ({ default: module.AddCardModal })),
);
const CardDetailsModal = dynamic(() =>
  import('./CardDetailsModal').then((module) => ({ default: module.CardDetailsModal })),
);

function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-t-indigo-500 border-indigo-900/30 rounded-full animate-spin" />
    </div>
  );
}

interface VaultAppProps {
  userEmail: string;
  handleSignOut: () => void;
  handleDeleteAccount: () => void;
}

export function VaultApp({ userEmail, handleSignOut, handleDeleteAccount }: VaultAppProps) {
  const { cards, addCard, importCards, resetCollection } = useCollection();

  const {
    collectionItems,
    binders,
    binderSlots,
    addHolding,
    deleteHolding,
    importHoldings,
    addBinder,
    updateBinder,
    deleteBinder,
    updateHoldingBinder,
    updateHoldingNotes,
    updateHoldingQuality,
    updateHoldingPhotos,
    updateHoldingPurchaseDetails,
    resetHoldings,
    assignHoldingToSlot,
    clearSlot,
    moveHoldingBetweenSlots,
    getSlotHoldingId,
    getSlottedHoldingIds,
    getBinderPageCount,
  } = useHoldings();

  const {
    wishlistItems,
    addWishlistItem,
    deleteWishlistItem,
    acquireWishlistItem,
    resetWishlist,
  } = useWishlist({
    cards,
    marketPrices: services.prices.getMarketPrices(),
    onAcquire: (cardId, purchasePrice, purchaseDate, gradeType, gradeValue, certNumber) => {
      addHolding({
        id: `own-item-${Date.now()}`,
        cardId,
        purchaseDate,
        purchasePrice,
        currency: 'USD',
        quantity: 1,
        gradeType,
        gradeValue: gradeType === 'Raw' ? 'Raw' : gradeValue,
        certNumber,
      });
    },
  });

  const {
    marketPrices,
    priceHistories,
    priceNotifications,
    priceAlerts,
    isSyncing,
    addMarketPrice,
    importMarketPricesAndHistories,
    updatePriceAlert,
    markNotificationRead,
    syncMarketPrices,
    resetPortfolio,
    activeUnreadNotifsCount,
  } = usePortfolio();

  const { goals, addGoal, deleteGoal } = useAnalytics();

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() =>
    mvpFeatures.onboarding ? services.settings.getOnboarded() : true,
  );

  const [activeTab, setActiveTab] = useState<AppTabId>('collection');
  const [selectedBinderId, setSelectedBinderId] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedCardIdDetails, setSelectedCardIdDetails] = useState<string | null>(null);
  const [focusedHoldingId, setFocusedHoldingId] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [preferSpecimenPhoto, setPreferSpecimenPhoto] = useState<boolean>(() =>
    services.settings.getPreferSpecimenPhoto(),
  );

  const [profileName, setProfileName] = useState<string>('Trainer Ash');
  const [profilePic, setProfilePic] = useState<string>('avatar-oak');

  useEffect(() => {
    if (userEmail) {
      const storedDisplay = localStorage.getItem(`pokevault_displayName_${userEmail}`) || 'Trainer Ash';
      const storedNick = localStorage.getItem(`pokevault_nickname_${userEmail}`) || '';
      const storedPic = localStorage.getItem(`pokevault_profilePic_${userEmail}`) || 'avatar-oak';
      setProfileName(storedNick.trim() || storedDisplay.trim());
      setProfilePic(storedPic);
    }
  }, [userEmail, activeTab]);

  useEffect(() => {
    if (selectedCurrency === 'USD') setCurrencySymbol('$');
    else if (selectedCurrency === 'EUR') setCurrencySymbol('€');
    else if (selectedCurrency === 'BRL') setCurrencySymbol('R$');
    else if (selectedCurrency === 'JPY') setCurrencySymbol('¥');
  }, [selectedCurrency]);

  const renderAvatar = (sizeClass = 'w-8 h-8 text-lg') => {
    const presetAvatars = [
      { id: 'avatar-oak', label: '👴' },
      { id: 'avatar-ash', label: '🧢' },
      { id: 'avatar-misty', label: '💧' },
      { id: 'avatar-pikachu', label: '⚡' },
    ];

    if (profilePic && profilePic.startsWith('data:')) {
      return (
        <div className={`${sizeClass} rounded-full overflow-hidden border border-indigo-500/30 shadow-sm shrink-0 bg-slate-900`}>
          <img src={profilePic} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      );
    }

    const label = presetAvatars.find((avatar) => avatar.id === profilePic)?.label || '👴';
    return (
      <div className={`${sizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner`}>
        <span>{label}</span>
      </div>
    );
  };

  const handleAddGoal = (goalData: Omit<CollectionGoal, 'id' | 'createdAt'>) => {
    addGoal(goalData);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  const handleMarketPriceSync = () => {
    syncMarketPrices(cards, collectionItems, currencySymbol);
  };

  const handleCardAdded = (newCard: Card, newItem: CollectionItem) => {
    addCard(newCard);
    addMarketPrice(newCard.id, newItem.purchasePrice);
    addHolding(newItem);
  };

  const handleBulkCardAdded = async (newCards: Card[], newItems: CollectionItem[]) => {
    const cardsSaved = await importCards(newCards);
    if (!cardsSaved) {
      return;
    }
    importHoldings(newItems);
    importMarketPricesAndHistories(newItems);
  };

  const handleDeleteCollectionItem = (itemId: string) => {
    deleteHolding(itemId);
  };

  const handleAddWishlistItem = (
    cardId: string,
    desiredPrice: number,
    priority: 'High' | 'Medium' | 'Low',
    notes?: string,
  ) => {
    addWishlistItem(cardId, desiredPrice, priority, notes);
  };

  const handleDeleteWishlistItem = (wishId: string) => {
    deleteWishlistItem(wishId);
  };

  const handleAcquireWishlistItem = (
    wishId: string,
    purchasePrice: number,
    purchaseDate: string,
    gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS',
    gradeValue: string,
    certNumber?: string,
  ) => {
    acquireWishlistItem(wishId, purchasePrice, purchaseDate, gradeType, gradeValue, certNumber);
  };

  const handleCSVImportCollection = async (importedItems: CollectionItem[], importedCards: Card[]) => {
    const cardsSaved = await importCards(importedCards);
    if (!cardsSaved) {
      return;
    }
    importHoldings(importedItems);
    importMarketPricesAndHistories(importedItems);
  };

  const handleAddBinder = (name: string, description?: string) => {
    return addBinder(name, description);
  };

  const handleDeleteBinder = (binderId: string) => {
    deleteBinder(binderId);
    if (selectedBinderId === binderId) {
      const defaultBinder = binders.find((binder) => binder.isDefault);
      setSelectedBinderId(defaultBinder?.id ?? null);
    }
  };

  const handleUpdateCollectionItemBinder = (itemId: string, binderId: string) => {
    updateHoldingBinder(itemId, binderId);
  };

  const handleUpdateCollectionItemNotes = (itemId: string, notes: string) => {
    updateHoldingNotes(itemId, notes);
  };

  const handleUpdateCollectionItemQuality = (itemId: string, quality: CardQuality) => {
    updateHoldingQuality(itemId, quality);
  };

  const handleUpdateCollectionItemPhotos = (
    itemId: string,
    frontPhotoUrl?: string,
    backPhotoUrl?: string,
  ) => {
    updateHoldingPhotos(itemId, frontPhotoUrl, backPhotoUrl);
  };

  const handleUpdateCollectionItemPurchaseDetails = (
    itemId: string,
    updates: {
      purchasePrice?: number;
      purchaseDate?: string;
      gradeType?: 'Raw' | 'PSA' | 'CGC' | 'BGS';
      gradeValue?: string | number;
      certNumber?: string;
    },
  ) => {
    updateHoldingPurchaseDetails(itemId, updates);
  };

  const handleUpdatePriceAlert = (cardId: string, enabled: boolean, targetPrice: number) => {
    updatePriceAlert(cardId, enabled, targetPrice);
  };

  const handleResetCollection = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      resetCollection('seed');
      resetHoldings('seed');
      resetPortfolio('seed');
      resetWishlist('seed');
    } else {
      resetHoldings('empty');
      resetWishlist('empty');
    }
    setSelectedCardIdDetails(null);
    setFocusedHoldingId(null);
    setSelectedBinderId(null);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    markNotificationRead(notifId);
  };

  const handleViewHolding = (holdingId: string, cardId: string) => {
    setFocusedHoldingId(holdingId);
    setSelectedCardIdDetails(cardId);
  };

  const handleRemoveFromSlot = (holdingId: string) => {
    const slottedIds = getSlottedHoldingIds();
    if (!slottedIds.has(holdingId) || !selectedBinderId) return;
    for (let page = 0; page < getBinderPageCount(selectedBinderId); page += 1) {
      for (let slot = 0; slot < 9; slot += 1) {
        if (getSlotHoldingId(selectedBinderId, page, slot) === holdingId) {
          clearSlot(selectedBinderId, page, slot);
          return;
        }
      }
    }
  };

  if (mvpFeatures.onboarding && !isOnboarded) {
    return (
      <OnboardingWizard
        userEmail={userEmail}
        onComplete={async (collectionName, selectedLanguages, selectedGoals) => {
          const cleanName = collectionName.trim() || 'My Collection';
          const newBinderId = addBinder(cleanName, 'Primary binder established during onboarding setup.');
          setSelectedBinderId(newBinderId);
          services.settings.setLanguages(selectedLanguages);
          services.settings.setOnboarded(true);
          const newGoals: CollectionGoal[] = selectedGoals.map((goalKey, index) =>
            mapOnboardingGoalToCollectionGoal(goalKey, index),
          );
          await services.goals.saveGoals(newGoals);
          resetCollection('empty');
          resetHoldings('empty');
          setIsOnboarded(true);
          setActiveTab('collection');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] font-sans antialiased">
      <AppHeader
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => setIsAddCardOpen(true)}
        profileName={profileName}
        userEmail={userEmail}
        profilePic={profilePic}
        onSignOut={handleSignOut}
        renderAvatar={renderAvatar}
      />

      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <Suspense fallback={<TabLoadingFallback />}>
          {mvpFeatures.binders && activeTab === 'collection' && (
            <CollectionTab
              cards={cards}
              collectionItems={collectionItems}
              marketPrices={marketPrices}
              binders={binders}
              binderSlots={binderSlots}
              selectedBinderId={selectedBinderId}
              onSelectBinder={setSelectedBinderId}
              onAddBinder={handleAddBinder}
              onUpdateBinder={updateBinder}
              onDeleteBinder={handleDeleteBinder}
              onViewHolding={handleViewHolding}
              onOpenAddModal={() => setIsAddCardOpen(true)}
              currencySymbol={currencySymbol}
              getSlotHoldingId={getSlotHoldingId}
              getSlottedHoldingIds={getSlottedHoldingIds}
              getBinderPageCount={getBinderPageCount}
              assignHoldingToSlot={assignHoldingToSlot}
              clearSlot={clearSlot}
              moveHoldingBetweenSlots={moveHoldingBetweenSlots}
            />
          )}

          {mvpFeatures.journey && activeTab === 'collection' && (
            <JourneyTab
              cards={cards}
              collectionItems={collectionItems}
              marketPrices={marketPrices}
              priceHistories={priceHistories}
              binders={binders}
              onViewCardDetails={setSelectedCardIdDetails}
              currencySymbol={currencySymbol}
            />
          )}

          {mvpFeatures.wishlist && activeTab === 'collection' && (
            <WishlistTab
              cards={cards}
              wishlistItems={wishlistItems}
              marketPrices={marketPrices}
              onAddWishlistItem={handleAddWishlistItem}
              onDeleteWishlistItem={handleDeleteWishlistItem}
              onAcquireWishlistItem={handleAcquireWishlistItem}
              onViewCardDetails={setSelectedCardIdDetails}
              currencySymbol={currencySymbol}
            />
          )}

          {mvpFeatures.trainerLab && activeTab === 'collection' && (
            <TrainerLabTab
              cards={cards}
              collectionItems={collectionItems}
              marketPrices={marketPrices}
              onViewCardDetails={setSelectedCardIdDetails}
              onAddHolding={addHolding}
              onUpdateCollectionItemQuality={updateHoldingQuality}
              onUpdateCollectionItemNotes={updateHoldingNotes}
              wishlistItems={wishlistItems}
              onAddWishlistItem={(item) =>
                handleAddWishlistItem(item.cardId, item.desiredPrice, item.priority, item.notes)
              }
              currencySymbol={currencySymbol}
            />
          )}

          {mvpFeatures.analytics && activeTab === 'collection' && (
            <AnalyticsTab
              cards={cards}
              collectionItems={collectionItems}
              marketPrices={marketPrices}
              onImportCollection={handleCSVImportCollection}
              currencySymbol={currencySymbol}
              goals={goals}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {mvpFeatures.settings && activeTab === 'settings' && (
            <SettingsTab
              binders={binders}
              onAddBinder={handleAddBinder}
              onDeleteBinder={handleDeleteBinder}
              onResetCollection={handleResetCollection}
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
              priceNotifications={priceNotifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              preferSpecimenPhoto={preferSpecimenPhoto}
              onTogglePreferSpecimenPhoto={setPreferSpecimenPhoto}
              userEmail={userEmail || ''}
              onSignOut={handleSignOut}
              collectionItems={collectionItems}
              wishlistItems={wishlistItems}
              cards={cards}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </Suspense>
      </main>

      {mvpFeatures.addCard && (
        <AddCardModal
          isOpen={isAddCardOpen}
          onClose={() => setIsAddCardOpen(false)}
          onCardAdded={handleCardAdded}
          onBulkAdd={handleBulkCardAdded}
          binders={binders}
          marketPrices={marketPrices}
        />
      )}

      <CardDetailsModal
        isOpen={selectedCardIdDetails !== null}
        cardId={selectedCardIdDetails}
        cards={cards}
        collectionItems={collectionItems}
        wishlistItems={wishlistItems}
        marketPrices={marketPrices}
        priceHistories={priceHistories}
        binders={binders}
        onClose={() => {
          setSelectedCardIdDetails(null);
          setFocusedHoldingId(null);
        }}
        onDeleteCollectionItem={handleDeleteCollectionItem}
        onDeleteWishlistItem={handleDeleteWishlistItem}
        onUpdateCollectionItemBinder={handleUpdateCollectionItemBinder}
        onUpdateCollectionItemNotes={handleUpdateCollectionItemNotes}
        currencySymbol={currencySymbol}
        priceAlerts={priceAlerts}
        onUpdatePriceAlert={handleUpdatePriceAlert}
        onUpdateCollectionItemQuality={handleUpdateCollectionItemQuality}
        onUpdateCollectionItemPhotos={handleUpdateCollectionItemPhotos}
        onUpdateCollectionItemPurchaseDetails={handleUpdateCollectionItemPurchaseDetails}
        focusedHoldingId={focusedHoldingId}
        onRemoveFromSlot={handleRemoveFromSlot}
      />
    </div>
  );
}
