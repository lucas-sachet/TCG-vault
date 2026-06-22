/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, Info, Calendar, DollarSign, Check, Camera, Search, Loader2, Layers, Package, Trash2, CheckSquare, Square, ShoppingCart, Zap, LayoutGrid } from 'lucide-react';
import { Card, CollectionItem, CardQuality } from '../types';
import { LANGUAGE_METADATA } from '../data/pokemonData';
import { searchPokemonCards, searchPokemonCardsBySet } from '../services/pokemonTcg.service';

/* ── Personal Photo Uploader (unchanged from original) ────────────── */

interface PersonalPhotoUploaderProps {
  label: string;
  photoUrl: string;
  onPhotoChanged: (url: string) => void;
  idSuffix: string;
}

const PersonalPhotoUploader: React.FC<PersonalPhotoUploaderProps> = ({
  label,
  photoUrl,
  onPhotoChanged,
  idSuffix
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onPhotoChanged(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-[140px]">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">{label}</label>
        {photoUrl && (
          <button
            type="button"
            onClick={() => onPhotoChanged('')}
            className="text-[9px] text-red-500 hover:text-red-400 font-bold transition-all cursor-pointer"
          >
            Clear Photo
          </button>
        )}
      </div>
      
      {photoUrl ? (
        <div className="relative aspect-[4/3] bg-slate-950 border border-slate-850 rounded-xl overflow-hidden group flex items-center justify-center p-1 shadow-inner">
          <img 
            src={photoUrl} 
            alt={label} 
            className="w-full h-full object-contain rounded-lg animate-fade-in"
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-[#FFCB05] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
              Specimen Armed
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-[4/3] rounded-xl border border-dashed flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-[#FFCB05] bg-[#FFCB05]/5 scale-[0.98]' 
              : 'border-slate-800 bg-[#161a23]/60 hover:border-slate-700 hover:bg-[#1c212d]/60'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
            id={`file-input-${idSuffix}`}
          />
          <Camera className="w-5 h-5 text-slate-500 mb-1 group-hover:text-[#FFCB05] transition-colors" />
          <span className="text-[10px] text-slate-300 font-bold text-center">Drag & Drop or Click</span>
          <span className="text-[8px] text-slate-500 mt-0.5 text-center">PNG, JPG format</span>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute bottom-1 inset-x-1.5 flex items-center gap-1 bg-slate-950/90 border border-slate-850 px-2 py-0.5 rounded-lg"
          >
            <input 
              type="text"
              placeholder="Or paste image URL..."
              onChange={(e) => onPhotoChanged(e.target.value)}
              className="w-full text-[8px] bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none py-0.5 text-center font-mono"
            />
          </div>
        </div>
      )}

      {uploadError && (
        <span className="text-[9px] font-mono font-bold text-red-400 block mt-1 text-center bg-red-950/25 py-1 px-1.5 rounded border border-red-900/30">
          ⚠️ {uploadError}
        </span>
      )}
    </div>
  );
};

/* ── Main AddCardModal ────────────────────────────────────────────── */

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: (card: Card, item: CollectionItem) => void;
  onBulkAdd: (cards: Card[], items: CollectionItem[]) => void;
  binders: { id: string; name: string }[];
  marketPrices: Record<string, number>;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onCardAdded,
  onBulkAdd,
  binders,
  marketPrices
}) => {
  // ─── Mode toggle ───
  const [isBulkMode, setIsBulkMode] = useState(false);

  // ─── Shared search state ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'name' | 'set' | 'number'>('name');
  const [apiResults, setApiResults] = useState<Card[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchError, setApiSearchError] = useState<string | null>(null);

  // ─── Individual mode state ───
  const [selectedCatalogCard, setSelectedCatalogCard] = useState<Card | null>(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(50);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState('');
  const [selectedBinderId, setSelectedBinderId] = useState('binder-all');
  const [quality, setQuality] = useState<CardQuality>('NM');
  const [gradeType, setGradeType] = useState<'Raw' | 'PSA' | 'CGC' | 'BGS'>('Raw');
  const [gradeValue, setGradeValue] = useState<string>('10');
  const [certNumber, setCertNumber] = useState('');
  const [frontPhotoUrl, setFrontPhotoUrl] = useState('');
  const [backPhotoUrl, setBackPhotoUrl] = useState('');

  // ─── Bulk mode state ───
  const [bulkSelectedCards, setBulkSelectedCards] = useState<Card[]>([]);
  const [bulkTab, setBulkTab] = useState<'search' | 'set'>('search');
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkQuality, setBulkQuality] = useState<CardQuality>('NM');
  const [bulkBinderId, setBulkBinderId] = useState('binder-all');
  const [bulkPriceStrategy, setBulkPriceStrategy] = useState<'zero' | 'market'>('zero');

  // Set import state
  const [setImportQuery, setSetImportQuery] = useState('');
  const [setResults, setSetResults] = useState<Card[]>([]);
  const [isSearchingSet, setIsSearchingSet] = useState(false);
  const [setImportError, setSetImportError] = useState<string | null>(null);
  const [setLoadedName, setSetLoadedName] = useState('');

  // ─── Helpers ───
  const isBulkSelected = useCallback((cardId: string) => {
    return bulkSelectedCards.some(c => c.id === cardId);
  }, [bulkSelectedCards]);

  const toggleBulkSelect = useCallback((card: Card) => {
    setBulkSelectedCards(prev => {
      if (prev.some(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      return [...prev, card];
    });
  }, []);

  const selectAllSetResults = useCallback(() => {
    setBulkSelectedCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newCards = setResults.filter(c => !existingIds.has(c.id));
      return [...prev, ...newCards];
    });
  }, [setResults]);

  const deselectAllSetResults = useCallback(() => {
    const setResultIds = new Set(setResults.map(c => c.id));
    setBulkSelectedCards(prev => prev.filter(c => !setResultIds.has(c.id)));
  }, [setResults]);

  const allSetResultsSelected = setResults.length > 0 && setResults.every(c => isBulkSelected(c.id));

  // ─── API Search (shared) ───
  const handleApiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setApiSearchError('Please fill in a search keyword');
      return;
    }
    
    setIsSearchingApi(true);
    setApiSearchError(null);
    try {
      const filters: { name?: string; set?: string; number?: string } = {};
      if (searchCategory === 'name') filters.name = query;
      else if (searchCategory === 'set') filters.set = query;
      else if (searchCategory === 'number') filters.number = query;
      
      const results = await searchPokemonCards(filters);
      setApiResults(results);
      if (results.length === 0) {
        setApiSearchError('No matching cards found. Try another search term.');
      }
    } catch (err: any) {
      console.error(err);
      setApiSearchError('Failed to fetch from Pokémon TCG API. Check your internet connection.');
    } finally {
      setIsSearchingApi(false);
    }
  };

  // ─── Set Import Search ───
  const handleSetSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = setImportQuery.trim();
    if (!query) {
      setSetImportError('Enter a set name to import');
      return;
    }
    
    setIsSearchingSet(true);
    setSetImportError(null);
    setSetResults([]);
    setSetLoadedName('');
    try {
      const results = await searchPokemonCardsBySet(query);
      setSetResults(results);
      if (results.length === 0) {
        setSetImportError('No cards found for this set. Try the exact set name (e.g. "Base Set", "Evolving Skies").');
      } else {
        setSetLoadedName(results[0]?.set || query);
      }
    } catch (err: any) {
      console.error(err);
      setSetImportError('Failed to fetch set data. Check your internet connection.');
    } finally {
      setIsSearchingSet(false);
    }
  };

  // ─── Individual submit ───
  const handleFormSubmission = () => {
    if (!selectedCatalogCard) {
      setValidationError('Please select a card from the search results first.');
      return;
    }
    setValidationError(null);

    const collectionItem: CollectionItem = {
      id: `own-item-${Date.now()}`,
      cardId: selectedCatalogCard.id,
      purchaseDate: purchaseDate,
      purchasePrice: Number(purchasePrice) || 0,
      currency: 'USD',
      quantity: Math.max(1, Number(quantity) || 1),
      notes: itemNotes.trim() || undefined,
      gradeType: gradeType,
      gradeValue: gradeType === 'Raw' ? 'Raw' : (isNaN(Number(gradeValue)) ? gradeValue : Number(gradeValue)),
      certNumber: certNumber.trim() || undefined,
      binderId: selectedBinderId === 'binder-all' ? undefined : selectedBinderId,
      quality: quality,
      frontPhotoUrl: frontPhotoUrl.trim() || undefined,
      backPhotoUrl: backPhotoUrl.trim() || undefined
    };

    onCardAdded(selectedCatalogCard, collectionItem);
    
    // Clear state
    setSelectedCatalogCard(null);
    setApiResults([]);
    setSearchQuery('');
    setItemNotes('');
    setCertNumber('');
    setQuality('NM');
    setFrontPhotoUrl('');
    setBackPhotoUrl('');
    onClose();
  };

  // ─── Bulk submit ───
  const handleBulkSubmit = () => {
    if (bulkSelectedCards.length === 0) return;

    const now = Date.now();
    const cards: Card[] = [...bulkSelectedCards];
    const items: CollectionItem[] = bulkSelectedCards.map((card, idx) => ({
      id: `own-item-${now}-${idx}`,
      cardId: card.id,
      purchaseDate: bulkDate,
      purchasePrice: bulkPriceStrategy === 'market' ? (marketPrices[card.id] || 0) : 0,
      currency: 'USD',
      quantity: 1,
      gradeType: 'Raw' as const,
      gradeValue: 'Raw',
      binderId: bulkBinderId === 'binder-all' ? undefined : bulkBinderId,
      quality: bulkQuality,
    }));

    onBulkAdd(cards, items);

    // Clear bulk state
    setBulkSelectedCards([]);
    setApiResults([]);
    setSearchQuery('');
    setSetResults([]);
    setSetImportQuery('');
    setSetLoadedName('');
    onClose();
  };

  // ─── Full reset on close ───
  const handleClose = () => {
    setValidationError(null);
    setApiSearchError(null);
    onClose();
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */

  // ── Search Bar (shared between individual & bulk search tab) ──
  const renderSearchBar = () => (
    <div className="space-y-2.5">
      {/* Filter Category Switches */}
      <div className="flex gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-900">
        {(['name', 'set', 'number'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSearchCategory(cat);
              setApiResults([]);
            }}
            className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              searchCategory === cat
                ? 'bg-slate-800 text-white shadow-inner border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'name' ? 'Card Name' : cat === 'set' ? 'Set Name' : 'Card ID / Num'}
          </button>
        ))}
      </div>

      {/* Input search */}
      <form onSubmit={handleApiSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={
              searchCategory === 'name' 
                ? 'e.g., Charizard VMAX, Gengar...' 
                : searchCategory === 'set' 
                  ? 'e.g., Evolving Skies, Base Set...' 
                  : 'e.g., 223/197, 4/102...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16181f]/90 border border-slate-850 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-colors font-medium"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSearchingApi}
          className="bg-[#3B4CCA] hover:bg-blue-700 text-white rounded-xl px-4 text-xs font-black tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none transition-colors border border-blue-800"
        >
          {isSearchingApi ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Error */}
      {apiSearchError && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiSearchError}</span>
        </div>
      )}
    </div>
  );

  // ── Bulk Search Results Grid (with checkboxes) ──
  const renderBulkSearchResults = (results: Card[]) => {
    if (results.length === 0 && !isSearchingApi && !isSearchingSet && !apiSearchError && !setImportError) {
      return (
        <div className="p-4 bg-[#14161f]/3 w-full border border-slate-850 border-dashed rounded-2xl text-center text-slate-500">
          <Info className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
          <span className="text-[10px] leading-relaxed block max-w-sm mx-auto font-mono">
            Search cards to add them in bulk. Select multiple cards from different searches — your selections persist across searches.
          </span>
        </div>
      );
    }

    if (results.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {results.map(card => {
          const isSelected = isBulkSelected(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleBulkSelect(card)}
              className={`w-full flex items-center justify-start gap-2 p-2 rounded-xl border text-left transition-all group cursor-pointer ${
                isSelected
                  ? 'bg-[#FFCB05]/10 border-[#FFCB05]/40 shadow-lg shadow-yellow-900/10'
                  : 'bg-slate-900/50 border-slate-850 hover:border-blue-500/50 hover:bg-slate-850/60'
              }`}
            >
              {/* Checkbox */}
              <div className="shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#FFCB05]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                )}
              </div>
              <img 
                src={card.imageUrl} 
                alt={card.name} 
                referrerPolicy="no-referrer"
                className="w-8 h-11 object-contain bg-black/40 border border-slate-800 shrink-0 rounded"
              />
              <div className="min-w-0 pr-1">
                <span className={`font-bold text-[11px] truncate block transition-colors ${isSelected ? 'text-[#FFCB05]' : 'text-slate-100 group-hover:text-[#FFCB05]'}`}>{card.name}</span>
                <span className="text-[9px] text-slate-400 block truncate font-medium">{card.set}</span>
                <span className="text-[8px] text-slate-500 block font-mono">{card.number}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Staging Area (Bulk selected cards preview) ──
  const renderStagingArea = () => {
    if (bulkSelectedCards.length === 0) return null;

    return (
      <div className="bg-[#0d0f15] border border-[#FFCB05]/20 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#FFCB05]/15 rounded-lg">
              <ShoppingCart className="w-3.5 h-3.5 text-[#FFCB05]" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Staging: <span className="text-[#FFCB05]">{bulkSelectedCards.length}</span> card{bulkSelectedCards.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBulkSelectedCards([])}
            className="text-[9px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-950/30 hover:bg-red-950/50 px-2 py-1 rounded-lg border border-red-900/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        </div>

        {/* Card chips */}
        <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
          {bulkSelectedCards.map(card => (
            <div
              key={card.id}
              className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 group"
            >
              <img 
                src={card.imageUrl} 
                alt={card.name}
                referrerPolicy="no-referrer"
                className="w-4 h-5 object-contain rounded-sm"
              />
              <span className="text-[9px] text-slate-200 font-bold truncate max-w-[80px]">{card.name}</span>
              <button
                type="button"
                onClick={() => toggleBulkSelect(card)}
                className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#090b0e]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full md:max-w-xl max-h-[88vh] md:max-h-[90vh] bg-[#101217] border-t md:border border-slate-800 rounded-t-3xl md:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl z-50"
          >
            {/* ── Header with mode toggle ── */}
            <div className="p-5 border-b border-slate-800 bg-[#171a21]/80 backdrop-blur-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#FFCB05]/10 rounded-lg text-[#FFCB05]">
                    {isBulkMode ? <Layers className="w-5 h-5" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-100 uppercase tracking-widest">
                      {isBulkMode ? 'Bulk Add Cards' : 'Register Collectible'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isBulkMode ? 'Add multiple cards at once — perfect for onboarding' : 'Auto-import metadata directly from Pokémon TCG Live API'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800/40 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode toggle pill */}
              <div className="flex gap-1 mt-3 p-1 bg-slate-950/80 rounded-xl border border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    !isBulkMode
                      ? 'bg-[#3B4CCA] text-white shadow-lg border border-blue-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    isBulkMode
                      ? 'bg-[#FFCB05] text-[#101217] shadow-lg border border-yellow-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Bulk Mode
                  {bulkSelectedCards.length > 0 && (
                    <span className="bg-[#101217] text-[#FFCB05] text-[9px] font-black px-1.5 py-0.5 rounded-md ml-0.5">
                      {bulkSelectedCards.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* ═══════ INDIVIDUAL MODE ═══════ */}
              {!isBulkMode && (
                <>
                  {/* TCG Search Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#FFCB05] font-bold font-mono tracking-wider block uppercase">TCG Search Engine (Source of Truth)</span>
                      <span className="text-[9px] text-slate-500 font-mono">Live Sync Enabled</span>
                    </div>

                    {/* Selected Card Preview */}
                    {selectedCatalogCard ? (
                      <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-2xl border border-blue-500/40 shadow-lg shadow-blue-900/5 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedCatalogCard.imageUrl} 
                            alt={selectedCatalogCard.name} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-16 object-contain rounded bg-black/40 border border-slate-800"
                          />
                          <div>
                            <span className="bg-[#FFCB05]/10 border border-[#FFCB05]/20 text-[#FFCB05] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider block w-max leading-none mb-1">
                              SELECTED TEMPLATE
                            </span>
                            <span className="font-bold text-white block text-sm leading-snug">{selectedCatalogCard.name}</span>
                            <span className="text-xs text-slate-400 block font-medium mt-0.5">
                              {selectedCatalogCard.set} • {selectedCatalogCard.number} • {selectedCatalogCard.rarity}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedCatalogCard(null)}
                          className="text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer font-bold select-none whitespace-nowrap"
                        >
                          Change Card
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {renderSearchBar()}

                        {/* Individual mode results - click to select */}
                        {apiResults.length > 0 && !isSearchingApi && (
                          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                            {apiResults.map(card => (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => setSelectedCatalogCard(card)}
                                className="w-full flex items-center justify-start gap-2.5 p-2 bg-slate-900/50 border border-slate-850 rounded-xl hover:border-blue-500/50 hover:bg-slate-850/60 text-left transition-all group cursor-pointer"
                              >
                                <img 
                                  src={card.imageUrl} 
                                  alt={card.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-12 object-contain bg-black/40 border border-slate-800 shrink-0 rounded"
                                />
                                <div className="min-w-0 pr-1">
                                  <span className="text-slate-100 font-bold text-xs truncate block group-hover:text-[#FFCB05] transition-colors">{card.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">{card.set}</span>
                                  <span className="text-[9px] text-[#FFCB05] block font-mono mt-0.5">{card.number} • {card.rarity}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Informative placeholder */}
                        {apiResults.length === 0 && !isSearchingApi && !apiSearchError && (
                          <div className="p-4 bg-[#14161f]/3 w-full border border-slate-850 border-dashed rounded-2xl text-center text-slate-500">
                            <Info className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
                            <span className="text-[10px] leading-relaxed block max-w-sm mx-auto font-mono">
                              Search Pokémon TCG Database to load verified official meta statistics. Manual modifications of card metadata are blocked to prevent data contamination.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Financial Details */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-4">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase">Purchase & Financial Records</span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-1">
                        <label className="text-[10px] text-[#FFCB05] font-mono tracking-wider block uppercase mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date Buy</span>
                        </label>
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-100 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] text-[#FFCB05] font-mono tracking-wider block uppercase mb-1">Condition</label>
                        <select
                          value={quality}
                          onChange={(e) => setQuality(e.target.value as CardQuality)}
                          className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                        >
                          <option value="M">M - Mint</option>
                          <option value="NM">NM - Near Mint</option>
                          <option value="SP">SP - Slightly Played</option>
                          <option value="MP">MP - Moderately Played</option>
                          <option value="HP">HP - Heavily Played</option>
                          <option value="D">D - Damaged</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] text-[#FFCB05] font-mono tracking-wider block uppercase mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>Unit Buy Price ($)</span>
                        </label>
                        <input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-100 rounded-xl p-2.5 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] text-[#FFCB05] font-mono tracking-wider block uppercase mb-1">Buy Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-100 rounded-xl p-2.5 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grading */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase">Authentication & Grades</span>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-500 font-semibold font-mono">CARDS VALUE GRADED VS RAW</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono block mb-1">Company</label>
                        <select
                          value={gradeType}
                          onChange={(e) => setGradeType(e.target.value as any)}
                          className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                        >
                          <option value="Raw">Raw (Ungraded)</option>
                          <option value="PSA">PSA (Professional)</option>
                          <option value="CGC">CGC (Classic)</option>
                          <option value="BGS">BGS (Beckett)</option>
                        </select>
                      </div>

                      {gradeType !== 'Raw' && (
                        <>
                          <div>
                            <label className="text-[10px] text-slate-400 font-mono block mb-1">Grade score</label>
                            <select
                              value={gradeValue}
                              onChange={(e) => setGradeValue(e.target.value)}
                              className="w-full bg-[#1A1D24] text-xs border border-[#FFCB05]/30 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                            >
                              <option value="10">10 (Prismatic / Gem Mint)</option>
                              <option value="9.5">9.5 (Mint+)</option>
                              <option value="9">9 (Gem Mint)</option>
                              <option value="8.5">8.5</option>
                              <option value="8">8 (Near Mint-Mint)</option>
                              <option value="7">7 (Near Mint)</option>
                              <option value="6">6 (Excellent-Mint)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-mono block mb-1">Cert Number</label>
                            <input
                              type="text"
                              placeholder="e.g., 8291038"
                              value={certNumber}
                              onChange={(e) => setCertNumber(e.target.value)}
                              className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-100 rounded-xl p-2.5 focus:outline-none font-mono"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-2">
                    <span className="text-[10px] text-[#FFCB05] font-mono tracking-wider block uppercase font-black">
                      Personal Specimen Photographs (Visual Verification)
                    </span>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <PersonalPhotoUploader 
                        label="Front Photograph (Specimen)"
                        photoUrl={frontPhotoUrl}
                        onPhotoChanged={setFrontPhotoUrl}
                        idSuffix="front"
                      />
                      <PersonalPhotoUploader 
                        label="Back Photograph (Specimen)"
                        photoUrl={backPhotoUrl}
                        onPhotoChanged={setBackPhotoUrl}
                        idSuffix="back"
                      />
                    </div>
                  </div>

                  {/* Notes & Binder */}
                  <div className="border-t border-slate-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1">Target Storage Binder</label>
                      <select
                        value={selectedBinderId}
                        onChange={(e) => setSelectedBinderId(e.target.value)}
                        className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                      >
                        <option value="binder-all">Default Main Binder</option>
                        {binders.filter(b => b.id !== 'binder-all').map(binder => (
                          <option key={binder.id} value={binder.id}>{binder.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase mb-1">Collector Private Notes</label>
                      <input
                        type="text"
                        placeholder="e.g., Mint condition, sharp corners..."
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        className="w-full bg-[#1A1D24] text-xs border border-slate-850 text-slate-100 rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  {validationError && (
                    <p className="text-[10px] text-red-400 font-bold font-mono mt-1 px-3 py-2 bg-red-950/20 border border-red-900/30 rounded-xl">
                      ⚠️ {validationError}
                    </p>
                  )}
                </>
              )}

              {/* ═══════ BULK MODE ═══════ */}
              {isBulkMode && (
                <>
                  {/* Bulk tab selector: Search vs Set Import */}
                  <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-900">
                    <button
                      type="button"
                      onClick={() => setBulkTab('search')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                        bulkTab === 'search'
                          ? 'bg-slate-800 text-white shadow-inner border border-slate-700/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      Quick Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkTab('set')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                        bulkTab === 'set'
                          ? 'bg-slate-800 text-white shadow-inner border border-slate-700/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Import Set
                    </button>
                  </div>

                  {/* ── Search tab ── */}
                  {bulkTab === 'search' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#FFCB05] font-bold font-mono tracking-wider block uppercase">Search & Select Multiple</span>
                        <span className="text-[9px] text-slate-500 font-mono">Selections persist across searches</span>
                      </div>
                      
                      {renderSearchBar()}
                      {renderBulkSearchResults(apiResults)}
                    </div>
                  )}

                  {/* ── Set Import tab ── */}
                  {bulkTab === 'set' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#FFCB05] font-bold font-mono tracking-wider block uppercase">Import Complete Set</span>
                        <span className="text-[9px] text-slate-500 font-mono">Load all cards from a set at once</span>
                      </div>

                      <form onSubmit={handleSetSearch} className="flex gap-2">
                        <div className="relative flex-1">
                          <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Exact set name, e.g., Evolving Skies, Base Set..."
                            value={setImportQuery}
                            onChange={(e) => setSetImportQuery(e.target.value)}
                            className="w-full bg-[#16181f]/90 border border-slate-850 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-[#FFCB05] focus:bg-slate-900 transition-colors font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSearchingSet}
                          className="bg-[#FFCB05] hover:bg-yellow-400 text-[#101217] rounded-xl px-4 text-xs font-black tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none transition-colors border border-yellow-600"
                        >
                          {isSearchingSet ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Load Set</span>
                          )}
                        </button>
                      </form>

                      {setImportError && (
                        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{setImportError}</span>
                        </div>
                      )}

                      {/* Set loaded header */}
                      {setResults.length > 0 && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between p-2.5 bg-emerald-950/20 border border-emerald-800/30 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-300">
                                {setLoadedName} — {setResults.length} cards loaded
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={allSetResultsSelected ? deselectAllSetResults : selectAllSetResults}
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                allSetResultsSelected
                                  ? 'bg-red-950/30 border-red-900/30 text-red-400 hover:bg-red-950/50'
                                  : 'bg-[#FFCB05]/10 border-[#FFCB05]/30 text-[#FFCB05] hover:bg-[#FFCB05]/20'
                              }`}
                            >
                              {allSetResultsSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          {renderBulkSearchResults(setResults)}
                        </div>
                      )}

                      {/* Empty state */}
                      {setResults.length === 0 && !isSearchingSet && !setImportError && (
                        <div className="p-4 bg-[#14161f]/3 w-full border border-slate-850 border-dashed rounded-2xl text-center text-slate-500">
                          <Package className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                          <span className="text-[10px] leading-relaxed block max-w-sm mx-auto font-mono">
                            Enter the exact name of a Pokémon TCG set to load all its cards. Great for quickly adding a full set to your collection.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Staging area ── */}
                  {renderStagingArea()}

                  {/* ── Bulk Defaults ── */}
                  {bulkSelectedCards.length > 0 && (
                    <div className="border-t border-slate-800/80 pt-4 space-y-3.5">
                      <span className="text-[10px] text-[#FFCB05] font-bold font-mono tracking-wider block uppercase">
                        Defaults Applied to All {bulkSelectedCards.length} Cards
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Date */}
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Purchase Date</span>
                          </label>
                          <input
                            type="date"
                            value={bulkDate}
                            onChange={(e) => setBulkDate(e.target.value)}
                            className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-100 rounded-xl p-2.5 focus:outline-none"
                          />
                        </div>

                        {/* Condition */}
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1">Condition</label>
                          <select
                            value={bulkQuality}
                            onChange={(e) => setBulkQuality(e.target.value as CardQuality)}
                            className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                          >
                            <option value="M">M - Mint</option>
                            <option value="NM">NM - Near Mint</option>
                            <option value="SP">SP - Slightly Played</option>
                            <option value="MP">MP - Moderately Played</option>
                            <option value="HP">HP - Heavily Played</option>
                            <option value="D">D - Damaged</option>
                          </select>
                        </div>

                        {/* Binder */}
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1">Target Binder</label>
                          <select
                            value={bulkBinderId}
                            onChange={(e) => setBulkBinderId(e.target.value)}
                            className="w-full bg-[#1A1D24] text-xs border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                          >
                            <option value="binder-all">Default Main Binder</option>
                            {binders.filter(b => b.id !== 'binder-all').map(binder => (
                              <option key={binder.id} value={binder.id}>{binder.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Price Strategy */}
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                            <span>Price Strategy</span>
                          </label>
                          <div className="flex gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-slate-900">
                            <button
                              type="button"
                              onClick={() => setBulkPriceStrategy('zero')}
                              className={`flex-1 py-2 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                                bulkPriceStrategy === 'zero'
                                  ? 'bg-slate-800 text-white border border-slate-700/60'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              $0 (Add Later)
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulkPriceStrategy('market')}
                              className={`flex-1 py-2 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                                bulkPriceStrategy === 'market'
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Market Price
                            </button>
                          </div>
                        </div>
                      </div>

                      {bulkPriceStrategy === 'market' && (
                        <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/20 rounded-xl flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-[9px] text-emerald-400 font-mono leading-relaxed">
                            Each card will be assigned its current market price from the Pokémon TCG API. Cards without market data will default to $0.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Footer Buttons ── */}
            <div className="p-4 bg-[#14161F] border-t border-slate-850 flex gap-3 z-30">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1 text-xs select-none cursor-pointer"
              >
                Discard
              </button>

              {!isBulkMode ? (
                <button
                  id="modal-submit-add-btn"
                  type="button"
                  onClick={handleFormSubmission}
                  disabled={!selectedCatalogCard}
                  className="btn-primary flex-1 text-xs select-none disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  Vault Card Now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={bulkSelectedCards.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-[#FFCB05] to-yellow-500 text-[#101217] hover:from-yellow-400 hover:to-[#FFCB05] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-900/20 border border-yellow-600/50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Add All {bulkSelectedCards.length} Card{bulkSelectedCards.length !== 1 ? 's' : ''}</span>
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
