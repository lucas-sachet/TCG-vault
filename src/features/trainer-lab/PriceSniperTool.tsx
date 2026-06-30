/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { DollarSign, Flame, HelpCircle as InfoIcon, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import type { Card } from '../../types';

export interface SniperDeal {
  id: string;
  cardId: string;
  name: string;
  set: string;
  source: string;
  discount: string;
  marketVal: number;
  dealPrice: number;
  shipping: number;
  endsIn: string;
  trusted: boolean;
  imageUrl: string;
}

export interface PriceSniperToolProps {
  allKnownCards: Card[];
  marketPrices: Record<string, number>;
  currencySymbol: string;
  alertFormCardId: string;
  setAlertFormCardId: (id: string) => void;
  alertTargetPrice: number | '';
  setAlertTargetPrice: (value: number | '') => void;
  sniperRules: Array<{ id: string; cardId: string; cardName: string; targetPrice: number; currentPrice: number }>;
  sniperDeals: SniperDeal[];
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  onSnipPurchase: (deal: SniperDeal) => void;
}

export function PriceSniperTool(props: PriceSniperToolProps) {
  const {
    allKnownCards, marketPrices, currencySymbol,
    alertFormCardId, setAlertFormCardId, alertTargetPrice, setAlertTargetPrice,
    sniperRules, sniperDeals, onAddRule, onRemoveRule, onSnipPurchase,
  } = props;

  return (
    <motion.div key="tool-sniper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left column: Setup purchase target alert rules (Columns 1-4) */}
              <div className="lg:col-span-4 bg-[#12141c] border border-slate-850 p-6 rounded-3xl space-y-5 text-left">
                <div>
                  <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">TCG SNIPER ALERTS</span>
                  <h3 className="text-white font-black text-base mt-1">Alertas de Alvos</h3>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    Configure limites máximos para monitorar o mercado secundário. Sempre que houver correspondências de cards em leilões, você será notificado!
                  </p>
                </div>

                {/* Form to insert Alert target */}
                <div className="space-y-3 p-4 bg-[#0A0B0E] border border-slate-850 rounded-2xl">
                  <span className="text-[9px] text-[#FFCB05] font-mono block uppercase font-bold">Cadastrar Novo Monitor</span>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-mono text-slate-400 block font-bold">SELECIONAR CARD ALVO</label>
                    <select
                      value={alertFormCardId}
                      onChange={(e) => setAlertFormCardId(e.target.value)}
                      className="w-full text-xs text-slate-200 bg-slate-950 py-2.5 px-3 rounded-xl border border-slate-800"
                    >
                      <option value="">Selecione para Monitorar...</option>
                      {allKnownCards.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({currencySymbol}{marketPrices[c.id] || 25.00})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-mono text-slate-400 block font-bold">PREÇO MÁXIMO DO ALVO (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        placeholder="target max budget..."
                        value={alertTargetPrice}
                        onChange={(e) => setAlertTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs text-slate-200 bg-slate-950 pl-8 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={onAddRule}
                    disabled={!alertFormCardId || !alertTargetPrice}
                    className="w-full bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer select-none disabled:opacity-40 mt-1"
                  >
                    + Ativar Rule Sniper
                  </button>
                </div>

                {/* List of active sniper rules */}
                <div className="space-y-2 pt-3 border-t border-slate-850">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Target Surveillance List ({sniperRules.length})</span>
                  
                  {sniperRules.length === 0 ? (
                    <span className="text-[10px] font-sans text-slate-500 block italic">Nenhum gatilho de preço ativo.</span>
                  ) : (
                    <div className="space-y-1.5 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin">
                      {sniperRules.map(rule => (
                        <div key={rule.id} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/60 flex items-center justify-between text-xs font-mono">
                          <div className="text-left overflow-hidden pr-2">
                            <span className="text-slate-200 font-bold block truncate leading-tight">{rule.cardName}</span>
                            <span className="text-[9px] text-slate-500 block leading-tight">Alvo: {currencySymbol}{rule.targetPrice} | Atual: {currencySymbol}{rule.currentPrice}</span>
                          </div>
                          <button
                            onClick={() => onRemoveRule(rule.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>


              {/* Right column: Interactive Deal Finder (Columns 5-12) */}
              <div className="lg:col-span-8 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col text-left space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] text-emerald-400 font-mono tracking-widest block uppercase font-bold">LIVE SNIPER FINDER</span>
                  </div>
                  <h3 className="text-white font-black text-base mt-0.5">Scaneador de Barganhas Globais</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Filtramos lotes, leilões e listagens do mercado de colecionadores mundiais. Esses espécimes estão vendendo atualmente bem abaixo do preço composto!
                  </p>
                </div>

                {/* Feed container */}
                <div className="space-y-4">
                  {sniperDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-[#0b0c11] border border-slate-850 rounded-2xl p-4.5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between hover:border-slate-800 transition"
                    >
                      {/* Left Block description details */}
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className="w-11 h-16 shrink-0 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-0.5 border border-slate-850">
                          <img src={deal.imageUrl} alt={deal.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>

                        <div className="text-left overflow-hidden space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-yellow-950/70 text-[#FFCB05] border border-yellow-800/40 font-mono text-[8px] font-black uppercase rounded-lg">
                              ⚡ SALVOU {deal.discount}!
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">Set: {deal.set}</span>
                          </div>

                          <h4 className="text-white font-black text-xs sm:text-sm tracking-wide block truncate">
                            {deal.name}
                          </h4>
                          
                          <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-3">
                            <span>Mercado: <strong className="text-slate-300">{currencySymbol}{deal.marketVal.toFixed(2)}</strong></span>
                            <span className="h-3 w-px bg-slate-850" />
                            <span>Origem: <strong className="text-sky-400">{deal.source}</strong></span>
                            <span className="h-3 w-px bg-slate-850" />
                            <span className="text-yellow-400">{deal.endsIn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block pricing actions and buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-5.5 pt-3.5 md:pt-0 border-t md:border-t-0 border-slate-850/60 shrink-0 select-none">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-slate-500 block font-mono uppercase">Preço Arremate</span>
                          <strong className="text-emerald-400 text-lg sm:text-xl font-mono block leading-none font-black mt-1">
                            {currencySymbol}{deal.dealPrice.toFixed(2)}
                          </strong>
                          <span className="text-[8px] font-mono text-slate-600 block mt-0.5">+ {currencySymbol}{deal.shipping} frete</span>
                        </div>

                        <button
                          onClick={() => onSnipPurchase(deal)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 active:scale-95 duration-200"
                        >
                          <Flame className="w-4 h-4 fill-slate-950 animate-pulse" />
                          <span>Snip Deal</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Helper Banner tip */}
                <div className="bg-[#0b0c11]/45 border border-dashed border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <InfoIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    <strong>Dica de Mestre:</strong> Os filtros de barganha são atualizados dinamicamente a cada flutuação do índice de mercado de PokéVault. Configure alertas de surveillance na coluna esquerda para as suas cartas preferidas para priorizar as notificações do bot!
                  </p>
                </div>
              </div>

            </div>
    </motion.div>
  );
}
