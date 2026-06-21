/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  TrendingUp, 
  Settings as SettingsIcon, 
  Layers, 
  ChevronRight,
  HelpCircle,
  Eye,
  Activity,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

import { Card, CollectionItem, CardQuality, WishlistItem, PriceSnapshot, Binder, PriceNotification, CollectionGoal } from './types';
import { 
  POKEMON_CARDS, 
  CURRENT_MARKET_PRICES, 
  INITIAL_COLLECTION_ITEMS, 
  INITIAL_WISHLIST_ITEMS, 
  INITIAL_BINDERS, 
  CARD_PRICE_HISTORIES 
} from './data/pokemonData';

import { BottomNav, TabId } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { CollectionTab } from './components/CollectionTab';
import { JourneyTab } from './components/JourneyTab';
import { WishlistTab } from './components/WishlistTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SettingsTab } from './components/SettingsTab';
import { TrainerLabTab } from './components/TrainerLabTab';
import { AddCardModal } from './components/AddCardModal';
import { CardDetailsModal } from './components/CardDetailsModal';
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { services } from './services/serviceProvider';

// Custom State & Data Hooks
import { useCollection } from './hooks/useCollection';
import { useHoldings } from './hooks/useHoldings';
import { useWishlist } from './hooks/useWishlist';
import { usePortfolio } from './hooks/usePortfolio';
import { useAnalytics } from './hooks/useAnalytics';

