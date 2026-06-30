/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { ChevronLeft, ChevronRight, Crown, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card, CollectionItem } from '../../types';
import type { CinematicSlide } from './types';

export interface JourneyCinemaStageProps {
  cinematicSlides: CinematicSlide[];
  currentSlideIdx: number;
  activeSlide: CinematicSlide | null;
  activeCompilationCardIndex: number;
  compilationCards: Array<{ item: CollectionItem; card?: Card }>;
  activeCompObj: { item: CollectionItem; card?: Card } | null;
  tilt: { x: number; y: number };
  glarePosition: { x: number; y: number };
  onViewCardDetails: (cardId: string) => void;
  onCardMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCardMouseLeave: () => void;
  onCompilationIndexChange: (updater: (prev: number) => number) => void;
}

export function JourneyCinemaStage({
  cinematicSlides,
  currentSlideIdx,
  activeSlide,
  activeCompilationCardIndex,
  compilationCards,
  activeCompObj,
  tilt,
  glarePosition,
  onViewCardDetails,
  onCardMouseMove,
  onCardMouseLeave,
  onCompilationIndexChange,
}: JourneyCinemaStageProps) {
  return (
                <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0d0f15]/80 border border-slate-850 rounded-3xl p-6 relative overflow-hidden min-h-[460px]">
                  
                  {/* Dynamic Radial Ambient Blur Artwork Glow (Steam Backlight style) */}
                  {activeSlide && activeSlide.card && (
                    <motion.div 
                      key={`bg-blur-${activeSlide.card.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-cover bg-center filter blur-3xl pointer-events-none scale-125 z-0"
                      style={{ backgroundImage: `url(${activeSlide.card.imageUrl})` }}
                    />
                  )}

                  {/* Standard fallback background glow pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_70%)] z-0 pointer-events-none" />

                  {/* Top-aligned badge detailing which visual chapter this represents */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#FFCB05] uppercase bg-black/40 border border-slate-800/60 px-2.5 py-1 rounded-lg">
                      Capítulo Fólio {currentSlideIdx + 1} de {cinematicSlides.length}
                    </span>
                    
                    {activeSlide && activeSlide.card && (
                      <button 
                        onClick={() => onViewCardDetails(activeSlide.card!.id)}
                        className="p-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-all uppercase"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspecionar</span>
                      </button>
                    )}
                  </div>

                  {/* Holographic active card stage */}
                  <div className="relative w-full flex flex-col items-center justify-center z-10 pt-4">
                    <AnimatePresence mode="wait">
                      
                      {activeSlide && activeSlide.type === 'cover' ? (
                        // ==========================================
                        // COVER SLIDE FRONT ART STAGE
                        // ==========================================
                        <motion.div
                          key="stage-cover"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFCB05] to-indigo-500 p-0.5 shadow-2xl relative select-none">
                            <div className="w-full h-full bg-[#12141c] rounded-full flex items-center justify-center text-5xl">
                              {activeSlide.stats?.trainerAvatar.startsWith('data:') ? (
                                <img src={activeSlide.stats?.trainerAvatar} alt="Trainer Avatar" className="w-16 h-16 rounded-full object-cover" />
                              ) : (
                                activeSlide.stats?.trainerAvatar || '👴'
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#12141c] text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 font-sans">
                              Active
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCB05]/10 border border-[#FFCB05]/20 text-[#FFCB05] text-[10px] font-bold font-mono uppercase tracking-wider rounded-full">
                              <Crown className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span>Membro Certificado</span>
                            </div>
                            <h3 className="text-white font-black text-lg font-mono tracking-tight pt-1">
                              {activeSlide.stats?.trainerName}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold font-mono">
                              Cadastro de Coleções PokéVault
                            </p>
                          </div>
                        </motion.div>

                      ) : activeSlide && activeSlide.type === 'compilation_flow' ? (
                        // ==========================================
                        // COMPILATION CAROUSEL SHINE ART STAGE
                        // ==========================================
                        <motion.div
                          key={`stage-compilation-${activeCompilationCardIndex}`}
                          initial={{ opacity: 0, scale: 0.93 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.93 }}
                          transition={{ duration: 0.3 }}
                          className="w-full flex flex-col items-center justify-center text-center space-y-4"
                        >
                          {activeCompObj ? (
                            <div className="space-y-4 w-full flex flex-col items-center">
                              {/* Glowing card display with simulated touch/tilt */}
                              <div 
                                className="w-[180px] sm:w-[200px] aspect-[3/4.15] bg-[#0c0d12] rounded-[20px] border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative group overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
                                onMouseMove={onCardMouseMove}
                                onMouseLeave={onCardMouseLeave}
                                style={{
                                  transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                                  transition: 'transform 0.1s ease-out'
                                }}
                              >
                                <img 
                                  src={activeCompObj.card?.imageUrl} 
                                  alt={activeCompObj.card?.name}
                                  className="w-full h-full object-contain p-1 rounded-[16px] z-10 pointer-events-none"
                                />

                                {/* Foil dynamic glare gradient absolute wrap */}
                                <div 
                                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60 z-20 group-hover:opacity-90 transition-opacity"
                                  style={{
                                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 203, 5, 0.15) 35%, transparent 70%)`
                                  }}
                                />

                                {/* Prism line sparkle diagonal sweep */}
                                <div className="absolute inset-x-0 -top-full bottom-full bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:top-full transition-all duration-1000 ease-out z-20 pointer-events-none" />
                              </div>

                              {/* Compilation pagination toggler */}
                              <div className="flex items-center gap-3 bg-black/40 border border-slate-800/80 px-3 py-1.5 rounded-xl z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCompilationIndexChange(prev => prev > 0 ? prev - 1 : compilationCards.length - 1);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                                  title="Carta anterior"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <span className="text-[9px] text-[#FFCB05] font-mono font-bold tracking-wider">
                                  {activeCompilationCardIndex + 1} / {compilationCards.length} CARTAS
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCompilationIndexChange(prev => prev < compilationCards.length - 1 ? prev + 1 : 0);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                                  title="Próxima carta"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="h-6 leading-none">
                                <span className="text-xs font-black text-slate-200 block truncate max-w-[220px]">
                                  {activeCompObj.card?.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">
                                  {activeCompObj.card?.set} • Cod: {activeCompObj.item.quality || 'Raw'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Sem cartas registradas na coleção.</span>
                          )}
                        </motion.div>

                      ) : (
                        // ==========================================
                        // STANDARD MARCOS SLIDES ART STAGE (With Hover Tilt and Foil effects)
                        // ==========================================
                        <motion.div
                          key={`stage-slide-${activeSlide?.type}-${activeSlide?.card?.id}`}
                          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.94, rotate: 2 }}
                          transition={{ duration: 0.35 }}
                          className="flex flex-col items-center justify-center text-center space-y-4 w-full"
                        >
                          {activeSlide && activeSlide.card ? (
                            <div className="flex flex-col items-center justify-center space-y-4 w-full">
                              
                              {/* 3D Interactive Card Stage */}
                              <div 
                                className="w-[185px] sm:w-[205px] aspect-[3/4.15] bg-[#0c0d12] rounded-[20px] border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] relative group overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
                                onMouseMove={onCardMouseMove}
                                onMouseLeave={onCardMouseLeave}
                                style={{
                                  transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                                  transition: 'transform 0.1s ease-out'
                                }}
                              >
                                <img 
                                  src={activeSlide.card.imageUrl} 
                                  alt={activeSlide.card.name}
                                  className="w-full h-full object-contain p-1 rounded-[16px] z-10 pointer-events-none"
                                />

                                {/* Holographic linear glare sweep */}
                                <div 
                                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60 z-20 group-hover:opacity-90 transition-opacity"
                                  style={{
                                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.42) 0%, rgba(99, 102, 241, 0.15) 30%, transparent 65%)`
                                  }}
                                />

                                {/* Sparkle Sweeper sweep line */}
                                <div className="absolute inset-x-0 -top-full bottom-full bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:top-full transition-all duration-1000 ease-out z-20 pointer-events-none" />
                              </div>

                              {/* Small details text overlay */}
                              <div className="text-center block max-w-[200px] truncate leading-none">
                                <span className="text-xs font-black text-[#FFCB05] tracking-wide block uppercase font-mono">
                                  {activeSlide.card.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block tracking-normal mt-1 block uppercase">
                                  {activeSlide.card.set}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Carregando mídias autorizadas...</span>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Corner aesthetic coordinates design elements */}
                  <div className="absolute bottom-3 left-4 text-[7px] text-slate-600 font-mono tracking-wider font-bold">
                    PVAULT_HD_SPECIMEN_STAGE
                  </div>
                  <div className="absolute bottom-3 right-4 text-[7px] text-slate-600 font-mono tracking-wider font-bold">
                    SYS_BEACON_ONLINE
                  </div>
                </div>
  );
}
