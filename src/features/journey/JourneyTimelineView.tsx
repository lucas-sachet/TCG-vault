/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { ArrowUpDown, BookOpen, Eye, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Binder } from '../../types';
import type { JourneyEvent, ZoomedImageState } from './types';

export interface JourneyTimelineViewProps {
  binders: Binder[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedBinderId: string;
  onSelectedBinderIdChange: (value: string) => void;
  eventTypeFilter: string;
  onEventTypeFilterChange: (value: string) => void;
  sortByRecent: boolean;
  onSortByRecentChange: (value: boolean) => void;
  filteredTimelineEvents: JourneyEvent[];
  currencySymbol: string;
  onViewCardDetails: (cardId: string) => void;
  onZoomImage: (image: ZoomedImageState) => void;
}

export function JourneyTimelineView({
  binders,
  searchQuery,
  onSearchQueryChange,
  selectedBinderId,
  onSelectedBinderIdChange,
  eventTypeFilter,
  onEventTypeFilterChange,
  sortByRecent,
  onSortByRecentChange,
  filteredTimelineEvents,
  currencySymbol,
  onViewCardDetails,
  onZoomImage,
}: JourneyTimelineViewProps) {
  return (
    <motion.div
      key="timeline-container-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
            <div className="bg-[#14161f]/80 p-4 border border-slate-850 rounded-2xl flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar cartas da jornada, conjuntos ou memorandos..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="w-full text-xs text-slate-100 bg-[#0F1115] pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40 transition"
                />
              </div>

              {/* Binder Filter */}
              <div className="w-full md:w-44 text-left">
                <select
                  value={selectedBinderId}
                  onChange={(e) => onSelectedBinderIdChange(e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#0F1115] py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40"
                >
                  <option value="ALL">Coleção Inteira</option>
                  {binders.map((b) => (
                    <option key={b.id} value={b.id}>
                      📂 {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div className="w-full md:w-44 text-left">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => onEventTypeFilterChange(e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#0F1115] py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40"
                >
                  <option value="ALL">Todos os Eventos</option>
                  <option value="acquired">✨ Aquisições</option>
                  <option value="personal_note">✍️ Diários e Notas</option>
                  <option value="photo_added">📸 Fotos Registradas</option>
                  <option value="grade_received">🏆 Retornos de Notas (PSA/CGC)</option>
                  <option value="price_milestone">📈 Altas e Baixas de Tickers</option>
                  <option value="binder_moved">📂 Alocações de Pasta</option>
                </select>
              </div>

              {/* Sorting Toggle Button */}
              <button
                onClick={() => onSortByRecentChange(!sortByRecent)}
                className="bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 font-bold px-4 py-2.5 rounded-xl border border-slate-750 text-xs flex items-center justify-center gap-2 transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FFCB05]" />
                <span>{sortByRecent ? 'Mais Recentes primeiro' : 'Mais Antigas primeiro'}</span>
              </button>
            </div>
      <div className="relative py-4 text-left">
              {filteredTimelineEvents.length === 0 ? (
                <div className="py-20 text-center bg-slate-950/20 border border-slate-850/60 rounded-3xl p-6">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Nenhuma crônica correspondente</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    Nenhum registro correspondente foi localizado para os seus filtros. Adote notas, submeta gemas a certificadores ou anexe fotos de espécimes reais para preencher seu compêndio!
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 md:pl-32 space-y-12">
                  {/* Timeline primary connector path */}
                  <div className="absolute left-[13px] md:left-[111px] top-6 bottom-6 w-[2px] bg-indigo-950" />

                  <AnimatePresence initial={false}>
                    {filteredTimelineEvents.map((event, idx) => {
                      const IconComponent = event.icon;
                      const formattedDate = new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <motion.div
                          key={event.id}
                          id={`journey-event-div-${event.id}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 1) }}
                          className="relative flex flex-col md:flex-row gap-5"
                        >
                          {/* Left date side panel on medium viewports */}
                          <div className="hidden md:absolute md:block md:-left-[152px] md:w-[120px] text-right pt-2 space-y-0.5">
                            <span className="text-xs font-black text-[#FFCB05] font-mono whitespace-nowrap block leading-none">
                              {formattedDate}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block tracking-wide leading-none">
                              {event.date}
                            </span>
                          </div>

                          {/* Timeline central bullet */}
                          <div className="absolute -left-[20px] md:-left-[26px] z-10 w-[14px] h-[14px] rounded-full bg-[#0F1115] border-2 border-indigo-500/80 mt-[15px] flex items-center justify-center">
                            <div className="w-[6px] h-[6px] rounded-full bg-[#FFCB05]" />
                          </div>

                          {/* Primary content component body */}
                          <div className="flex-1 bg-gradient-to-br from-[#12141c] to-[#0d0e14] border border-slate-850/80 rounded-2xl p-4 md:p-5.5 hover:border-slate-800 transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                            
                            {/* Card Inspect Click trigger redirect */}
                            <button
                              onClick={() => onViewCardDetails(event.card.id)}
                              className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                              title="Inspecionar ficha da carta"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Mobile inline fallback date badge */}
                            <div className="md:hidden inline-flex self-start px-2 py-0.5 bg-indigo-950/65 border border-indigo-900 rounded font-mono text-[9px] text-[#FFCB05] font-bold tracking-wide uppercase mb-1">
                              {formattedDate}
                            </div>

                            {/* Artifact/Card thumbnail */}
                            <div className="w-14 h-20 shrink-0 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center relative group p-0.5 self-start sm:self-center">
                              <img
                                src={event.card.imageUrl}
                                alt={event.card.name}
                                className="w-full h-full object-contain cursor-pointer transform group-hover:scale-105 transition"
                                referrerPolicy="no-referrer"
                                onClick={() => onViewCardDetails(event.card.id)}
                              />
                            </div>

                            {/* Core description elements */}
                            <div className="flex-1 space-y-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-mono tracking-wider font-bold uppercase border ${event.iconBg}`}>
                                  <IconComponent className="w-3 h-3" />
                                  <span>{event.title}</span>
                                </span>

                                <span className="text-[10px] text-slate-400 font-bold block">
                                  — {event.card.name} ({event.card.language})
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="text-white font-black text-xs sm:text-sm tracking-wide">
                                  {event.subtitle}
                                </h4>

                                {event.type === 'personal_note' ? (
                                  <div className="p-3 bg-yellow-950/15 border-l-3 border-yellow-500/50 text-yellow-100 rounded-r-xl text-xs leading-relaxed italic font-mono bg-[radial-gradient(#1A1D24_1px,transparent_1px)] [background-size:16px_16px]">
                                    "{event.description}"
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                                    {event.description}
                                  </p>
                                )}
                              </div>

                              {/* Physical Photo previews attachment layout */}
                              {event.type === 'photo_added' && event.meta && (
                                <div className="flex flex-wrap gap-3 pt-1.5">
                                  {event.meta.photoFront && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Frente do Espécime</span>
                                      <div 
                                        onClick={() => onZoomImage({ url: event.meta!.photoFront!, title: `${event.card.name} (Fotografia do Espécime - Frente)` })}
                                        className="w-24 h-18 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden cursor-zoom-in relative group hover:border-[#FFCB05]/40 transition"
                                      >
                                        <img src={event.meta.photoFront} alt="Fotografia Frente" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <Eye className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {event.meta.photoBack && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Verso do Espécime</span>
                                      <div 
                                        onClick={() => onZoomImage({ url: event.meta!.photoBack!, title: `${event.card.name} (Fotografia do Espécime - Verso)` })}
                                        className="w-24 h-18 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden cursor-zoom-in relative group hover:border-[#FFCB05]/40 transition"
                                      >
                                        <img src={event.meta.photoBack} alt="Fotografia Verso" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <Eye className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Financial appraisal events details */}
                              {event.type === 'price_milestone' && event.meta && (
                                <div className="flex items-center gap-4 text-[10px] font-mono mt-1 text-slate-400">
                                  <div>
                                    <span>Preço de Compra: </span>
                                    <strong className="text-slate-300 font-mono">{currencySymbol}{event.meta.oldPrice}</strong>
                                  </div>
                                  <div className="h-3 w-px bg-slate-800" />
                                  <div>
                                    <span>Cotação Estimada: </span>
                                    <strong className={`font-mono ${event.meta.newPrice! >= event.meta.oldPrice! ? 'text-green-400' : 'text-red-400'}`}>
                                      {currencySymbol}{event.meta.newPrice}
                                    </strong>
                                  </div>
                                </div>
                              )}

                              {/* Technical Grading details layout */}
                              {event.type === 'grade_received' && event.meta && (
                                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-[10px] font-mono max-w-md">
                                  <div className="px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-900/50 rounded-lg font-black text-center shrink-0 min-w-[65px] flex flex-col justify-center leading-none">
                                    <span className="text-[6px] tracking-wide text-indigo-400 uppercase font-bold mb-0.5">{event.meta.gradeType}</span>
                                    <span className="text-xs font-mono">{event.meta.gradeValue}</span>
                                  </div>
                                  <div className="text-left">
                                    <span className="text-slate-500 block text-[9px] uppercase">ID de Certificação Serial</span>
                                    <span className="text-slate-300 font-bold block mt-0.5">{event.meta.certNumber || 'N/A: Sem ID registrado'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
    </motion.div>
  );
}