export default function App() {
  // Authentication coordinates
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('pokevault_session_user') || null;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const currentEmail = localStorage.getItem('pokevault_session_user');
    return !!currentEmail && localStorage.getItem(`pokevault_onboarded_${currentEmail}`) === 'true';
  });

  useEffect(() => {
    if (userEmail) {
      setIsOnboarded(localStorage.getItem(`pokevault_onboarded_${userEmail}`) === 'true');
    } else {
      setIsOnboarded(false);
    }
  }, [userEmail]);

  const handleSignOut = () => {
    setUserEmail(null);
    localStorage.removeItem('pokevault_session_user');
  };

  // Decentralized State Hooks
  const { 
    cards, 
    addCard, 
    importCards, 
    resetCollection 
  } = useCollection();

  const {
    collectionItems,
    binders,
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
  } = useHoldings();

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
    activeUnreadNotifsCount
  } = usePortfolio();

  const {
    wishlistItems,
    addWishlistItem,
    deleteWishlistItem,
    acquireWishlistItem,
    resetWishlist
  } = useWishlist({ 
    cards, 
    marketPrices, 
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
        certNumber
      });
    }
  });

  const {
    goals,
    addGoal,
    deleteGoal
  } = useAnalytics();

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedBinderId, setSelectedBinderId] = useState<string>('binder-all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedCardIdDetails, setSelectedCardIdDetails] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [preferSpecimenPhoto, setPreferSpecimenPhoto] = useState<boolean>(() => services.settings.getPreferSpecimenPhoto());

  // User Profile State Syncing (reactive across Settings mutations)
  const [profileName, setProfileName] = useState<string>('Trainer Ash');
  const [profilePic, setProfilePic] = useState<string>('avatar-oak');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (userEmail) {
      const storedDisplay = localStorage.getItem(`pokevault_displayName_${userEmail}`) || 'Trainer Ash';
      const storedNick = localStorage.getItem(`pokevault_nickname_${userEmail}`) || '';
      const storedPic = localStorage.getItem(`pokevault_profilePic_${userEmail}`) || 'avatar-oak';

      setProfileName(storedNick.trim() || storedDisplay.trim());
      setProfilePic(storedPic);
    }
  }, [userEmail, activeTab]);

  const renderAvatar = (sizeClass = "w-8 h-8 text-lg") => {
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
    } else {
      const label = presetAvatars.find(a => a.id === profilePic)?.label || '👴';
      return (
        <div className={`${sizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner`}>
          <span>{label}</span>
        </div>
      );
    }
  };

  // Handle currency shifts
  useEffect(() => {
    if (selectedCurrency === 'USD') setCurrencySymbol('$');
    else if (selectedCurrency === 'EUR') setCurrencySymbol('€');
    else if (selectedCurrency === 'BRL') setCurrencySymbol('R$');
    else if (selectedCurrency === 'JPY') setCurrencySymbol('¥');
  }, [selectedCurrency]);

  // Command handlers delegating to self-contained analytical and portfolio state systems
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

  const handleDeleteCollectionItem = (itemId: string) => {
    deleteHolding(itemId);
  };

  const handleAddWishlistItem = (cardId: string, desiredPrice: number, priority: 'High' | 'Medium' | 'Low', notes?: string) => {
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
    certNumber?: string
  ) => {
    acquireWishlistItem(wishId, purchasePrice, purchaseDate, gradeType, gradeValue, certNumber);
  };

  const handleCSVImportCollection = (importedItems: CollectionItem[], importedCards: Card[]) => {
    importCards(importedCards);
    importHoldings(importedItems);
    importMarketPricesAndHistories(importedItems);
  };

  const handleAddBinder = (name: string, description?: string) => {
    addBinder(name, description);
  };

  const handleDeleteBinder = (binderId: string) => {
    deleteBinder(binderId);
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

  const handleUpdateCollectionItemPhotos = (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => {
    updateHoldingPhotos(itemId, frontPhotoUrl, backPhotoUrl);
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
  };

  const handleMarkNotificationRead = (notifId: string) => {
    markNotificationRead(notifId);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem(`pokevault_onboarded_${userEmail}`);
    localStorage.removeItem(`pokevault_languages_${userEmail}`);
    localStorage.removeItem(`pokevault_goals_${userEmail}`);
    localStorage.removeItem(`pokevault_displayName_${userEmail}`);
    localStorage.removeItem(`pokevault_country_${userEmail}`);
    localStorage.removeItem(`pokevault_aboutMe_${userEmail}`);
    localStorage.removeItem(`pokevault_profilePic_${userEmail}`);
    localStorage.removeItem(`pokevault_collectorSince_${userEmail}`);
    localStorage.removeItem(`pokevault_collectorProfile_${userEmail}`);
    localStorage.removeItem(`pokevault_showPurchasePrices_${userEmail}`);
    localStorage.removeItem(`pokevault_showROI_${userEmail}`);
    localStorage.removeItem(`pokevault_showCollectionValue_${userEmail}`);
    localStorage.removeItem(`pokevault_defaultBinder_${userEmail}`);

    resetHoldings('empty');
    resetWishlist('empty');

    setUserEmail(null);
    localStorage.removeItem('pokevault_session_user');
  };

  if (!userEmail) {
    return (
      <LandingPage 
        onAuthSuccess={(email) => {
          setUserEmail(email);
          localStorage.setItem('pokevault_session_user', email);
        }} 
      />
    );
  }

  if (!isOnboarded) {
    return (
      <OnboardingWizard
        userEmail={userEmail}
        onComplete={(collectionName, selectedLanguages, selectedGoals) => {
          // Establish primary vault custom binder
          const cleanName = collectionName.trim() || 'My Collection';
          const newBinderId = addBinder(cleanName, `Primary binder established during onboarding setup.`);
          
          // Switch tab selected binder focus
          setSelectedBinderId(newBinderId);

          // Save selected preferences
          localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(selectedLanguages));
          localStorage.setItem(`pokevault_goals_${userEmail}`, JSON.stringify(selectedGoals));

          // Set collection as empty for pristine new space simulation
          resetCollection('empty');
          resetHoldings('empty');

          // Save onboard status
          localStorage.setItem(`pokevault_onboarded_${userEmail}`, 'true');
          setIsOnboarded(true);

          // Focus on primary tab
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] font-sans antialiased pb-28 md:pb-0 md:pl-64">
      
      {/* Persistant header banner controls (Mobile viewport title) */}
      <header className="flex md:hidden items-center justify-between px-5 h-16 border-b border-slate-800 bg-[#14161f]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05]">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
            </svg>
          </div>
          <h1 className="text-base font-black tracking-widest text-white">
            TCG<span className="text-[#FFCB05]">VAULT</span>
          </h1>
        </div>

        {/* Sync status beacon */}
        <div className="flex items-center gap-2.5 relative">
          <button 
            onClick={() => setActiveTab('settings')}
            className="relative p-2 bg-slate-900 border border-slate-800 rounded-xl animate-fadeIn"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-400" />
            {activeUnreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            )}
          </button>
          
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="bg-[#FFCB05] p-2 rounded-xl text-slate-950 font-black cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-xs uppercase tracking-wide px-1">+ Card</span>
          </button>

          {/* User Profile Avatar click trigger on Mobile */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center focus:outline-none cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
              id="mobile-user-menu-btn"
            >
              {renderAvatar("w-8 h-8 text-base")}
            </button>
            
            {/* User Dropdown for Mobile Viewport */}
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/15" onClick={() => setIsUserMenuOpen(false)} />
                <div id="user-dropdown-mobile" className="absolute right-0 mt-3 w-56 bg-[#171A21] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-850 mb-2">
                    <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider block font-bold uppercase">MUTABLE ACCOUNT</span>
                    <span className="text-xs font-black text-slate-100 block truncate font-sans">{profileName}</span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate leading-normal mt-0.5">{userEmail}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-[#FFCB05] hover:bg-slate-900 rounded-xl transition-all font-mono uppercase text-left cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>User Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all font-mono uppercase text-left cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Main Header (Hidden below md) */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-[#12141c]/50 sticky top-0 backdrop-blur-md z-40">
        <div>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">COLLECTION OVERVIEW</span>
          <h1 className="text-xl font-bold tracking-tight text-white capitalize mt-0.5">
            TCG Vault & Binder
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-mono text-[10px] uppercase font-bold animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span>Last Price Update: Synced</span>
          </div>

          <div className="h-6 w-px bg-slate-850" />

          {/* Current selected binder name */}
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">Active Binder</span>
            <span className="font-bold text-xs text-white">
              {binders.find(b => b.id === selectedBinderId)?.name || 'Default General'}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-850" />

          {/* User Management dropdown on desktop */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-all duration-150 text-left focus:outline-none cursor-pointer"
              id="desktop-user-menu-btn"
            >
              {renderAvatar("w-7 h-7 text-sm")}
              <div className="max-w-[120px] truncate leading-none">
                <span className="text-[9px] text-slate-500 font-mono block uppercase">TRAINER PROFILE</span>
                <span className="text-xs font-bold text-slate-200 block truncate">{profileName}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setIsUserMenuOpen(false)} />
                <div id="user-dropdown-desktop" className="absolute right-0 mt-2.5 w-60 bg-[#1A1D24] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn">
                  <div className="px-3 py-2.5 border-b border-slate-800 mb-2">
                    <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider block font-bold uppercase">MUTABLE ACCOUNT</span>
                    <span className="text-sm font-black text-slate-100 block truncate font-sans">{profileName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block truncate leading-normal mt-0.5">{userEmail}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-[#FFCB05] hover:bg-slate-900 rounded-xl transition-all font-mono uppercase text-left cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>User Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all font-mono uppercase text-left cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Primary Layout Container Viewport grids */}
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab
            cards={cards}
            collectionItems={collectionItems}
            marketPrices={marketPrices}
            priceHistories={priceHistories}
            binders={binders}
            selectedBinderId={selectedBinderId}
            onSelectBinder={setSelectedBinderId}
            onViewCardDetails={setSelectedCardIdDetails}
            onOpenAddModal={() => setIsAddCardOpen(true)}
            onChangeTab={setActiveTab}
            onTriggerPriceSync={handleMarketPriceSync}
            isSyncing={isSyncing}
            currencySymbol={currencySymbol}
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionTab
            cards={cards}
            collectionItems={collectionItems}
            marketPrices={marketPrices}
            selectedBinderId={selectedBinderId}
            onViewCardDetails={setSelectedCardIdDetails}
            onOpenAddModal={() => setIsAddCardOpen(true)}
            currencySymbol={currencySymbol}
            preferSpecimenPhoto={preferSpecimenPhoto}
            onResetCollection={handleResetCollection}
            onGoToSettings={() => setActiveTab('settings')}
            binders={binders}
            onSelectBinder={setSelectedBinderId}
          />
        )}

        {activeTab === 'journey' && (
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

        {activeTab === 'wishlist' && (
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

        {activeTab === 'lab' && (
          <TrainerLabTab
            cards={cards}
            collectionItems={collectionItems}
            marketPrices={marketPrices}
            onViewCardDetails={setSelectedCardIdDetails}
            onAddHolding={addHolding}
            onUpdateCollectionItemQuality={updateHoldingQuality}
            onUpdateCollectionItemNotes={updateHoldingNotes}
            wishlistItems={wishlistItems}
            onAddWishlistItem={(item: any) => handleAddWishlistItem(item.cardId, item.desiredPrice, item.priority, item.notes)}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'analytics' && (
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

        {activeTab === 'settings' && (
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
      </main>

      {/* Floating Bottom Navigation Tab & Desktop Sidebar Sidebar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => setIsAddCardOpen(true)}
        notificationCount={activeUnreadNotifsCount}
      />

      {/* Main Core Dialog overlays modals */}
      {/* 1. Add Card sheet */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onCardAdded={handleCardAdded}
        binders={binders}
      />

      {/* 2. Card details overlay sheet */}
      <CardDetailsModal
        isOpen={selectedCardIdDetails !== null}
        cardId={selectedCardIdDetails}
        cards={cards}
        collectionItems={collectionItems}
        wishlistItems={wishlistItems}
        marketPrices={marketPrices}
        priceHistories={priceHistories}
        binders={binders}
        onClose={() => setSelectedCardIdDetails(null)}
        onDeleteCollectionItem={handleDeleteCollectionItem}
        onDeleteWishlistItem={handleDeleteWishlistItem}
        onUpdateCollectionItemBinder={handleUpdateCollectionItemBinder}
        onUpdateCollectionItemNotes={handleUpdateCollectionItemNotes}
        currencySymbol={currencySymbol}
        priceAlerts={priceAlerts}
        onUpdatePriceAlert={handleUpdatePriceAlert}
        onUpdateCollectionItemQuality={handleUpdateCollectionItemQuality}
        onUpdateCollectionItemPhotos={handleUpdateCollectionItemPhotos}
      />

    </div>
  );
}
