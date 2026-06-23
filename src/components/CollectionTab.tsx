/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Tag, Plus, Grid, List, Layers, HelpCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CollectionItem, Binder } from '../types';
import { CardItem } from './CardItem';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface CollectionTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  selectedBinderId: string;
  onViewCardDetails: (cardId: string) => void;
  onOpenAddModal: () => void;
  currencySymbol?: string;
  preferSpecimenPhoto?: boolean;
  onResetCollection?: (type: 'seed' | 'empty') => void;
  onGoToSettings?: () => void;
  binders: Binder[];
  onSelectBinder: (binderId: string) => void;
}

export const CollectionTab: React.FC<CollectionTabProps> = ({
  cards,
  collectionItems,
  marketPrices,
  selectedBinderId,
  onViewCardDetails,
  onOpenAddModal,
  currencySymbol = '$',
  preferSpecimenPhoto = false,
  onResetCollection,
  onGoToSettings,
  binders,
  onSelectBinder
}) => {
  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [profitFilter, setProfitFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'roi_desc' | 'name_asc' | 'date_desc'>('value_desc');
  const [isShowingFilters, setIsShowingFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'binder' | 'grid' | 'compact'>('binder');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Screen width observer to dynamically set mobile 2x3 vs desktop 3x3 layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset page whenever binders or active search/filters change to maintain alignment
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedBinderId, searchQuery, selectedLanguage, selectedRarity, profitFilter, sortBy]);

  // Multi-tier derived unique sets and rarities in cards
  const uniqueRarities = useMemo(() => {
    const rarities = new Set<string>();
    cards.forEach(c => { if (c.rarity) rarities.add(c.rarity); });
    return Array.from(rarities);
  }, [cards]);

  // Handle computing reactive filters on current collection items list
  const filteredAndSortedItems = useMemo(() => {
    // 1. Map individual holdings (copies) with initial data
    let holdings = collectionItems.map((item) => {
      const card = cards.find(c => c.id === item.cardId)!;
      const currentPrice = marketPrices[item.cardId] || 0;
      const totalCost = item.purchasePrice * item.quantity;
      const totalValue = currentPrice * item.quantity;
      const profit = totalValue - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      
      return {
        ...item,
        card,
        currentPrice,
        totalCost,
        totalValue,
        profit,
        roi
      };
    }).filter(item => !!item.card);

    // 2. Apply Binder ID Filter on holding level
    if (selectedBinderId !== 'binder-all') {
      holdings = holdings.filter(item => 
        item.binderId === selectedBinderId || 
        (!item.binderId && selectedBinderId === 'binder-all')
      );
    }

    // 3. Apply Search Query Filter on card information or notes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      holdings = holdings.filter(item => 
        item.card.name.toLowerCase().includes(query) ||
        item.card.set.toLowerCase().includes(query) ||
        item.card.number.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }

    // 4. Apply Language Filter on Card level
    if (selectedLanguage !== 'ALL') {
      holdings = holdings.filter(item => item.card.language === selectedLanguage);
    }

    // 5. Apply Rarity Filter on Card level
    if (selectedRarity !== 'ALL') {
      holdings = holdings.filter(item => item.card.rarity === selectedRarity);
    }

    // 6. Group filtered holdings by cardId
    const groups: Record<string, typeof holdings> = {};
    holdings.forEach(item => {
      if (!groups[item.cardId]) {
        groups[item.cardId] = [];
      }
      groups[item.cardId].push(item);
    });

    // 7. Map each group to an aggregated representation of the owned Card
    let result = Object.entries(groups).map(([cardId, items]) => {
      const firstItem = items[0];
      const card = firstItem.card;
      const currentPrice = marketPrices[cardId] || 0;
      
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
      const totalValue = currentPrice * totalQuantity;
      const profit = totalValue - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      
      // Determine Representative Grade indicators for the grouped catalog layout:
      // If there is only raw, gradeType is Raw. If there are multiple, say Multiple Copies/Slabs.
      const gradedItems = items.filter(i => i.gradeType !== 'Raw');
      let gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS' | 'Multiple' = 'Raw';
      let gradeValue: string | number = 'Raw';
      
      if (gradedItems.length === 1) {
        gradeType = gradedItems[0].gradeType;
        gradeValue = gradedItems[0].gradeValue || '';
      } else if (gradedItems.length > 1) {
        const uniqueTypes = Array.from(new Set(gradedItems.map(g => g.gradeType)));
        if (uniqueTypes.length === 1) {
          gradeType = uniqueTypes[0] as any;
          gradeValue = 'Slabs';
        } else {
          gradeType = 'Multiple';
          gradeValue = 'Slabs';
        }
      }

      // Determine Representative Condition
      const uniqueQualities = Array.from(new Set(items.map(i => i.quality || 'NM')));
      const representativeQuality = uniqueQualities.length === 1 ? uniqueQualities[0] : 'NM';

      return {
        id: cardId, // Use cardId as unique collectionItem ID key for rendering purposes
        cardId,
        card,
        holdings: items,
        quantity: totalQuantity,
        purchasePrice: totalQuantity > 0 ? (totalCost / totalQuantity) : 0,
        currentPrice,
        totalCost,
        totalValue,
        profit,
        roi,
        gradeType,
        gradeValue,
        quality: representativeQuality,
        purchaseDate: items.reduce((latest, i) => i.purchaseDate > latest ? i.purchaseDate : latest, '')
      };
    });

    // 8. Apply Profitability Filter at the grouped Card level (which represents portfolio health)
    if (profitFilter === 'PROFIT') {
      result = result.filter(item => item.profit > 0);
    } else if (profitFilter === 'LOSS') {
      result = result.filter(item => item.profit < 0);
    }

    // 9. Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'value_desc') return b.totalValue - a.totalValue;
      if (sortBy === 'value_asc') return a.totalValue - b.totalValue;
      if (sortBy === 'roi_desc') return b.roi - a.roi;
      if (sortBy === 'name_asc') return a.card.name.localeCompare(b.card.name);
      if (sortBy === 'date_desc') return b.purchaseDate.localeCompare(a.purchaseDate);
      return 0;
    });

    return result;
  }, [collectionItems, cards, marketPrices, selectedBinderId, searchQuery, selectedLanguage, selectedRarity, profitFilter, sortBy]);

  // Aggregate stats of filtered selection
  const filteredValue = filteredAndSortedItems.reduce((sum, item) => sum + item.totalValue, 0);

  // Binder View layout computations
  const pageSize = isMobile ? 6 : 9;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));
  const activePage = Math.min(currentPage, totalPages - 1);
  const pageStartIndex = activePage * pageSize;
  const pageItems = filteredAndSortedItems.slice(pageStartIndex, pageStartIndex + pageSize);

  const slots = Array.from({ length: pageSize }).map((_, index) => {
    return pageItems[index] || null;
  });

  const resetFilters = () => {
    setSelectedLanguage('ALL');
    setSelectedRarity('ALL');
    setProfitFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedLanguage !== 'ALL' || selectedRarity !== 'ALL' || profitFilter !== 'ALL' || searchQuery !== '';

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      
      {/* Tactical Binder Quick Switcher (UX Improvement) */}
      <div className="bg-gradient-to-r from-[#1A1D24] to-[#15171e] p-4 rounded-2xl border border-slate-850">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FFCB05]" />
            <span className="font-bold uppercase tracking-wider text-slate-200">Storage Binders Shelf</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-medium">Click shelf folder to screen sub-vaults</span>
        </div>
        
        {/* Horizontal scroll list of binders */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {binders.map((binder) => {
            const binderCount = binder.id === 'binder-all' 
              ? collectionItems.length
              : collectionItems.filter(item => item.binderId === binder.id).length;
              
            const isSelected = selectedBinderId === binder.id;
            
            return (
              <button
                key={binder.id}
                onClick={() => onSelectBinder(binder.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3B4CCA]/20 border-[#FFCB05] text-[#FFCB05] shadow-md shadow-blue-900/10'
                    : 'bg-[#12141a]/60 hover:bg-[#1C202B] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded ${isSelected ? 'bg-[#FFCB05]/15 text-[#FFCB05]' : 'bg-slate-900 text-slate-500'}`}>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="block text-xs leading-none font-bold">{binder.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono font-medium block mt-1">{binderCount} cards</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Advanced filter trigger row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="card-search-input"
            type="text"
            placeholder="Search by Pokémon name, set name, serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1A1D24] text-slate-100 hover:bg-[#20242D] focus:bg-[#20242D] border border-slate-850 rounded-2xl text-sm transition-all focus:outline-none focus:border-[#FFCB05]/40"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            id="filter-toggle-btn"
            onClick={() => setIsShowingFilters(!isShowingFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
              isShowingFilters || hasActiveFilters
                ? 'bg-[#FFCB05] text-[#0F1115] border-[#FFCB05]'
                : 'bg-[#1A1D24] border-slate-800 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-slate-950 text-white font-mono rounded-full w-4 h-4 flex items-center justify-center text-[8px]" style={{ fontSize: '8px' }}>
                !
              </span>
            )}
          </button>

          <div className="bg-[#1A1D24] p-1 border border-slate-800 rounded-2xl flex gap-1.5 items-center">
            <button
              onClick={() => setViewMode('binder')}
              className={`py-3 px-3.5 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold h-11 ${
                viewMode === 'binder' 
                  ? 'bg-[#3B4CCA] text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tactile Binder Pages"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Binder</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`py-3 px-3.5 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold h-11 ${
                viewMode === 'grid' 
                  ? 'bg-[#3B4CCA] text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gallery Grid"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`py-3 px-3.5 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold h-11 ${
                viewMode === 'compact' 
                  ? 'bg-[#3B4CCA] text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Spreadsheet"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Drawer/Panel */}
      {isShowingFilters && (
        <div id="advanced-filters-panel" className="bg-[#15181F] border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
          
          {/* Language filter */}
          <div>
            <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1.5">Language</label>
            <select
              id="language-select-filter"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-[#1A1D24]/80 text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:border-[#FFCB05]/40"
            >
              <option value="ALL">All Languages (US / JP / BR)</option>
              <option value="US">🇺🇸 EnglishOnly (EN)</option>
              <option value="JP">🇯🇵 JapaneseOnly (JP)</option>
              <option value="BR">🇧🇷 PortugueseOnly (BR)</option>
            </select>
          </div>

          {/* Rarity selector */}
          <div>
            <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1.5">Rarity Category</label>
            <select
              id="rarity-select-filter"
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-[#1A1D24]/80 text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:border-[#FFCB05]/40"
            >
              <option value="ALL">All Rarities</option>
              {uniqueRarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          {/* ROI Profitability filter */}
          <div>
            <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1.5">Value Trend</label>
            <select
              id="profit-select-filter"
              value={profitFilter}
              onChange={(e) => setProfitFilter(e.target.value as any)}
              className="w-full bg-[#1A1D24]/80 text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:border-[#FFCB05]/40"
            >
              <option value="ALL">All Trends</option>
              <option value="PROFIT">📈 Appreciated Cards</option>
              <option value="LOSS">📉 Below Buy-In</option>
            </select>
          </div>

          {/* Primary sorter */}
          <div>
            <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1.5">Sort Cards By</label>
            <select
              id="sort-select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#1A1D24]/80 text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:border-[#FFCB05]/40"
            >
              <option value="value_desc">Value: Highest First</option>
              <option value="value_asc">Value: Lowest First</option>
              <option value="roi_desc">Growth: Highest First</option>
              <option value="name_asc">Card Name (A-Z)</option>
              <option value="date_desc">Purchase Date: Recent First</option>
            </select>
          </div>

          {/* Quick reset button */}
          <div className="sm:col-span-4 flex justify-end gap-2 border-t border-slate-800/60 pt-3">
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Clear Active Filters
            </button>
            <button
              onClick={() => setIsShowingFilters(false)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg font-bold"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Aggregate summaries block of search */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono">
          Showing {filteredAndSortedItems.length} of {collectionItems.length} cards owned
          {selectedBinderId !== 'binder-all' ? ' in active binder' : ''}
        </span>
        {hasActiveFilters && (
          <span className="font-bold text-[#FFCB05]">
            Target Valuation: {currencySymbol}{filteredValue.toLocaleString()}
          </span>
        )}
      </div>

      {/* Grid rendering cards */}
      {collectionItems.length === 0 ? (
        <div id="onboarding-guidance-wizard" className="max-w-4xl mx-auto bg-[#1A1D24] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden select-none">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-[#3B4CCA]/5 to-transparent blur-2xl pointer-events-none rounded-full" />

          {/* Heading */}
          <div className="text-center space-y-2 relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 font-extrabold tracking-widest uppercase font-mono">
              CLOSED BETA ONBOARDING
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-wide mt-2 uppercase">
              Welcome to your TCG Vault Dock
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Your physical cardboard investment database starts here. Choose step-by-step custom logging, spreadsheet migration, or load our starter showcase pack to explore immediate valuation analytics.
            </p>
          </div>

          {/* Core Action bento list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 pt-2">
            
            {/* Column 1: Seed portfolio templates */}
            <div className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group">
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 text-[#FFCB05] rounded-xl border border-amber-950/20 w-fit">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#FFCB05] transition-colors leading-snug">
                    1. Starter Specimen Seed
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Instantly load a curated $12,500 collection (vintage raw Charizards, Gem-Mint Umbreons, high-grade slabs) to witness dynamic portfolio tickers, price charts, and volatility logs.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onResetCollection?.('seed')}
                className="mt-6 w-full py-2.5 bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Populate Demo Pack</span>
              </button>
            </div>

            {/* Column 2: Manual customized card entry */}
            <div className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group">
              <div className="space-y-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-950/20 w-fit">
                  <Plus className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors leading-snug">
                    2. Register physical specimens
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Surgical precise logging. Add cards directly from our integrated TCG-Catalog or key in unique custom slabs complete with grade certificates and physical specimen photos.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAddModal}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Add First Slab</span>
              </button>
            </div>

            {/* Column 3: Spreadsheets CSV ledger parser */}
            <div className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-950/20 w-fit">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug">
                    3. Spreadsheet CSV Import
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Already tracking elsewhere? Upload lists via standard offline `.csv` structures. We will auto-match names, sets, and fetch standard market quotes for your portfolio.
                  </p>
                </div>
              </div>
              <button
                onClick={onGoToSettings}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all duration-300 border border-slate-700 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Migrate CSV Data</span>
              </button>
            </div>

          </div>

          {/* Quick informative footer card */}
          <div className="bg-slate-900/45 p-4 border border-slate-850 rounded-2xl flex items-center gap-3.5 text-xs text-slate-400 leading-normal max-w-2xl mx-auto">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <p>
              🛡️ <strong className="text-slate-300 font-semibold text-xs">Sandbox Mode:</strong> All ledger entries and uploaded image assets are stored securely within your local browser storage cache indexes.
            </p>
          </div>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div id="empty-collection-state" className="text-center py-24 bg-[#1A1D24] rounded-3xl border border-dashed border-slate-800 max-w-lg mx-auto">
          <Layers className="w-12 h-12 text-[#FFCB05]/80 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Empty Vault</h3>
          <p className="text-xs text-slate-400 mt-2 px-6">
            We couldn't locate any cards matching your query. Turn off filters to view your full collection or add new ones.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="bg-slate-800 border border-slate-705 px-4 py-2 rounded-xl text-xs font-bold text-slate-200"
              >
                Clear Filters
              </button>
            )}
            <button
              id="add-first-empty-btn"
              onClick={onOpenAddModal}
              className="bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
            >
              Add Card Row
            </button>
          </div>
        </div>
      ) : viewMode === 'binder' ? (
        /* Visual Interactive Physical Binder View */
        <div id="binder-view-container" className="space-y-6">
          {/* Main Simulated Physical Binder Page Panel */}
          <div className="relative bg-[#111318]/90 border border-slate-800 rounded-3xl p-5 md:p-8 md:pl-12 shadow-2xl overflow-hidden min-h-[500px]">
            {/* Real Plastic / Leather Binder Binder Spine Highlight Effect */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
            
            {/* Mechanical binder ring spine on the left visual edge (acts as binder mount edge) on desktop */}
            <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#181B22] via-[#212530] to-[#14161E] border-r border-slate-800/80 pointer-events-none hidden md:flex flex-col justify-around py-14 items-center z-10 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5)]">
              {/* Silver metallic steel rings */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-4.5 rounded-full border border-slate-800 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-100 shadow-[1px_2px_4px_rgba(0,0,0,0.6)] relative flex items-center justify-center translate-x-1" style={{ borderRadius: '50%' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#181B22] border-t border-slate-400 shadow-inner" />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 relative z-10"
              >
                {slots.map((item, index) => {
                  if (item) {
                    return (
                      <div key={item.id} className="relative group transition-all">
                        {/* Sleeve pocket visual border back-drop wrapper */}
                        <div className="absolute inset-0 bg-[#3B4CCA]/5 border border-slate-800 rounded-2xl pointer-events-none z-0 transform group-hover:scale-[1.03] transition-all duration-300" />
                        <CardItem
                          card={item.card}
                          collectionItem={item}
                          currentPrice={item.currentPrice}
                          onViewDetails={() => onViewCardDetails(item.cardId)}
                          currencySymbol={currencySymbol}
                          preferSpecimenPhoto={preferSpecimenPhoto}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`empty-pocket-${index}`}
                        onClick={onOpenAddModal}
                        className="relative aspect-[3/4.1] bg-[#0E1116] hover:bg-[#141822] rounded-2xl border border-dashed border-slate-850 hover:border-[#FFCB05]/40 flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 group shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]"
                        title="Click to insert a new physical Pokémon card"
                      >
                        {/* Tactile plastic reflection shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        {/* Clear plastic pocket corner gloss highlights */}
                        <div className="absolute inset-2 bg-gradient-to-tr from-slate-950/20 via-transparent to-slate-400/[0.02] rounded-xl border border-slate-900/40 pointer-events-none group-hover:border-[#FFCB05]/15 transition-colors duration-300" />

                        <div className="p-3 bg-slate-900/60 rounded-full border border-slate-850 group-hover:scale-105 group-hover:border-slate-800 transition-all duration-350">
                          <Plus className="w-5 h-5 text-slate-500 group-hover:text-[#FFCB05] transition-colors" />
                        </div>
                        <span className="text-[10px] font-mono tracking-wider text-slate-500 group-hover:text-slate-300 font-bold uppercase mt-3 transition-colors">
                          Empty Sleeve
                        </span>
                        <span className="text-[8px] font-mono text-slate-650 group-hover:text-slate-400 mt-1 text-center font-medium max-w-[120px] transition-colors">
                          Sleeve #{index + 1}
                        </span>
                      </div>
                    );
                  }
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Aesthetic Tactile Binder Navigation controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#1A1D24] p-4 rounded-2xl border border-slate-800 gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-slate-900 text-slate-400 font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                PAGE {activePage + 1} OF {totalPages}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Viewing {pageItems.length} copies of {filteredAndSortedItems.length} collectibles
              </span>
            </div>

            {/* Quick-Jump dots indicators */}
            {totalPages > 1 && (
              <div className="flex gap-2 items-center justify-center shrink-0">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activePage 
                        ? 'bg-[#FFCB05] ring-2 ring-[#FFCB05]/30 scale-115' 
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={`Jump to page ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <button
                disabled={activePage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="flex-1 sm:flex-initial bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 hover:bg-slate-850 h-11 py-3 px-4 rounded-xl font-bold font-mono text-[10px] uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5 transition-all disabled:cursor-not-allowed cursor-pointer animate-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>
              <button
                disabled={activePage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="flex-1 sm:flex-initial bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 hover:bg-slate-850 h-11 py-3 px-4 rounded-xl font-bold font-mono text-[10px] uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5 transition-all disabled:cursor-not-allowed cursor-pointer animate-none"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Standard Visual Holographic Grid */
        <div id="cards-responsive-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedItems.map((item) => (
            <CardItem
              key={item.id}
              card={item.card}
              collectionItem={item}
              currentPrice={item.currentPrice}
              onViewDetails={() => onViewCardDetails(item.cardId)}
              currencySymbol={currencySymbol}
              preferSpecimenPhoto={preferSpecimenPhoto}
            />
          ))}
        </div>
      ) : (
        /* Compact Spreadsheet Portfolio List View */
        <div id="cards-compact-list" className="bg-[#1A1D24] rounded-2xl border border-slate-800 overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase">
                  <th className="p-3.5 pl-4">Card</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5 text-right">Cost Basis</th>
                  <th className="p-3.5 text-right">Market Quote</th>
                  <th className="p-3.5 text-right">Value Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredAndSortedItems.map((item) => {
                  const isProfitItem = item.profit >= 0;
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => onViewCardDetails(item.cardId)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 pl-4 flex items-center gap-3">
                        <img 
                          src={getOptimizedImageUrl(item.card.imageUrl, 80)} 
                          alt={item.card.name} 
                          className="w-7 h-10 object-contain rounded bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <span className="font-bold text-slate-100 block">{item.card.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[150px]">{item.card.set} • #{item.card.number}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        {item.card.language === 'BR' && '🇧🇷 BR'}
                        {item.card.language === 'EN' && '🇺🇸 EN'}
                        {item.card.language === 'JP' && '🇯🇵 JP'}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-black font-mono text-[9px] ${
                          item.gradeType === 'Raw' 
                            ? 'bg-slate-800 text-slate-300' 
                            : 'bg-amber-600/20 text-amber-500 border border-amber-500/20'
                        }`}>
                          {item.gradeType} {item.gradeValue === 'Raw' ? '' : item.gradeValue}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-300">
                        {currencySymbol}{item.totalCost.toLocaleString()}
                        {item.quantity > 1 && <span className="block text-[9px] text-slate-500">{item.quantity}x @ {currencySymbol}{item.purchasePrice}</span>}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-yellow-500">
                        {currencySymbol}{item.totalValue.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono">
                        <span className={`font-bold ${isProfitItem ? 'text-green-500' : 'text-red-500'}`}>
                          {isProfitItem ? '+' : ''}{currencySymbol}{Math.round(item.profit).toLocaleString()}
                        </span>
                        <span className={`block text-[10px] font-bold ${isProfitItem ? 'text-green-400/80' : 'text-red-400/80'}`}>
                          {isProfitItem ? '+' : ''}{item.roi.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
