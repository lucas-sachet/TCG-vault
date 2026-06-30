import type { Card, CollectionItem, WishlistItem, PriceSnapshot, Binder, CardQuality } from '../../types';

export type GradeType = 'Raw' | 'PSA' | 'CGC' | 'BGS';

export interface PurchaseDetailsUpdate {
  purchasePrice?: number;
  purchaseDate?: string;
  gradeType?: GradeType;
  gradeValue?: string | number;
  certNumber?: string;
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
  onUpdateCollectionItemPurchaseDetails?: (itemId: string, updates: PurchaseDetailsUpdate) => void;
  focusedHoldingId?: string | null;
  onRemoveFromSlot?: (holdingId: string) => void;
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
  onUpdatePurchaseDetails?: (itemId: string, updates: PurchaseDetailsUpdate) => void;
  currencySymbol: string;
  setConfirmModal?: (config: ConfirmModalConfig) => void;
}

export interface CarouselImage {
  id: string;
  url: string;
  label: string;
  isSpecimen: boolean;
  copyNum?: number;
  condition?: string;
  grade?: string;
}

export type JourneyEventType =
  | 'purchased'
  | 'additional_copy'
  | 'sent_grading'
  | 'grade_received'
  | 'price_milestone'
  | 'portfolio_milestone'
  | 'notes';

export type JourneyBadgeType = 'success' | 'warning' | 'info' | 'primary';

export interface JourneyTimelineEvent {
  type: JourneyEventType;
  date: string;
  title: string;
  description: string;
  badge: string;
  badgeType: JourneyBadgeType;
}

export interface SparklinePoint {
  x: number;
  y: number;
  price: number;
  date: string;
}

export interface SparklinePointWithEvents extends SparklinePoint {
  events: JourneyTimelineEvent[];
}
