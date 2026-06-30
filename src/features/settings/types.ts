/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Binder, PriceNotification, CollectionItem, WishlistItem, Card } from '../../types';

export interface SettingsTabProps {
  binders: Binder[];
  onAddBinder: (name: string, description?: string) => void;
  onDeleteBinder: (binderId: string) => void;
  onResetCollection: (type: 'seed' | 'empty') => void;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  priceNotifications: PriceNotification[];
  onMarkNotificationRead: (notifId: string) => void;
  preferSpecimenPhoto?: boolean;
  onTogglePreferSpecimenPhoto?: (value: boolean) => void;
  userEmail: string;
  onSignOut?: () => void;
  collectionItems?: CollectionItem[];
  wishlistItems?: WishlistItem[];
  cards?: Card[];
  onDeleteAccount?: () => void;
}

export type SubTabId = 'profile' | 'preferences' | 'account';
export type SettingsSubTabId = SubTabId;

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export type SettingsConfirmModalState = ConfirmModalState;
