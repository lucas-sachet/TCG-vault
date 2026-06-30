import React from 'react';
import { motion } from 'motion/react';
import { HeartCrack, Trash2, X } from 'lucide-react';
import type { Card, CollectionItem } from '../../types';

interface CardDetailsModalShellProps {
  card: Card;
  cardHoldings: CollectionItem[];
  isOwned: boolean;
  isWishlist: boolean;
  wishlistItemId: string | undefined;
  onClose: () => void;
  onDeleteAllCopies: () => void;
  onDeleteWishlistItem: () => void;
  children: React.ReactNode;
}

export const CardDetailsModalShell: React.FC<CardDetailsModalShellProps> = ({
  card,
  cardHoldings,
  isOwned,
  isWishlist,
  wishlistItemId,
  onClose,
  onDeleteAllCopies,
  onDeleteWishlistItem,
  children
}) => (
  <div id="card-details-screen-overlay" className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-[#090b0e]"
    />

    <motion.div
      initial={{ y: '100%', opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0.5 }}
      transition={{ type: 'spring', damping: 26, stiffness: 210 }}
      className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[95vh] bg-[#12141C] border-t md:border border-slate-800 rounded-t-3xl md:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl z-50"
    >
      <div className="p-4 border-b border-slate-800/80 bg-[#161923]/80 backdrop-blur-md flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[#FFCB05] font-black font-mono">
            {card.language} EDITION
          </span>
          <span className="text-[10px] text-slate-400 font-mono">ID: {card.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {isOwned && (
            <button
              id="delete-owned-item-btn"
              onClick={onDeleteAllCopies}
              className="p-2 text-red-400 hover:text-white bg-red-950/20 hover:bg-red-900/60 rounded-xl transition-all"
              title="Delete entire card from collection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {isWishlist && wishlistItemId && (
            <button
              id="delete-wishlist-item-btn"
              onClick={onDeleteWishlistItem}
              className="p-2 text-red-500 hover:text-white bg-slate-900 rounded-xl transition-all"
              title="Remove from Wishlist"
            >
              <HeartCrack className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl text-center"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {children}
      </div>

      <div className="p-4 bg-[#14161F] border-t border-slate-850 flex gap-2 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#3B4CCA] hover:bg-blue-600 font-black text-xs text-white uppercase tracking-widest rounded-xl transition-all"
        >
          Done view
        </button>
      </div>
    </motion.div>
  </div>
);
