import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readLines(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8').split('\n');
}

function write(relativePath, content) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Wrote ${relativePath} (${content.split('\n').length} lines)`);
}

const cardModalLines = readLines('src/components/CardDetailsModal.tsx');

const holdingBody = cardModalLines.slice(95, 671).join('\n');

write(
  'src/features/card-details/cardDetailsTypes.ts',
  `import type { Card, CollectionItem, WishlistItem, PriceSnapshot, Binder, CardQuality } from '@/src/types';

export interface CardDetailsModalProps {
  isOpen: boolean;
  cardId: string | null;
  cards: Card[];
  collectionItems: CollectionItem[];
  wishlistItems: WishlistItem[];
  marketPrices: Record<string, number>;
  priceHistories: Record<string, PriceSnapshot[]>;
  binders: Binder[];
  onClose: () => void;
  onDeleteCollectionItem: (itemId: string) => void;
  onDeleteWishlistItem: (wishId: string) => void;
  onUpdateCollectionItemBinder: (itemId: string, binderId: string) => void;
  onUpdateCollectionItemNotes: (itemId: string, notes: string) => void;
  currencySymbol?: string;
  priceAlerts?: Record<string, { enabled: boolean; targetPrice: number }>;
  onUpdatePriceAlert?: (cardId: string, enabled: boolean, targetPrice: number) => void;
  onUpdateCollectionItemQuality?: (itemId: string, quality: CardQuality) => void;
  onUpdateCollectionItemPhotos?: (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => void;
  onUpdateCollectionItemPurchaseDetails?: (
    itemId: string,
    updates: {
      purchasePrice?: number;
      purchaseDate?: string;
      gradeType?: 'Raw' | 'PSA' | 'CGC' | 'BGS';
      gradeValue?: string | number;
      certNumber?: string;
    }
  ) => void;
}

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export interface HoldingItemProps {
  holding: CollectionItem;
  card: Card;
  currentPrice: number;
  binders: Binder[];
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateBinder: (id: string, binderId: string) => void;
  onUpdateQuality?: (id: string, quality: CardQuality) => void;
  onUpdatePhotos?: (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => void;
  onUpdatePurchaseDetails?: (
    itemId: string,
    updates: {
      purchasePrice?: number;
      purchaseDate?: string;
      gradeType?: 'Raw' | 'PSA' | 'CGC' | 'BGS';
      gradeValue?: string | number;
      certNumber?: string;
    }
  ) => void;
  currencySymbol: string;
  setConfirmModal?: (config: ConfirmModalConfig | null) => void;
}
`,
);

write(
  'src/features/card-details/HoldingItem.tsx',
  `'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Camera, Loader2 } from 'lucide-react';
import { CardQuality } from '@/src/types';
import { QUALITY_METADATA } from '@/src/data/pokemonData';
import { supabase } from '@/src/services/supabaseClient';
import { uploadImageIfBase64 } from '@/src/services/imageUpload.service';
import { getOptimizedImageUrl } from '@/src/utils/imageOptimizer';
import type { HoldingItemProps } from './cardDetailsTypes';

export const HoldingItem: React.FC<HoldingItemProps> = (${holdingBody.replace('const HoldingItem: React.FC<HoldingItemProps> = (', '').replace(/^}\) => \{/, '}) => {').split('\n').slice(1).join('\n')}`,
);

console.log('Done card-details partial extract');
