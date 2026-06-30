/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ArrowUpRight, 
  Sparkles, 
  Flame, 
  Clock, 
  Layers, 
  FolderLock,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CollectionItem, PriceSnapshot, Binder, CollectionGoal } from '../types';
import { CardItem } from './CardItem';
import { GoalsSection } from './GoalsSection';
import { calculatePortfolioValue } from '../utils/valuation';

interface DashboardTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  priceHistories: Record<string, PriceSnapshot[]>;
  binders: Binder[];
  selectedBinderId: string;
  onSelectBinder: (binderId: string) => void;
  onViewCardDetails: (cardId: string) => void;
  onOpenAddModal: () => void;
  onChangeTab: (tab: any) => void;
  onTriggerPriceSync: () => void;
  isSyncing: boolean;
  currencySymbol?: string;
  goals: CollectionGoal[];
  onAddGoal: (goal: Omit<CollectionGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  cards,
  collectionItems,
  marketPrices,
  priceHistories,
  binders,
  selectedBinderId,
  onSelectBinder,
  onViewCardDetails,
  onOpenAddModal,
  onChangeTab,
  onTriggerPriceSync,
  isSyncing,
  currencySymbol = '$',
  goals,
  onAddGoal,
  onDeleteGoal
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Financial calculations
  const totalCost = collectionItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  const totalCurrentValue = calculatePortfolioValue(collectionItems, marketPrices);

  const profitLoss = totalCurrentValue - totalCost;
  const overallRolPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  const isProfit = profitLoss >= 0;

  // Calculate historical portfolio series (6 months back, looking at captured snapshots)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const calculateHistoricalGrowth = () => {
    const monthlyPortfolios = [0, 0, 0, 0, 0, 0];
    
    // Sum for each snapshot index
    collectionItems.forEach((item) => {
      const history = priceHistories[item.cardId] || [];
      for (let i = 0; i < 6; i++) {
        const snapPrice = history[i] ? history[i].marketPrice : (marketPrices[item.cardId] || 0);
        monthlyPortfolios[i] += snapPrice * item.quantity;
      }
    });

    // If empty collection, return template values
    if (collectionItems.length === 0) {
      return [0, 0, 0, 0, 0, 0];
    }

    return monthlyPortfolios;
  };

  const growthSeries = calculateHistoricalGrowth();
  const maxSeriesValue = Math.max(...growthSeries, 1000) * 1.1;
  const minSeriesValue = Math.min(...growthSeries, 0) * 0.9;

  // Render SVG dynamic dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const points = growthSeries.map((val, idx) => {
    const x = paddingX + (idx / (growthSeries.length - 1)) * (svgWidth - paddingX * 2);
    // Inverse scale for Y coordinates in SVG
    const range = maxSeriesValue - minSeriesValue;
    const y = svgHeight - paddingY - ((val - minSeriesValue) / (range || 1)) * (svgHeight - paddingY * 2);
    return { x, y, value: val, month: monthLabels[idx] };
  });

  const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const dArea = `${dPath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Get Top Performers (Gainers) in owned collection
  const topGainers = collectionItems
    .map((item) => {
      const card = cards.find(c => c.id === item.cardId);
      const marketPrice = marketPrices[item.cardId] || 0;
      const profit = marketPrice - item.purchasePrice;
      const itemRoi = item.purchasePrice > 0 ? (profit / item.purchasePrice) * 100 : 0;
      return { card, item, currentPrice: marketPrice, profit, roi: itemRoi };
    })
    .filter(x => x.card)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);

  // Active collection size
  const totalCardsQty = collectionItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Dynamic Sync Trigger Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1D24] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSyncing ? 'bg-yellow-500/10 text-[#FFCB05]' : 'bg-blue-500/10 text-[#3B4CCA]'} transition-colors`}>
            <Sparkles className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Market Price Status: <span className="text-emerald-400 font-mono">Up to Date</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prices indexed from official TCG listings. Locally cached for offline lookup.
            </p>
          </div>
        </div>
        
        <button
          id="sync-prices-now-btn"
          disabled={isSyncing}
          onClick={onTriggerPriceSync}
          className="bg-slate-800 hover:bg-slate-700/80 disabled:opacity-55 disabled:cursor-not-allowed border border-slate-700 text-white hover:text-[#FFCB05] font-bold text-xs py-2 px-4 rounded-xl transition-all font-mono tracking-wider shrink-0"
        >
          {isSyncing ? 'FETCHING UPDATES...' : 'UPDATE PRICES NOW'}
        </button>
      </div>

      {/* KPI Performance Section */}
      <section id="kpi-panel" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Collection Portfolio Value */}
        <div className="bg-gradient-to-br from-[#1E222B] to-[#16181F] p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 text-[#FFCB05] group-hover:scale-110 transition-transform">
            <Coins className="w-16 h-16" />
          </div>
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">TOTAL COLLECTION VALUE</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-white">
              {currencySymbol}{totalCurrentValue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFCB05] animate-pulse" />
            <span>Tracking {totalCardsQty} physical TCG items</span>
          </p>
        </div>

        {/* Invested Capital */}
        <div className="bg-gradient-to-br from-[#1E222B] to-[#16181F] p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">TOTAL ACQUISITION COST</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black font-mono text-slate-200">
              {currencySymbol}{totalCost.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Average Cost Basis: {currencySymbol}{totalCardsQty ? Math.round(totalCost / totalCardsQty) : 0} / card</span>
          </div>
        </div>

        {/* Unrealized Gain / Loss */}
        <div className="bg-gradient-to-br from-[#1E222B] to-[#16181F] p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">ESTIMATED APPRECIATION</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-black font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{currencySymbol}{profitLoss.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg border font-mono ${
              isProfit 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isProfit ? '+' : ''}{overallRolPercentage.toFixed(1)}% Growth</span>
            </span>
            <span className="text-[10px] text-slate-500">since tracking launch</span>
          </div>
        </div>
      </section>

      {/* Interactive Collection Goals Tracking Panel */}
      <GoalsSection
        cards={cards}
        collectionItems={collectionItems}
        marketPrices={marketPrices}
        goals={goals}
        onAddGoal={onAddGoal}
        onDeleteGoal={onDeleteGoal}
        currencySymbol={currencySymbol}
      />

      {/* Portfolio Growth Graph & Sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Portfolio Growth Chart */}
        <div className="lg:col-span-2 bg-[#1A1D24] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                Collection Valuation Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Value trajectory over the past 6 months based on snapshot tracking.
              </p>
            </div>
            
            {hoveredPointIndex !== null && (
              <div className="bg-[#15171e] border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs text-right shadow-md">
                <span className="text-[10px] text-slate-500 block">{points[hoveredPointIndex].month} Value</span>
                <span className="text-[#FFCB05] font-black">{currencySymbol}{points[hoveredPointIndex].value.toLocaleString()}</span>
              </div>
            )}
          </div>

          {collectionItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">No growth records yet.</p>
              <p className="text-xs text-slate-500 mt-1">Add cards to populate historical charts.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto pb-2 select-none">
              <svg 
                className="w-full h-auto min-w-[500px]" 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              >
                <defs>
                  {/* Linear gradient shading below line */}
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B4CCA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3B4CCA" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Highlight neon gradient for main path */}
                  <linearGradient id="neon-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B4CCA" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#FFCB05" />
                  </linearGradient>
                </defs>

                {/* Y Axis gridlines */}
                {[0.25, 0.5, 0.75].map((ratio, index) => {
                  const yVal = paddingY + ratio * (svgHeight - paddingY * 2);
                  const priceLabel = Math.round(minSeriesValue + (1 - ratio) * (maxSeriesValue - minSeriesValue));
                  return (
                    <g key={index} className="opacity-35 font-mono text-[9px] fill-slate-500">
                      <line 
                        x1={paddingX} 
                        y1={yVal} 
                        x2={svgWidth - paddingX} 
                        y2={yVal} 
                        stroke="#334155" 
                        strokeWidth="0.5" 
                        strokeDasharray="4 4" 
                      />
                      <text x={10} y={yVal + 3}>
                        {currencySymbol}{priceLabel >= 1000 ? `${(priceLabel/1000).toFixed(1)}k` : priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Shading Area graph */}
                <path d={dArea} fill="url(#chart-glow)" />

                {/* Vector Connection Path */}
                <path 
                  d={dPath} 
                  fill="none" 
                  stroke="url(#neon-line)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* On-Hover Interactive Interaction dots */}
                {points.map((p, idx) => (
                  <g 
                    key={idx}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer group/dot"
                  >
                    {/* Transparent big pointer sensory circle */}
                    <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                    
                    {/* Glowing outer backdrop ring */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredPointIndex === idx ? "8" : "4"} 
                      fill={idx % 2 === 0 ? "#FFCB05" : "#3B4CCA"} 
                      className="transition-all duration-150"
                      opacity={hoveredPointIndex === idx ? "0.6" : "0.3"} 
                    />

                    {/* Small solid inner core */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="3.5" 
                      fill="#FFFFFF" 
                      stroke={idx % 2 === 0 ? "#FFCB05" : "#3B4CCA"} 
                      strokeWidth="1.5" 
                    />

                    {/* X Axis Month Labels */}
                    <text 
                      x={p.x} 
                      y={svgHeight - 4} 
                      textAnchor="middle" 
                      className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                        hoveredPointIndex === idx ? 'fill-[#FFCB05]' : 'fill-slate-500'
                      }`}
                    >
                      {p.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Binder Shelf & Hot Collections summary */}
        <div className="bg-[#1A1D24] p-5 rounded-2xl border border-slate-800 flex flex-col justify-[#1A1D24] justify-between">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
              <FolderLock className="w-4 h-4 text-[#FFCB05]" />
              <span>Collection Binders</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quick access shortcuts to your active binders on the Collection tab.
            </p>

            <div className="space-y-2 mt-4">
              {binders.map((binder) => {
                const binderCount = binder.id === 'binder-all' 
                  ? collectionItems.length 
                  : collectionItems.filter(item => item.binderId === binder.id).length;

                return (
                  <button
                    key={binder.id}
                    onClick={() => {
                      onSelectBinder(binder.id);
                      onChangeTab('collection');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl transition-all border text-left bg-slate-900/40 hover:bg-slate-900 hover:border-[#FFCB05]/40 border-slate-800 text-slate-300 group cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-xs block group-hover:text-[#FFCB05] transition-colors">{binder.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[170px]">{binder.description || 'Open binder sheets'}</span>
                    </div>
                    <span className="bg-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px] text-slate-300 border border-slate-800 shrink-0">
                      {binderCount} cards
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onChangeTab('settings')}
              className="text-xs font-bold text-slate-400 hover:text-[#FFCB05] flex items-center justify-between w-full"
            >
              <span>Manage binders inside Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Performers and Dynamic Gainers shelf */}
      <section id="top-gainers-ticker" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gainers Showcase */}
        <div className="bg-[#1A1D24] p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <h3 className="font-black text-sm uppercase text-slate-100 tracking-wider">Top Performing Collections</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">By Growth Rate</span>
          </div>

          {topGainers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              No performance stats available yet. Add items you owned!
            </div>
          ) : (
            <div className="space-y-3">
               {topGainers.map(({ card, item, currentPrice, profit, roi }) => {
                const totalHoldingValue = currentPrice * item.quantity;
                return (
                  <div 
                    key={item.id}
                    onClick={() => onViewCardDetails(card!.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all"
                  >
                    <img 
                      src={card?.imageUrl} 
                      alt={card?.name} 
                      className="w-10 h-14 object-contain rounded bg-slate-950 shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{card?.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{card?.set} ({card?.language})</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-slate-200 block">
                        {currencySymbol}{totalHoldingValue.toLocaleString()}
                      </span>
                      <span className="font-mono font-bold text-[10px] text-green-400">
                        +{roi.toFixed(0)}% Growth
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informative collection checklist */}
        <div className="bg-[#1A1D24] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <h3 className="font-black text-sm uppercase text-slate-100 tracking-wider">Collector Strategy Guide</h3>
            </div>
            
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="bg-amber-400/10 text-[#FFCB05] px-1.5 py-0.5 rounded font-bold font-mono text-[9px] mt-0.5">01</span>
                <span>Prioritize JP print variants. Japanese cards historically sport heavier textures and strict quality checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-indigo-400/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold font-mono text-[9px] mt-0.5">02</span>
                <span>PSA 10 slabs are highly regarded. When adding cards, mark graded certification details to preserve specimen history.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono text-[9px] mt-0.5">03</span>
                <span>Diversify languages across English, Japanese, and specialized languages like Portuguese BR.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">Vault Engine v1.8.4</span>
            <button
              onClick={onOpenAddModal}
              className="text-[10px] font-bold text-[#FFCB05] hover:underline"
            >
              Add first card now &rarr;
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
