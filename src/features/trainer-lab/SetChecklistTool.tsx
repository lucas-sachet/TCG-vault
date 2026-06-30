/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { BookMarked, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { PRESET_TRACK_SETS } from './presetTrackSets';
import type { Card, CollectionItem } from '../../types';

export interface SetChecklistToolProps {
  selectedSetIndex: number;
  setSelectedSetIndex: (index: number) => void;
  activeSet: (typeof PRESET_TRACK_SETS)[number];
  setProgress: { total: number; owned: number; percent: number };
  allOwnedCardIds: Set<string>;
  collectionItems: CollectionItem[];
  cards: Card[];
  currencySymbol: string;
  onAddWishlistItem: (item: WishlistItem) => void;
  onAddHolding: (holding: CollectionItem) => void;
}

import type { WishlistItem } from '../../types';

export function SetChecklistTool(props: SetChecklistToolProps) {
  const {
    selectedSetIndex, setSelectedSetIndex, activeSet, setProgress,
    allOwnedCardIds, collectionItems, cards, currencySymbol,
    onAddWishlistItem, onAddHolding,
  } = props;

  return (
    <motion.div
      key="tool-checklist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
        
        {/* Left Column: Set Selection & Tracker Ring Card */}
        <div className="bg-[#12141c] border border-slate-850 p-6 rounded-3xl space-y-6">
          <div>
            <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">TCG MASTER SETS</span>
            <h3 className="text-white font-black text-lg mt-0.5">Expansões de Elite</h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Selecione uma coleção oficial do repositório para acompanhar o seu progresso de completismo.
            </p>
          </div>

          <div className="space-y-2.5">
            {PRESET_TRACK_SETS.map((set, idx) => (
              <button
                key={set.name}
                onClick={() => setSelectedSetIndex(idx)}
                className={`w-full p-4 rounded-2xl border text-left transition relative flex items-center justify-between cursor-pointer ${
                  selectedSetIndex === idx 
                    ? 'bg-slate-900 border-slate-850 text-white' 
                    : 'bg-[#0b0c11] hover:bg-slate-900/40 border-transparent text-slate-400'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wide font-black uppercase block leading-none">{set.year} Set Range</span>
                  <span className="text-xs font-black font-sans block mt-1 leading-tight">{set.name}</span>
                </div>
                <span className="text-[10px] text-[#FFCB05] font-mono font-bold bg-[#FFCB05]/10 border border-[#FFCB05]/35 px-2 py-0.5 rounded-lg shrink-0 scale-95 uppercase">
                  {set.cards.length} Cards
                </span>
              </button>
            ))}
          </div>

          {/* Completeness gauge circular donut preview */}
          <div className="bg-[#0b0c11] border border-slate-850/60 p-5 rounded-2xl flex items-center gap-4.5">
            <div className="relative w-18 h-18 rounded-full border-4 border-slate-850 flex items-center justify-center font-mono text-white text-xs font-black">
              <svg className="absolute -inset-1 transform -rotate-90">
                <circle cx="36" cy="36" r="30" fill="transparent" stroke="#252a36" strokeWidth="4" />
                <circle 
                  cx="36" 
                  cy="36" 
                  r="30" 
                  fill="transparent" 
                  stroke="#FFCB05" 
                  strokeWidth="4" 
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - setProgress.percent / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <span>{setProgress.percent}%</span>
            </div>

            <div className="text-left space-y-0.5">
              <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest uppercase font-bold">Relação de Compleição</span>
              <h4 className="text-xs font-black text-white">{setProgress.owned} de {setProgress.total} cartas nas pastas</h4>
              <p className="text-[10px] text-slate-400 leading-tight">
                Continue catalogando mais do mesmo set para ver este anel brilhar dourado!
              </p>
            </div>
          </div>
        </div>


        {/* Right Column: Holographic checklist drawer (Columns 2-3) */}
        <div className="lg:col-span-2 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-white font-black text-base">{activeSet.name} checklist</h3>
              <p className="text-xs text-slate-400">Cartas que você possui aparecem iluminadas. Toque nas silhuetas para preencher.</p>
            </div>

            <div className="shrink-0 flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium font-sans">Verde = Já Obtido</span>
            </div>
          </div>

          {/* Cards checklist grid (beautiful visual layouts with shadows) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
            {activeSet.cards.map((setCard) => {
              const isOwned = allOwnedCardIds.has(setCard.id) || allOwnedCardIds.has(`track-${setCard.id}`) || 
                collectionItems.some(it => {
                  const actualC = cards.find(ac => ac.id === it.cardId);
                  return actualC && actualC.name.toLowerCase().includes(setCard.name.split('-')[0].trim().toLowerCase());
                });

              return (
                <div
                  key={setCard.id}
                  className={`bg-[#0b0c11] border rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative group min-h-[220px] transition-all duration-300 ${
                    isOwned 
                      ? 'border-emerald-500/30 bg-gradient-to-tr from-[#0F1C18] to-[#0b0c11] shadow-[0_0_15px_rgba(16,185,129,0.06)]' 
                      : 'border-slate-850 opacity-60 hover:opacity-95'
                  }`}
                >
                  {/* Interactive float icons over cards */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    {isOwned ? (
                      <span className="p-1 bg-emerald-500 text-slate-950 rounded-lg text-[9px] font-black" title="Obtido!">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          // Add to wishlist immediately
                          onAddWishlistItem({
                            id: `wish-${Date.now()}`,
                            cardId: setCard.id,
                            desiredPrice: setCard.currentPrice,
                            currentMarketPrice: setCard.currentPrice,
                            priority: 'High',
                            language: 'EN',
                            notes: `Adicionado do painel master set completismo`
                          });
                          const notify = document.createElement('div');
                          notify.className = 'fixed bottom-10 right-10 z-50 bg-indigo-950 border border-indigo-500 p-4 rounded-xl shadow-lg font-bold text-xs text-indigo-200';
                          notify.innerText = '✨ Carta marcada na lista de desejos!';
                          document.body.appendChild(notify);
                          setTimeout(() => notify.remove(), 2500);
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                        title="Favoritar ou marcar na wish"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Card Image element (shadowed if missing) */}
                  <div className="w-20 h-28 transform group-hover:scale-105 transition duration-300 relative">
                    <img
                      src={setCard.imageUrl}
                      alt={setCard.name}
                      className={`w-full h-full object-contain ${
                        isOwned ? 'filter drop-shadow-lg' : 'filter brightness-[0.25] grayscale'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title details underneath card image */}
                  <div className="w-full space-y-0.5 mt-3">
                    <span className="text-[9px] text-[#FFCB05] font-mono block tracking-wide truncate">{setCard.rarity}</span>
                    <span className="text-xs font-black text-slate-200 block truncate">{setCard.name}</span>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                      <span>#{setCard.number}</span>
                      <span className="font-bold text-slate-400">{currencySymbol}{setCard.currentPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Fast click mock acquire action */}
                  {!isOwned && (
                    <button
                      onClick={() => {
                        onAddHolding({
                          id: `own-item-${Date.now()}`,
                          cardId: setCard.id,
                          purchaseDate: new Date().toISOString().split('T')[0],
                          purchasePrice: setCard.currentPrice,
                          currency: 'USD',
                          quantity: 1,
                          gradeType: 'Raw',
                          notes: 'Aquisição rápida via checklist completista!'
                        });
                      }}
                      className="mt-2.5 w-full bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition border border-slate-800 cursor-pointer"
                    >
                      + Cartão
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

    </motion.div>
  );
}
