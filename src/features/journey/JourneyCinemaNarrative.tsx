/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import {
  Award, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Crown,
  Film, Pause, Play, ShieldCheck, Tag, Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card, CollectionItem } from '../../types';
import type { CinematicSlide } from './types';

export interface JourneyCinemaNarrativeProps {
  activeSlide: CinematicSlide | null;
  currentSlideIdx: number;
  cinematicSlides: CinematicSlide[];
  isPlaying: boolean;
  currencySymbol: string;
  marketPrices: Record<string, number>;
  activeCompObj: { item: CollectionItem; card?: Card } | null;
  onTogglePlaying: () => void;
  onSlideIndexChange: (updater: (prev: number) => number) => void;
  onSetSlideIndex: (index: number) => void;
  onStopPlaying: () => void;
}

export function JourneyCinemaNarrative({
  activeSlide,
  currentSlideIdx,
  cinematicSlides,
  isPlaying,
  currencySymbol,
  marketPrices,
  activeCompObj,
  onTogglePlaying,
  onSlideIndexChange,
  onSetSlideIndex,
  onStopPlaying,
}: JourneyCinemaNarrativeProps) {
  return (
                <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-br from-[#12141d] to-[#0c0d12] border border-slate-850 rounded-3xl p-6 sm:p-8 text-left relative overflow-hidden min-h-[460px]">
                  
                  {/* Decorative background visual elements */}
                  <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />

                  {/* Top slide labels */}
                  <div className="relative z-10 flex items-center justify-between border-b border-slate-850 pb-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#FFCB05] animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">
                        HISTÓRICO CINEMÁTICO DE RECORDES
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`} />
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                        {isPlaying ? 'Autoplay Ativo' : 'Pausado'}
                      </span>
                    </div>
                  </div>

                  {/* Main Slide narrative text block */}
                  <div className="relative z-10 py-6 sm:py-8 space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`narrative-slide-${activeSlide?.type}-${currentSlideIdx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Slide Custom Titles */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] sm:text-xs font-mono font-black text-indigo-400 uppercase tracking-widest block">
                            {activeSlide?.subtitle}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none font-sans">
                            {activeSlide?.title}
                          </h3>
                        </div>

                        {/* Interactive Chapter narrative layout */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-medium pt-1.5">
                          {activeSlide?.narrative}
                        </p>

                        {/* ==========================================
                            DYNAMIC SLIDE SPECIFIC PREFERENCES
                           ========================================== */}
                        
                        {/* COVER STATS BREAKDOWN GRID */}
                        {activeSlide && activeSlide.type === 'cover' && activeSlide.stats && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Acervo Total</span>
                              <strong className="text-white text-base font-black font-mono block mt-0.5">{activeSlide.stats.cardCount} cartas</strong>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Pastas Organizadoras</span>
                              <strong className="text-white text-base font-black font-mono block mt-0.5">{activeSlide.stats.bindersCount} pastas</strong>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl col-span-2 sm:col-span-1">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Valorização Total</span>
                              <strong className={`text-base font-black font-mono block mt-0.5 ${activeSlide.stats.growthPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {activeSlide.stats.growthPct >= 0 ? '+' : ''}{activeSlide.stats.growthPct.toFixed(0)}%
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* FIRST CARD MARKED STATISTICS */}
                        {activeSlide && activeSlide.type === 'first' && activeSlide.holding && (
                          <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Registrado em: <strong>{activeSlide.holding.purchaseDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <Tag className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span>Valor de Compra: <strong>{currencySymbol}{activeSlide.holding.purchasePrice}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* HOLY CROWN JEWEL DETAILS */}
                        {activeSlide && activeSlide.type === 'high_value' && activeSlide.holding && (
                          <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                              <span>Gema Dominante</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFCB05]/10 border border-[#FFCB05]/20 rounded-xl">
                              <Crown className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span className="text-[#FFCB05]">Cotação Estimada: <strong>{currencySymbol}{(marketPrices[activeSlide.holding.cardId] || activeSlide.holding.purchasePrice).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* BEST NOTES PERSONAL SCROLL WRAPPERS */}
                        {activeSlide && activeSlide.type === 'best_note' && activeSlide.holding && (
                          <div className="pt-2">
                            <div className="p-4 bg-yellow-950/15 border-l-4 border-yellow-500/60 rounded-r-2xl max-w-xl text-xs sm:text-sm font-mono text-yellow-105 italic leading-relaxed bg-[radial-gradient(#1E2330_1px,transparent_1px)] [background-size:16px_16px]">
                              "{activeSlide.holding.notes}"
                            </div>
                          </div>
                        )}

                        {/* GRADING MASTER SPECIFICS */}
                        {activeSlide && activeSlide.type === 'graded_gems' && activeSlide.holding && (
                          <div className="grid grid-cols-2 gap-3 pt-3 max-w-md text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="text-indigo-300">Certificadora: <strong>{activeSlide.holding.gradeType}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl">
                              <Award className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                              <span>Grade Registrada: <strong>{activeSlide.holding.gradeValue}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl col-span-2">
                              <span className="truncate">Cert ID Serial: <strong className="text-slate-200">{activeSlide.holding.certNumber || 'N/A: Sem serial catalogado'}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* COMPILATION FLOW GENERAL STATISTICS */}
                        {activeSlide && activeSlide.type === 'compilation_flow' && activeCompObj && (
                          <div className="pt-2 max-w-md">
                            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-2.5">
                              <span className="text-[9px] text-[#FFCB05] font-mono block uppercase font-bold tracking-wider">MARCOS INDIVIDUAIS DA CARTA ATIVA</span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Qualidade física:</span>
                                <strong className="text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">{activeCompObj.item.quality || 'Raw / Bruto'}</strong>
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Lote adquirido em:</span>
                                <strong className="text-white">{activeCompObj.item.purchaseDate}</strong>
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Preço de Cotação:</span>
                                <strong className="text-white">{currencySymbol}{(marketPrices[activeCompObj.card?.id ?? ''] || activeCompObj.item.purchasePrice).toLocaleString()}</strong>
                              </div>
                              {activeCompObj.item.notes && (
                                <div className="border-t border-slate-850 mt-1.5 pt-2 text-[10px] text-slate-400 italic">
                                  "{activeCompObj.item.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Panoramic controls and visual navigation dots */}
                  <div className="relative z-10 space-y-4 pt-4 border-t border-slate-850/80">
                    {/* Visual Slide dots representation */}
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      {cinematicSlides.map((_, dotIdx) => (
                        <button
                          key={`dot-${dotIdx}`}
                          onClick={() => onSetSlideIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentSlideIdx === dotIdx ? 'w-6 bg-[#FFCB05]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Ir para o Capítulo ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Play/Pause Autoplayer triggers */}
                      <button
                        onClick={() => onTogglePlaying()}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider flex items-center gap-2 cursor-pointer transition active:scale-95 border ${
                          isPlaying 
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-current" />
                            <span>Pausar Apresentação</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#FFCB05] shrink-0 fill-current animate-pulse" />
                            <span>Iniciar Slideshow</span>
                          </>
                        )}
                      </button>

                      {/* Panoramic manual layout selectors */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onStopPlaying();
                            onSlideIndexChange((prev) => prev > 0 ? prev - 1 : cinematicSlides.length - 1);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition active:scale-95"
                          title="Recuar Capítulo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-[10px] font-mono text-slate-400 font-bold px-1 select-none">
                          CAPÍTULO {currentSlideIdx + 1} / {cinematicSlides.length}
                        </span>

                        <button
                          onClick={() => {
                            onStopPlaying();
                            onSlideIndexChange((prev) => prev < cinematicSlides.length - 1 ? prev + 1 : 0);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition active:scale-95"
                          title="Avançar Capítulo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
  );
}
