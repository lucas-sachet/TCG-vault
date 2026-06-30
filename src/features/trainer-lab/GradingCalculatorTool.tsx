/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Card } from '../../types';

export interface GradingCalculatorToolProps {
  allKnownCards: Card[];
  gradingSelectedCardId: string;
  setGradingSelectedCardId: (id: string) => void;
  gradingCard: Card | null;
  centeringLeftRight: number;
  setCenteringLeftRight: (value: number) => void;
  centeringTopBottom: number;
  setCenteringTopBottom: (value: number) => void;
  condCorners: number;
  setCondCorners: (value: number) => void;
  condEdges: number;
  setCondEdges: (value: number) => void;
  condSurface: number;
  setCondSurface: (value: number) => void;
  gradingScoreCalculated: { average: string; predictedPSA: number; label: string; text: string; centeringScore: number };
  savingGradeResult: boolean;
  savedGradesHistory: Array<{ id: string; cardName: string; grade: string; text: string; date: string }>;
  onSaveSimulation: () => void;
}

export function GradingCalculatorTool(props: GradingCalculatorToolProps) {
  const {
    allKnownCards, gradingSelectedCardId, setGradingSelectedCardId, gradingCard,
    centeringLeftRight, setCenteringLeftRight, centeringTopBottom, setCenteringTopBottom,
    condCorners, setCondCorners, condEdges, setCondEdges, condSurface, setCondSurface,
    gradingScoreCalculated, savingGradeResult, savedGradesHistory, onSaveSimulation,
  } = props;

  return (
    <motion.div key="tool-grading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Visual Card Measuring Stage with Overlay crosshair (Columns 1-7) */}
              <div className="lg:col-span-7 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-purple-400 font-mono tracking-widest block uppercase font-bold">CONDITION DETAILED SURVEY</span>
                      <h3 className="text-white font-black text-lg mt-0.5">Mesa de Gradação de Centering</h3>
                    </div>

                    <select
                      value={gradingSelectedCardId}
                      onChange={(e) => setGradingSelectedCardId(e.target.value)}
                      className="text-xs text-slate-200 bg-[#0F1115] py-2 px-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-400 text-left"
                    >
                      {allKnownCards.map(c => (
                        <option key={c.id} value={c.id}>
                          🃏 {c.name} ({c.number})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    Inspecione a relação das bordas amarelas/escuras. use as rédeas abaixo para alinhar os limites e testar se a carta é qualificada como PSA 10 Gem Mint.
                  </p>
                </div>

                {/* Main measurement canvas */}
                <div className="my-6 aspect-[1.1/1] bg-[#0b0c11] border border-slate-850 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                  {/* Grid lines texture backing */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                  {/* Centering overlay measurements line */}
                  <div className="absolute top-1/2 left-4 right-4 h-px bg-green-500/20 z-10" />
                  <div className="absolute left-1/2 top-4 bottom-4 w-px bg-green-500/20 z-10" />

                  <div className="relative w-44 h-60 shrink-0">
                    <AnimatePresence mode="wait">
                      {gradingCard ? (
                        <motion.div
                          key={`grade-card-img-${gradingCard.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full h-full"
                        >
                          <img
                            src={gradingCard.imageUrl}
                            alt={gradingCard.name}
                            className="w-full h-full object-contain filter drop-shadow-2xl relative z-0 select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />

                          {/* Dynamic Crosshair measurement handles (Adjustable overlays) */}
                          {/* Left Border measurement guide */}
                          <div 
                            className="absolute left-0 bottom-0 top-0 w-1 bg-green-500 shadow-[0_0_10px_#10B981] z-20"
                            style={{ width: `${centeringLeftRight * 0.15}px` }}
                          />
                          {/* Right Border measurement guide */}
                          <div 
                            className="absolute right-0 bottom-0 top-0 bg-green-500 shadow-[0_0_10px_#10B981] z-20"
                            style={{ width: `${(100 - centeringLeftRight) * 0.15}px` }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full bg-slate-900/55 rounded-xl border border-dashed border-slate-850 flex items-center justify-center">
                          <span className="text-xs text-slate-500 font-mono">Espécime Vazio</span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Centering Overlay indicator bubble */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-950 border border-emerald-800 text-green-400 font-mono text-[9px] px-2.5 py-1 rounded-full text-center z-30 font-black">
                      LR Ratio: {centeringLeftRight} / {100 - centeringLeftRight}
                    </div>
                  </div>
                </div>

                {/* Left/Right and Top/Bottom Centering sliders */}
                <div className="space-y-3.5 bg-[#0b0c11] border border-slate-850 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="font-bold">Eixo Lateral (Esquerda / Direita)</span>
                      <strong className="text-green-400 font-mono">Bordas: {centeringLeftRight}% L / {100 - centeringLeftRight}% R</strong>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={centeringLeftRight}
                      onChange={(e) => setCenteringLeftRight(Number(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-slate-950 h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="font-bold">Eixo Vertical (Superior / Inferior)</span>
                      <strong className="text-green-400 font-mono">Bordas: {centeringTopBottom}% T / {100 - centeringTopBottom}% B</strong>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={centeringTopBottom}
                      onChange={(e) => setCenteringTopBottom(Number(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-slate-950 h-1.5 rounded-lg"
                    />
                  </div>
                </div>
              </div>


              {/* Right Column: Pre-Grading checklist and final predicted Slab (Columns 8-12) */}
              <div className="lg:col-span-5 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col justify-between text-left">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-black text-sm">Pre-Grading Checklist</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Ajuste os parâmetros abaixo baseados em uma inspeção detalhada em luz direta de sua carta física.
                    </p>
                  </div>

                  {/* Interactive parameters Checklist */}
                  <div className="space-y-4">
                    {/* Corners */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Cantos (Corners Quality)</span>
                        <span className="text-purple-400 font-black">{condCorners} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condCorners}
                        onChange={(e) => setCondCorners(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condCorners === 10 ? 'Pristine: No chipping or round defects' : condCorners >= 8.5 ? 'Minor white point invisible under casual inspection' : 'Substantial whitening/peeling'}
                      </span>
                    </div>

                    {/* Edges */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Bordas (Edges Condition)</span>
                        <span className="text-purple-400 font-black">{condEdges} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condEdges}
                        onChange={(e) => setCondEdges(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condEdges === 10 ? 'Perfect sharp cut: Zero silvering/fuzziness' : condEdges >= 8.5 ? 'Very light nick on one edge' : 'Severe micro-tears / silvering'}
                      </span>
                    </div>

                    {/* Surface */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Superfície (Surface Glare)</span>
                        <span className="text-purple-400 font-black">{condSurface} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condSurface}
                        onChange={(e) => setCondSurface(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condSurface === 10 ? 'Flawless holo shine: Zero micro-scratches' : condSurface >= 8.5 ? 'Very minor light scratch on print line' : 'Dull glaze, wax stains or deep scratches'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estimated grade certificate results block (Rendering PSA replica card) */}
                <div className="pt-6 border-t border-slate-850 mt-6 space-y-4">
                  
                  {/* PSA / CGC virtual card certificate mockup */}
                  <div className="bg-[#EBEBEB] border-2 border-slate-400 p-3 rounded-xl text-slate-950 font-mono shadow-md overflow-hidden text-left relative flex flex-col justify-between min-h-[92px]">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-red-600" />
                    
                    <div className="flex justify-between items-start pt-1 font-mono tracking-wide">
                      <div className="text-[9px] uppercase font-bold leading-none space-y-0.5">
                        <span className="block font-black text-slate-800">POKÉVAULT LAB INC.</span>
                        <span className="block text-[8px] text-slate-600 font-medium">{gradingCard?.set?.slice(0, 20) || 'TCG COLLECTION'}</span>
                        <span className="block text-[8px] text-slate-550 font-bold">{gradingCard?.name || 'Pokemon Card'}</span>
                      </div>

                      <div className="text-right flex flex-col justify-center leading-none truncate pl-2 shrink-0">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Estimated</span>
                        <strong className="text-base text-red-600 font-mono block font-black leading-none mt-0.5">{gradingScoreCalculated.predictedPSA}</strong>
                      </div>
                    </div>

                    <div className="flex items-end justify-between text-[8px] mt-2 font-mono text-slate-700 leading-none">
                      <span>AVG Score: {gradingScoreCalculated.average} / 10</span>
                      <span className="font-extrabold uppercase text-slate-850 tracking-wider">
                        {gradingScoreCalculated.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    {gradingScoreCalculated.text}
                  </p>

                  <button
                    onClick={onSaveSimulation}
                    disabled={savingGradeResult || !gradingCard}
                    className="w-full bg-[#FFCB05] hover:bg-[#ffe169] text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer select-none disabled:opacity-45"
                  >
                    {savingGradeResult ? 'Salvando Estimativa...' : 'Sincronizar Nota na Coleção'}
                  </button>
                  
                  {/* Saved grades historical log inside tab */}
                  {savedGradesHistory.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-slate-550 block uppercase font-bold">Histórico de Gradações Resgatado</span>
                      <div className="space-y-1 text-[9px] font-mono">
                        {savedGradesHistory.map((hSim) => (
                          <div key={hSim.id} className="flex justify-between text-slate-400 bg-slate-900/50 p-1 px-2.5 rounded-lg border border-slate-900">
                            <span className="truncate max-w-[130px] font-bold text-slate-300">{hSim.cardName}</span>
                            <span className="text-purple-400 font-black">{hSim.grade} ({hSim.date})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
    </motion.div>
  );
}
