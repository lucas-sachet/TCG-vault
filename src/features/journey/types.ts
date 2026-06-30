/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LucideIcon } from 'lucide-react';
import type { Card, CollectionItem, Binder, PriceSnapshot } from '../../types';

export interface JourneyTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  priceHistories: Record<string, PriceSnapshot[]>;
  binders: Binder[];
  onViewCardDetails: (cardId: string) => void;
  currencySymbol?: string;
  userEmail?: string;
}

export type JourneyEventType =
  | 'acquired' | 'additional_copy' | 'grading_submitted' | 'grade_received'
  | 'price_milestone' | 'personal_note' | 'photo_added' | 'binder_moved';

export interface JourneyEventMeta {
  notes?: string;
  photoFront?: string;
  photoBack?: string;
  binderName?: string;
  oldPrice?: number;
  newPrice?: number;
  gradeType?: string;
  gradeValue?: string | number;
  certNumber?: string;
}

export interface JourneyEvent {
  id: string;
  holdingId: string;
  cardId: string;
  card: Card;
  date: string;
  type: JourneyEventType;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
  holding: CollectionItem;
  meta?: JourneyEventMeta;
}

export type CinematicSlideType =
  | 'cover' | 'first' | 'high_value' | 'graded_gems' | 'best_note' | 'biggest_gainer' | 'compilation_flow';

export interface CinematicSlideStats {
  trainerName: string;
  trainerAvatar: string;
  cardCount: number;
  bindersCount: number;
  growthPct: number;
  financialGain: number;
  totalWorth: number;
}

export interface CinematicSlide {
  type: CinematicSlideType;
  title: string;
  subtitle: string;
  narrative: string;
  card?: Card;
  holding?: CollectionItem;
  stats?: CinematicSlideStats;
}

export interface ZoomedImageState { url: string; title: string; }
export type JourneyViewMode = 'timeline' | 'cinema';
