/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Check, 
  Trash2, 
  TrendingDown, 
  PlusCircle, 
  TrendingUp, 
  Coins, 
  Info,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { Card, WishlistItem } from '../types';
import { POKEMON_CARDS, LANGUAGE_METADATA } from '../data/pokemonData';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface WishlistTabProps {
  cards: Card[];
  wishlistItems: WishlistItem[];
  marketPrices: Record<string, number>;
  onAddWishlistItem: (cardId: string, desiredPrice: number, priority: 'High' | 'Medium' | 'Low', notes?: string) => void;
  onDeleteWishlistItem: (wishId: string) => void;
  onAcquireWishlistItem: (wishId: string, purchasePrice: number, purchaseDate: string, gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS', gradeValue: string, certNumber?: string) => void;
  onViewCardDetails: (cardId: string) => void;
  currencySymbol?: string;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  cards,
  wishlistItems,
  marketPrices,
  onAddWishlistItem,
  onDeleteWishlistItem,
  onAcquireWishlistItem,
  onViewCardDetails,
  currencySymbol = '$'
}) => {
  // Add wishlist state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [desiredPrice, setDesiredPrice] = useState<number>(50);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [wishNotes, setWishNotes] = useState('');

  // Settle buy acquisition inline panel state
  const [activeAcquireItemId, setActiveAcquireItemId] = useState<string | null>(null);
  const [accPrice, setAccPrice] = useState<number>(50);
  const [accGradeType, setAccGradeType] = useState<'Raw' | 'PSA' | 'CGC' | 'BGS'>('Raw');
  const [accGradeValue, setAccGradeValue] = useState<string>('10');
  const [accCert, setAccCert] = useState('');

  // Handle wish additions
  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) return;
    onAddWishlistItem(selectedCardId, desiredPrice, priority, wishNotes);
    
    // Clear form
    setSelectedCardId('');
    setDesiredPrice(50);
    setPriority('Medium');
    setWishNotes('');
    setShowAddForm(false);
  };

  // Handle visual shifts
  const triggerAcquireDropdown = (item: WishlistItem) => {
    setActiveAcquireItemId(item.id);
    setAccPrice(item.currentMarketPrice);
  };

  const submitAcquisition = (itemId: string) => {
    const today = new Date().toISOString().split('T')[0];
    onAcquireWishlistItem(itemId, accPrice, today, accGradeType, accGradeValue, accCert);
    setActiveAcquireItemId(null);
  };

  // Find cards eligible to add (not already on wishlist)
  const wishCardIds = new Set(wishlistItems.map(w => w.cardId));
  const availableCatalogCardsForWish = cards.filter(c => !wishCardIds.has(c.id));

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Alert / Header panel list */}
      <div className="flex justify-between items-center bg-[#1A1D24] p-4 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl">
            <Heart className="w-5 h-5 animate-pulse" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Wishlist Allocations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cards you are seeking to add. Generates dynamic targets relative to live pricing indices.
            </p>
          </div>
        </div>

        <button
          id="toggle-wishlist-add-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-800 hover:bg-slate-700/80 border border-slate-705 text-[#FFCB05] font-black text-xs py-2 px-4 rounded-xl transition-all font-mono tracking-wider"
        >
          {showAddForm ? 'CANCEL FORM' : 'ADD WISH TARGET'}
        </button>
      </div>

      {/* Slide-Down Simple Wish Addition Form */}
      {showAddForm && (
        <form onSubmit={handleAddWish} className="bg-[#151720] border border-slate-800 p-4 rounded-2xl space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Find catalog item template */}
            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1.5">Pick Card Template</label>
              <select
                id="wishlist-template-select"
                value={selectedCardId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCardId(val);
                  const mPrice = marketPrices[val] || 50;
                  setDesiredPrice(mPrice);
                }}
                className="w-full bg-[#1A1D24] text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:outline"
                required
              >
                <option value="">-- Choose Card Catalog --</option>
                {availableCatalogCardsForWish.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} ({card.language}) - {card.set}
                  </option>
                ))}
              </select>
            </div>

            {/* Desired Target budget Price */}
            <div>
              <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1.5">Target Desired Price</label>
              <input
                type="number"
                value={desiredPrice}
                onChange={(e) => setDesiredPrice(Number(e.target.value))}
                className="w-full bg-[#1A1D24] text-xs text-slate-100 p-2.5 rounded-xl border border-slate-800"
                min="1"
                required
              />
            </div>

            {/* Priority option */}
            <div>
              <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1.5">Buy Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#1A1D24] text-xs text-slate-200 py-2.5 px-3 rounded-xl border border-slate-800 focus:outline"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

            {/* Additional Observation notes */}
            <div className="sm:col-span-4">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase mb-1.5">Observations / Seller targets</label>
              <input
                type="text"
                placeholder="eBay custom listing, Cardmarket bargain details, local trading group..."
                value={wishNotes}
                onChange={(e) => setWishNotes(e.target.value)}
                className="w-full bg-[#1A1D24] text-xs text-slate-100 p-2.5 rounded-xl border border-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#3B4CCA] hover:bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all"
            >
              Add Wish Trigger
            </button>
          </div>
        </form>
      )}

      {/* Main Wishlist catalog cards list */}
      {wishlistItems.length === 0 ? (
        <div id="wishlist-empty-state" className="text-center py-16 bg-[#1A1D24] rounded-3xl border border-dashed border-slate-800 max-w-lg mx-auto relative overflow-hidden p-6 shadow-xl select-none">
          {/* Accent radial glow */}
          <div className="absolute inset-x-0 -bottom-10 h-32 bg-pink-500/5 blur-2xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-2xl animate-pulse">
              <Heart className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Active Price Watch empty
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your wishlist watchlist registry is currently quiet. Register high-value chase targets with designated purchase thresholds. 
              </p>
              <div className="text-[10px] text-slate-500 leading-normal bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-left space-y-1">
                <p>
                  💡 <span className="font-semibold text-slate-400">Beta Watcher Tip:</span> Specify target buy caps (e.g. 1999 Shadowless Holos under $400).
                </p>
                <p>
                  When Live Market Tickers fluctuate (triggered on the Dashboard tab), the engine auto-crosschecks your alerts and posts instant notification banners!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="mt-6 bg-gradient-to-r from-pink-500 to-[#3B4CCA] hover:from-pink-400 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Create Price Alert Target
            </button>
          </div>
        </div>
      ) : (
        <div id="wishlist-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlistItems.map((item) => {
            const card = cards.find(c => c.id === item.cardId)!;
            const currentPrice = marketPrices[item.cardId] || 0;
            const isTargetMet = currentPrice <= item.desiredPrice;
            const percentDiff = Math.abs(((currentPrice - item.desiredPrice) / item.desiredPrice) * 100);

            const languageInfo = LANGUAGE_METADATA[card.language] || { flag: '🌐', labelShort: card.language };

            return (
              <div
                key={item.id}
                id={`wish-block-${item.id}`}
                className={`bg-[#1A1D24] border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden ${
                  isTargetMet ? 'border-green-500/40 bg-gradient-to-b from-[#1A1D24] to-green-950/10' : 'border-slate-800'
                }`}
              >
                {/* Hot target reached badge banner */}
                {isTargetMet && (
                  <span className="absolute top-0 right-0 bg-green-500 text-slate-950 font-mono font-black py-0.5 px-3 rounded-bl text-[8px] uppercase tracking-wider animate-pulse">
                    TARGET REACHED
                  </span>
                )}

                <div className="flex gap-3.5">
                  {/* Miniature Card Thumbnail */}
                  <div 
                    onClick={() => onViewCardDetails(card.id)}
                    className="w-16 h-22 object-contain rounded bg-slate-950 border border-slate-800 cursor-pointer overflow-hidden relative group shrink-0 flex items-center justify-center p-1"
                  >
                    <img 
                      src={getOptimizedImageUrl(card.imageUrl, 150)} 
                      alt={card.name} 
                      className="w-full h-full object-contain hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 text-[10px]" style={{ fontSize: '10px' }}>{languageInfo.flag}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 
                        onClick={() => onViewCardDetails(card.id)}
                        className="font-black text-sm text-slate-100 hover:text-[#FFCB05] cursor-pointer truncate"
                      >
                        {card.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">{card.set} • #{card.number}</p>
                    
                    {/* Priority badge label */}
                    <span className={`inline-block mt-2 font-mono font-bold text-[9px] tracking-wider px-2 py-0.5 rounded ${
                      item.priority === 'High' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : item.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.priority} priority
                    </span>

                    {item.notes && (
                      <p className="text-[10px] text-slate-400 mt-2.5 italic border-l border-slate-800 pl-1.5 leading-3 truncate max-w-[200px]">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Deal Tracker index */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">DESIRED PRICE</span>
                      <span className="text-slate-200 font-bold block mt-1">{currencySymbol}{item.desiredPrice}</span>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">CURRENT QUOTATION</span>
                      <span className="text-yellow-500 font-bold block mt-1 flex items-center justify-between">
                        <span>{currencySymbol}{currentPrice}</span>
                        {isTargetMet ? (
                          <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-slate-500 font-normal">+{Math.round(percentDiff)}%</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Operational logging Console inline */}
                  {activeAcquireItemId === item.id ? (
                    <div className="bg-slate-950 p-3 rounded-xl border border-[#FFCB05]/40 space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold uppercase pb-1 border-b border-slate-800">
                        <span>Physical Purchase Form</span>
                        <button onClick={() => setActiveAcquireItemId(null)} className="text-slate-500 hover:text-white">Close</button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {/* Price logs */}
                        <div>
                          <label className="text-slate-500 block font-mono mb-1">Buy Price Paid</label>
                          <input
                            type="number"
                            value={accPrice}
                            onChange={(e) => setAccPrice(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 text-xs text-white rounded p-1.5 w-full font-mono"
                          />
                        </div>

                        {/* Grade logs */}
                        <div>
                          <label className="text-slate-500 block font-mono mb-1">Grade Company</label>
                          <select
                            value={accGradeType}
                            onChange={(e) => setAccGradeType(e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 text-[10px] text-slate-200 rounded p-1.5 w-full"
                          >
                            <option value="Raw">Raw</option>
                            <option value="PSA">PSA</option>
                            <option value="CGC">CGC</option>
                            <option value="BGS">BGS</option>
                          </select>
                        </div>

                        {accGradeType !== 'Raw' && (
                          /* Grade Score index */
                          <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <label className="text-slate-500 block font-mono">Grade Score</label>
                              <select
                                value={accGradeValue}
                                onChange={(e) => setAccGradeValue(e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[10px] text-slate-200 rounded p-1.5 w-full"
                              >
                                <option value="10">10 (Prismatic / Gem Mint)</option>
                                <option value="9">9 (Gem Mint)</option>
                                <option value="8">8</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-slate-500 block font-mono">Cert Serial</label>
                              <input
                                type="text"
                                placeholder="8219"
                                value={accCert}
                                onChange={(e) => setAccCert(e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-[10px] text-white rounded p-1.5 w-full font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1.5 mt-2">
                        <button
                          onClick={() => setActiveAcquireItemId(null)}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white px-2 py-1 rounded text-[10px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitAcquisition(item.id)}
                          className="bg-green-500 hover:bg-green-400 text-slate-950 font-black px-3 py-1 rounded text-[10px] uppercase tracking-wider"
                        >
                          Confirm Acquisition
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 items-center">
                      <button
                        onClick={() => onDeleteWishlistItem(item.id)}
                        className="h-11 w-11 flex items-center justify-center bg-slate-900 hover:bg-slate-850 hover:text-red-400 rounded-xl border border-slate-800 transition-all text-slate-500 shrink-0"
                        title="Delete Wishlist preference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        id={`wish-acquire-btn-${item.id}`}
                        onClick={() => triggerAcquireDropdown(item)}
                        className="flex-grow h-11 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Log Acquisition</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TCG Tips relative to Wishlists */}
      <div className="bg-[#1A1D24] p-4 border border-slate-850 rounded-2xl">
        <div className="flex gap-3 text-xs leading-5">
          <Info className="w-5 h-5 text-[#FFCB05] shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <h4 className="font-bold text-slate-200">How do buy priority signals work?</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Marking an item as **High Priority** configures immediate notification alert margins within settings. When market values align beneath desired budgets, we mark targets as completed immediately.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
