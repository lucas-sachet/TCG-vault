import React from 'react';
import type { Card, CollectionItem, WishlistItem } from '../../types';
import { LANGUAGE_METADATA } from '../../data/pokemonData';

interface CardDetailsOverviewProps {
  card: Card;
  currencySymbol: string;
  currentPrice: number;
  isOwned: boolean;
  isWishlist: boolean;
  wishlistItem: WishlistItem | undefined;
  purchasePrice: number;
  qty: number;
  profitLoss: number;
  roi: number;
  isProfit: boolean;
  showPortfolioMetrics?: boolean;
}

export const CardDetailsOverview: React.FC<CardDetailsOverviewProps> = ({
  card,
  currencySymbol,
  currentPrice,
  isOwned,
  isWishlist,
  wishlistItem,
  purchasePrice,
  qty,
  profitLoss,
  roi,
  isProfit,
  showPortfolioMetrics = true,
}) => {
  const languageInfo = LANGUAGE_METADATA[card.language] || { flag: '🌐', label: card.language };

  return (
    <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">{card.name}</h1>
        <p className="text-sm font-bold text-[#FFCB05] mt-1">{card.set} • #{card.number}</p>

        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
            <span className="text-[9px] text-slate-500 block uppercase">RARITY STYLE</span>
            <span className="text-slate-200 font-bold block mt-1 truncate">{card.rarity}</span>
          </div>
          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
            <span className="text-[9px] text-slate-500 block uppercase">LANG EDITION</span>
            <span className="text-slate-200 font-bold block mt-1 flex items-center gap-1.5">
              <span>{languageInfo.flag}</span>
              <span className="truncate">{languageInfo.label}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 border border-slate-800 rounded-2xl">
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold leading-3">COLLECTION INSIGHTS</span>

        <div className="grid grid-cols-2 gap-3.5 mt-3.5">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Market Price</span>
            <span className="text-xl font-black text-yellow-400 font-mono block mt-0.5">
              {currencySymbol}{currentPrice.toLocaleString()}
            </span>
          </div>

          {showPortfolioMetrics && isOwned ? (
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Appreciation</span>
              <span className={`text-xl font-black font-mono block mt-0.5 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}{roi.toFixed(0)}%
              </span>
            </div>
          ) : showPortfolioMetrics && !isOwned ? (
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Spread Target</span>
              <span className="text-sm font-bold font-mono text-slate-300 block mt-1">
                {isWishlist && wishlistItem ? `${currencySymbol}${wishlistItem.desiredPrice} (Wish)` : 'N/A'}
              </span>
            </div>
          ) : null}
        </div>

        {showPortfolioMetrics && isOwned && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-mono">ACQUISITION COST</span>
              <span className="block font-bold text-slate-300 font-mono mt-0.5">{currencySymbol}{purchasePrice.toLocaleString()} (qty: {qty})</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-mono">ESTIMATED GAIN</span>
              <span className={`block font-black font-mono mt-0.5 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{currencySymbol}{profitLoss.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
