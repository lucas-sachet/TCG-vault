/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { BadgeAlert, ChevronLeft, ChevronRight, Compass, Eye, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Card } from '../../types';

export interface VirtualBinderToolProps {
  binderPage: number;
  setBinderPage: (updater: (prev: number) => number) => void;
  binderPageSlots: Record<string, string>;
  allKnownCards: Card[];
  assignableCards: Array<{ id: string; name: string; imageUrl: string; set: string }>;
  assigningSlot: number | null;
  setAssigningSlot: (slot: number | null) => void;
  placeCardInSlot: (slotNumber: number, cardId: string) => void;
  onViewCardDetails: (cardId: string) => void;
}

export function VirtualBinderTool(props: VirtualBinderToolProps) {
  const {
    binderPage, setBinderPage, binderPageSlots, allKnownCards, assignableCards,
    assigningSlot, setAssigningSlot, placeCardInSlot, onViewCardDetails,
  } = props;

  return (
    <motion.div key="tool-binder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <span className="text-[9px] text-sky-400 font-mono tracking-widest block uppercase font-bold">VIRTUAL POCKET DISPLAY</span>
                <h3 className="text-white font-black text-lg mt-0.5">Simulador de Pasta 3x3</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Organize suas relíquias em uma visualização realista de binder físico de 9 bolso por página. Ideal para simular colecionamento em papel real!
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  disabled={binderPage === 1}
                  onClick={() => setBinderPage(prev => Math.max(1, prev - 1))}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-40 select-none cursor-pointer hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black font-mono text-[#FFCB05] bg-yellow-950/40 border border-yellow-800/40 px-4 py-2.5 rounded-xl">
                  PÁGINA {binderPage}
                </span>
                <button
                  onClick={() => setBinderPage(prev => prev + 1)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 select-none cursor-pointer hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Layout Grid Splitter (Left: the Binder Slots, Right: Assign Drawer if open) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Pocket Stage Frame (8 Columns) */}
              <div className="lg:col-span-8 bg-[#181a24] border-8 border-[#3A2218] p-5.5 sm:p-7 rounded-[32px] shadow-2xl relative bg-[radial-gradient(#0A0B0E_1.5px,transparent_1.5px)] [background-size:24px_24px] overflow-hidden">
                
                {/* Visual leather / stitching detail */}
                <div className="absolute inset-2 border-2 border-dashed border-[#503126]/30 rounded-2xl pointer-events-none" />

                {/* 3x3 Pocket Matrix */}
                <div className="grid grid-cols-3 gap-3.5 sm:gap-4 ml-0 relative z-10">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const slotNo = i + 1;
                    const key = `page_${binderPage}_slot_${slotNo}`;
                    const slottedCardId = binderPageSlots[key];
                    const cardFound = slottedCardId ? allKnownCards.find(c => c.id === slottedCardId) : null;

                    return (
                      <div
                        key={slotNo}
                        onClick={() => setAssigningSlot(slotNo)}
                        className={`aspect-[2.5/3.5] rounded-xl border-2 flex flex-col items-center justify-center text-center relative group overflow-hidden transition-all duration-300 cursor-pointer shadow-inner min-h-[145px] sm:min-h-[190px] ${
                          cardFound 
                            ? 'border-indigo-500/20 bg-slate-950 p-[3px] shadow-lg' 
                            : 'border-slate-800 border-dashed bg-slate-950/70 hover:bg-slate-950/90 hover:border-sky-500/40'
                        }`}
                      >
                        {/* Pocket slot index numbering */}
                        <div className="absolute bottom-1 right-2 font-mono text-[9px] text-slate-700 select-none z-10">
                          Slot {slotNo}
                        </div>

                        {cardFound ? (
                          // Card filled state
                          <div className="w-full h-full relative flex items-center justify-center">
                            <img
                              src={cardFound.imageUrl}
                              alt={cardFound.name}
                              className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Hover overlay removal button */}
                            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition duration-150 rounded-lg">
                              <span className="text-[10px] font-black font-sans text-[#FFCB05] px-2 text-center truncate">{cardFound.name}</span>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewCardDetails(cardFound.id);
                                  }}
                                  className="p-1 px-2 bg-slate-900 border border-slate-800 text-slate-300 rounded hover:text-white"
                                  title="Inspecionar"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    placeCardInSlot(slotNo, 'empty');
                                  }}
                                  className="p-1 bg-red-950/60 border border-red-900 text-red-400 rounded hover:text-red-300"
                                  title="Remover do bolso"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Card empty state slot
                          <div className="flex flex-col items-center justify-center p-3 select-none">
                            <Plus className="w-5 h-5 text-slate-700 group-hover:text-sky-500 transition-colors mb-1.5" />
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase leading-none tracking-wider">Inserir</span>
                            <span className="text-[8px] text-slate-700 block mt-1">Clique para alocar</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Pocket Card Selector Sidedrawer (4 Columns) */}
              <div className="lg:col-span-4 bg-[#12141c] border border-slate-850 p-5 rounded-3xl h-full space-y-4">
                <div>
                  <h4 className="text-white font-black text-sm">
                    {assigningSlot ? `Preencher Bolso ${assigningSlot}` : 'Seletor de Bolso'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {assigningSlot 
                      ? 'Clique em um de seus cards abaixo para alocá-lo nesse slot.' 
                      : 'Toque em qualquer compartimento vazio do binder para começar a encaixar seu acervo físico.'}
                  </p>
                </div>

                {assigningSlot && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between bg-sky-950/30 border border-sky-900/40 p-2 py-2.5 rounded-xl text-sky-400 font-mono text-[10px]">
                      <span>Definindo Bolso #{assigningSlot} de Página {binderPage}</span>
                      <button
                        onClick={() => setAssigningSlot(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    {assignableCards.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
                        <BadgeAlert className="w-7 h-7 text-slate-600 mx-auto" />
                        <span className="text-[11px] font-bold text-slate-400 block">Sua coleção está vazia!</span>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Adicione ou compre cartas na aba "Collection" ou use o Seletor Dourado da checklist para popular o acervo!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1.5 scrollbar-thin">
                        {assignableCards.map(c => {
                          // Prevent sorting duplicate visual card assignments on SAME page
                          const alreadySlottedInThisPage = Array.from({ length: 9 }).some((_, idx) => {
                            const ck = `page_${binderPage}_slot_${idx + 1}`;
                            return binderPageSlots[ck] === c.id;
                          });

                          return (
                            <button
                              key={c.id}
                              disabled={alreadySlottedInThisPage}
                              onClick={() => placeCardInSlot(assigningSlot, c.id)}
                              className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition gap-2 cursor-pointer ${
                                alreadySlottedInThisPage 
                                  ? 'bg-[#0a0b0e] border-transparent opacity-40 cursor-not-allowed' 
                                  : 'bg-[#0A0B0E] hover:bg-slate-900 border-slate-850'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <img src={c.imageUrl} alt={c.name} className="w-7 h-10 object-contain shrink-0" />
                                <div className="text-left overflow-hidden">
                                  <span className="text-[11px] font-black text-white block truncate leading-tight">{c.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block truncate">{c.set}</span>
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-sky-400 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!assigningSlot && (
                  <div className="p-10 text-center bg-[#0b0c11] border border-slate-850/60 rounded-2xl">
                    <Compass className="w-10 h-10 text-slate-800 mx-auto mb-2 animate-spin-slow" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nenhum bolso selecionado</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-sm mx-auto">
                      Selecione um dos 9 compartimentos da pasta ao lado para atribuir ou reorganizar sua prateleira virtual.
                    </p>
                  </div>
                )}
              </div>

            </div>
    </motion.div>
  );
}
