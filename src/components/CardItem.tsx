/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { CreditCard, Shield, Sparkles, FolderArchive, ArrowUpRight, ArrowDownRight, Camera } from 'lucide-react';
import { Card, CollectionItem, WishlistItem } from '../types';
import { LANGUAGE_METADATA, QUALITY_METADATA } from '../data/pokemonData';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const getConditionStyle = (quality: string) => {
  switch (quality) {
    case 'M':
      return 'bg-slate-950/90 backdrop-blur-md text-emerald-400 border-emerald-500/40';
    case 'NM':
      return 'bg-slate-950/90 backdrop-blur-md text-green-400 border-green-500/40';
    case 'SP':
      return 'bg-slate-950/90 backdrop-blur-md text-blue-400 border-blue-500/40';
    case 'MP':
      return 'bg-slate-950/90 backdrop-blur-md text-yellow-500 border-amber-500/40';
    case 'HP':
      return 'bg-slate-950/90 backdrop-blur-md text-orange-450 border-orange-500/40';
    case 'D':
      return 'bg-slate-950/90 backdrop-blur-md text-red-400 border-red-500/40';
    default:
      return 'bg-slate-950/90 backdrop-blur-md text-green-400 border-green-500/40';
  }
};

interface CardItemProps {
  card: Card;
  collectionItem?: CollectionItem & { holdings?: CollectionItem[] };
  wishlistItem?: WishlistItem;
  currentPrice: number;
  onViewDetails: () => void;
  currencySymbol?: string;
  className?: string;
  preferSpecimenPhoto?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  collectionItem,
  wishlistItem,
  currentPrice,
  onViewDetails,
  currencySymbol = '$',
  className = '',
  preferSpecimenPhoto = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Holographic 3D Tilt Effect using motion/react
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 300, damping: 20 });
  
  // Holographic sheen positioning based on mouse position
  const sheenX = useTransform(x, [-100, 100], ['0%', '100%']);
  const sheenY = useTransform(y, [-100, 100], ['0%', '100%']);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Calculations
  const isWishlist = !!wishlistItem;
  const isOwned = !!collectionItem;
  
  const purchasePrice = collectionItem ? collectionItem.purchasePrice : 0;
  const qty = collectionItem ? collectionItem.quantity : 1;
  const totalCost = purchasePrice * qty;
  const totalValue = currentPrice * qty;
  
  const profitLoss = totalValue - totalCost;
  const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  const isProfit = profitLoss >= 0;

  // Collection ownership structural indicators
  const holdingsList = collectionItem?.holdings || (collectionItem ? [collectionItem] : []);
  const holdingsCount = holdingsList.length;
  const totalCopies = holdingsList.reduce((sum, h) => sum + (h.quantity || 1), 0);

  // Condition summary list
  const uniqueConditions = Array.from(new Set(holdingsList.map(h => {
    const q = h.quality || 'NM';
    return q === 'SP' ? 'LP' : q;
  })));
  const conditionSummary = uniqueConditions.join(' / ');

  // Grading summary list
  const uniqueGrades = Array.from(new Set(holdingsList.map(h => {
    if (h.gradeType && h.gradeType !== 'Raw') {
      return `${h.gradeType} ${h.gradeValue || ''}`.trim();
    }
    return 'Raw';
  })));
  const gradingSummary = uniqueGrades.join(' + ');

  // Specimen Visual status checks
  const hasPhotos = holdingsList.some(h => !!h.frontPhotoUrl || !!h.backPhotoUrl);
  const primarySpecimenPhoto = holdingsList.find(h => !!h.frontPhotoUrl)?.frontPhotoUrl || holdingsList.find(h => !!h.backPhotoUrl)?.backPhotoUrl;
  const imgToRender = (preferSpecimenPhoto && primarySpecimenPhoto) ? primarySpecimenPhoto : getOptimizedImageUrl(card.imageUrl, 260);

  const getRarityColor = (rarity: string) => {
    const r = rarity.toLowerCase();
    if (r.includes('illustration') || r.includes('spec')) return 'from-[#FFCB05] to-[#FF8008] border-[#FFCB05]/40';
    if (r.includes('secret') || r.includes('gold')) return 'from-amber-400 to-yellow-600 border-yellow-500/50';
    if (r.includes('vmax') || r.includes('star')) return 'from-purple-500 to-pink-600 border-purple-500/40';
    if (r.includes('holo') || r.includes('rare')) return 'from-blue-600 to-cyan-500 border-blue-500/30';
    return 'from-slate-600 to-slate-800 border-slate-700/60';
  };

  const languageInfo = LANGUAGE_METADATA[card.language] || { flag: '🌐', labelShort: card.language };

  return (
    <motion.div
      id={`card-container-${card.id}`}
      style={{
        perspective: 1000,
      }}
      className={`relative select-none ${className}`}
    >
      <motion.div
        id={`card-tilt-wrapper-${card.id}`}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onViewDetails}
        className="w-full h-full cursor-pointer rounded-2xl bg-[#1A1D24] border border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col justify-between"
      >
        {/* Shiny Holo Overlay effect */}
        {isHovered && (
          <motion.div
            id={`card-sheen-${card.id}`}
            style={{
              background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%), linear-gradient(135deg, rgba(255, 203, 5, 0.08) 0%, rgba(59, 76, 202, 0.08) 50%, rgba(255, 255, 255, 0.12) 100%)`,
            }}
            className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
          />
        )}

        {/* Card Header Media */}
        <div className="relative aspect-[3/4.1] w-full bg-[#111318] flex items-center justify-center p-2.5 overflow-hidden group">
          {/* Graded Frame Glow */}
          {isOwned && collectionItem?.gradeType !== 'Raw' && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500 z-10" />
          )}

          {/* Holographic light spots behind the card */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Actual Card image rendering */}
          {!imageError ? (
            <img
              src={imgToRender}
              alt={card.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            /* Backup Vector Card Artwork */
            <div className={`w-full h-full rounded-lg bg-gradient-to-b ${getRarityColor(card.rarity)} p-4 flex flex-col justify-between border relative overflow-hidden text-white`}>
              {/* Backlight background circles */}
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-black/30 blur-xl" />

              {/* Card name and category */}
              <div className="flex justify-between items-start gap-1">
                <span className="text-xs font-black tracking-tight leading-3 truncate max-w-[80%] uppercase text-yellow-100">
                  {card.name}
                </span>
                <span className="text-[9px] bg-black/40 px-1 py-0.5 rounded font-mono font-bold font-semibold shrink-0">
                  HP 160
                </span>
              </div>

              {/* Fancy Central Emblem */}
              <div className="flex-1 flex flex-col items-center justify-center relative my-1">
                <div className="w-16 h-16 rounded-full bg-slate-900/60 flex items-center justify-center border-2 border-yellow-400/30 shadow-inner group-hover:rotate-[30deg] transition-transform duration-700">
                  <Sparkles className="w-8 h-8 text-[#FFCB05] opacity-80" />
                </div>
                <span className="text-[8px] tracking-wide font-medium mt-1.5 opacity-70 font-mono">
                  HOLO SHEEN ACTIVE
                </span>
              </div>

              {/* Set & Serial info */}
              <div className="space-y-0.5 border-t border-white/10 pt-1.5 font-mono text-[8px] opacity-80 flex justify-between items-end">
                <div className="truncate max-w-[60%]">
                  <span className="block font-bold truncate">{card.set}</span>
                  <span className="opacity-80 block">{card.number}</span>
                </div>
                <span className="bg-white/10 px-1 rounded uppercase font-bold text-[7px]" style={{ fontSize: '7px' }}>
                  {card.rarity.replace('Illustration', 'Illust')}
                </span>
              </div>
            </div>
          )}

          {/* Badges on card */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-20">
            {/* Left Pill Cluster: Language & Condition */}
            <div className="flex items-center gap-1">
              {/* Language Badge */}
              <span className="bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-slate-700/60 flex items-center gap-1 text-slate-200 shadow-md font-sans">
                <span>{languageInfo.flag}</span>
                <span className="font-mono tracking-wide">{card.language}</span>
              </span>

              {/* Condition Badge (only if owned) */}
              {isOwned && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border shadow-md font-mono ${getConditionStyle(collectionItem?.quality || 'NM')}`}>
                  {collectionItem?.quality === 'SP' ? 'LP' : (collectionItem?.quality || 'NM')}
                </span>
              )}

              {/* Camera Badge (only if owned and contains specimen photographs) */}
              {isOwned && hasPhotos && (
                <span className="bg-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded-md text-[8px] border border-orange-400 shadow-md flex items-center justify-center shrink-0" title="Physical Specimen Photo Available">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            {/* Right Pill: Grade Status or Priority */}
            <div>
              {isOwned ? (
                collectionItem?.gradeType !== 'Raw' ? (
                  <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-md text-[9px] tracking-wide uppercase border border-amber-300 shadow-md flex items-center gap-0.5 animate-pulse">
                    <Shield className="w-2.5 h-2.5" fill="currentColor" />
                    <span>{collectionItem.gradeType} {collectionItem.gradeValue}</span>
                  </span>
                ) : (
                  <span className="bg-slate-800/90 backdrop-blur-sm text-slate-200 font-bold px-1.5 py-0.5 rounded-md text-[8px] tracking-wider uppercase border border-slate-700/60 shadow-md">
                    RAW
                  </span>
                )
              ) : isWishlist ? (
                <span className={`text-white font-mono font-bold px-1.5 py-0.5 rounded-md text-[8px] tracking-wide uppercase border shadow-md ${
                  wishlistItem.priority === 'High' 
                    ? 'bg-red-600/90 border-red-500' 
                    : wishlistItem.priority === 'Medium'
                    ? 'bg-amber-500/90 border-amber-400 text-slate-950'
                    : 'bg-emerald-600/90 border-emerald-500'
                }`}>
                  {wishlistItem.priority} PRIO
                </span>
              ) : null}
            </div>
          </div>

          {/* Holographic sparkle icon */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 p-1 rounded-full border border-slate-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hover:scale-110 active:scale-90">
            <Sparkles className="w-3.5 h-3.5 text-[#FFCB05]" />
          </div>
        </div>

        {/* Card Metadata / Financial Panel */}
        <div className="p-3.5 border-t border-slate-800 bg-[#15181F] flex-1 flex flex-col justify-between">
          <div>
            {/* Title / Set details */}
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-[#FFCB05] transition-colors line-clamp-1">
              {card.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {card.set} • {card.number}
            </p>

            {/* Ownership Summary Badge / Metrics Grid */}
            {isOwned && (
              <div id={`ownership-summary-${card.id}`} className="mt-2.5 p-2 bg-[#0F1115]/60 hover:bg-[#0F1115]/95 rounded-xl border border-slate-800/80 transition-colors flex flex-col gap-1 text-[10px] font-mono">
                {/* Number of Owned Copies & Holdings */}
                <div className="flex justify-between items-center text-slate-200">
                  <span className="flex items-center gap-1.5 font-bold text-slate-100 font-sans">
                    <CreditCard className="w-3.5 h-3.5 text-[#FFCB05]" />
                    <span>{totalCopies === 1 ? '1 Copy' : `${totalCopies} Copies`}</span>
                  </span>
                  <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 font-semibold px-2 py-0.5 rounded-lg shrink-0">
                    {holdingsCount === 1 ? '1 Holding' : `${holdingsCount} Holdings`}
                  </span>
                </div>

                {/* Condition & Grading Summary */}
                <div className="flex justify-between items-center text-slate-500 font-medium text-[9px] mt-1 pt-1.5 border-t border-slate-850/80">
                  <span className="truncate max-w-[95px] text-left" title={`Condition Summary: ${conditionSummary}`}>
                    ❇️ {conditionSummary || 'Raw'}
                  </span>
                  <span className="truncate max-w-[110px] text-right font-semibold text-amber-500/90" title={`Grading Summary: ${gradingSummary}`}>
                    🛡️ {gradingSummary || 'Raw'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial Section */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col gap-2">
            {isOwned ? (
              /* Ownership Financial stats */
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">EST. VALUE</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-white font-mono">
                      {currencySymbol}{totalValue.toLocaleString()}
                    </span>
                    {qty > 1 && (
                      <span className="text-[10px] text-slate-400">
                        ({qty}x)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">VALUE GROWTH</span>
                  <div className={`flex items-center justify-end text-xs font-bold font-mono mt-0.5 gap-0.5 ${
                    isProfit ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>
                      {isProfit ? '+' : ''}{profitLoss >= 0 ? `${currencySymbol}${Math.round(profitLoss).toLocaleString()}` : `-${currencySymbol}${Math.abs(Math.round(profitLoss)).toLocaleString()}`}
                    </span>
                    <span className="text-[9px] px-1 bg-slate-900 border border-slate-800 rounded font-bold ml-1">
                      {isProfit ? '+' : ''}{roi.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : isWishlist ? (
              /* Wishlist targets */
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">TARGET PRICE</span>
                  <span className="text-slate-100 text-sm font-bold block font-mono mt-0.5">
                    {currencySymbol}{wishlistItem.desiredPrice}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">MARKET VALUE</span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-sm text-yellow-500 font-bold">
                      {currencySymbol}{currentPrice}
                    </span>
                    <span className={`text-[10px] px-1.5 rounded font-bold ${
                      currentPrice <= wishlistItem.desiredPrice
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {currentPrice <= wishlistItem.desiredPrice ? 'BUY TARGET' : `+${Math.round(((currentPrice - wishlistItem.desiredPrice) / wishlistItem.desiredPrice) * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simple Card Market Price */
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">CURRENT VALUE</span>
                  <span className="text-yellow-400 text-sm font-bold tracking-tight block font-mono mt-0.5">
                    {currencySymbol}{currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">RARITY CATEGORY</span>
                  <span className="text-[10px] text-slate-300 font-medium block mt-1.5 truncate max-w-[120px]">
                    {card.rarity}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
