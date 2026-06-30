/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Card, CollectionItem, WishlistItem } from '../../types';
import type { ConfirmModalState } from './types';

interface ExportHandlersDeps {
  userEmail: string;
  collectionItems: CollectionItem[];
  wishlistItems: WishlistItem[];
  cards: Card[];
  setSuccessBanner: (message: string) => void;
  setErrorBanner: (message: string | null) => void;
  setConfirmModal: (modal: ConfirmModalState | null) => void;
  onDeleteAccount?: () => void;
}

export function createSettingsExportHandlers(deps: ExportHandlersDeps) {
  const {
    userEmail,
    collectionItems,
    wishlistItems,
    cards,
    setSuccessBanner,
    setErrorBanner,
    setConfirmModal,
    onDeleteAccount,
  } = deps;

  function handleExportCollectionCSV() {
    if (!collectionItems || collectionItems.length === 0) {
      setErrorBanner('Export failed: Your collection catalog is currently empty.');
      return;
    }

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Item ID,Card Name,Set,Number,Rarity,Purchase Date,Purchase Price,Currency,Quantity,Grade Type,Grade Value,Cert Number,Notes\r\n';

      collectionItems.forEach(item => {
        const card = cards.find(cardEntry => cardEntry.id === item.cardId);
        const cardName = card ? `"${card.name.replace(/"/g, '""')}"` : 'Unknown Pokémon';
        const cardSet = card ? `"${card.set.replace(/"/g, '""')}"` : 'Unknown Set';
        const cardNum = card ? `"${card.number}"` : '';
        const cardRarity = card ? `"${card.rarity}"` : '';
        const purchaseDate = item.purchaseDate || '';
        const purchasePrice = item.purchasePrice || 0;
        const currency = item.currency || 'USD';
        const quantity = item.quantity || 1;
        const gradeType = item.gradeType || 'Raw';
        const gradeValue = item.gradeValue || 'Raw';
        const certNumber = item.certNumber || '';
        const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';

        csvContent += `${item.id},${cardName},${cardSet},${cardNum},${cardRarity},${purchaseDate},${purchasePrice},${currency},${quantity},${gradeType},${gradeValue},${certNumber},${notes}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pokevault_holdings_export_${userEmail.replace(/[@.]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessBanner('Collection ledger exported cleanly to CSV!');
    } catch {
      setErrorBanner('An unexpected error occurred during document formulation.');
    }
  }

  async function handleExportFullDataJson() {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Full data export failed');
      }

      const exportPayload = await response.json();
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `pokevault_full_export_${userEmail.replace(/[@.]/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      setSuccessBanner('Full LGPD data package exported successfully.');
    } catch {
      setErrorBanner('Unable to export full account data package.');
    }
  }

  function handleExportWishlistCSV() {
    if (!wishlistItems || wishlistItems.length === 0) {
      setErrorBanner('Export failed: Your wishlist catalog is currently empty.');
      return;
    }

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Wishlist ID,Card Name,Set,Number,Rarity,Desired Price,Priority,Notes,Date Added\r\n';

      wishlistItems.forEach(item => {
        const card = cards.find(cardEntry => cardEntry.id === item.cardId);
        const cardName = card ? `"${card.name.replace(/"/g, '""')}"` : 'Unknown Pokémon';
        const cardSet = card ? `"${card.set.replace(/"/g, '""')}"` : 'Unknown Set';
        const cardNum = card ? `"${card.number}"` : '';
        const cardRarity = card ? `"${card.rarity}"` : '';
        const desiredPrice = item.desiredPrice || 0;
        const priority = item.priority || 'Medium';
        const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';
        const dateAdded = '';

        csvContent += `${item.id},${cardName},${cardSet},${cardNum},${cardRarity},${desiredPrice},${priority},${notes},${dateAdded}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pokevault_wishlist_export_${userEmail.replace(/[@.]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessBanner('Wishlist database exported cleanly to CSV!');
    } catch {
      setErrorBanner('An unexpected error occurred during document formulation.');
    }
  }

  function handleDeleteAccountAction() {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ CRITICAL: PERMANENT ACCOUNT ERASURE',
      description: `You are about to purge and delete all workspace parameters, secure metadata, files, binders, custom collections, and wishlist items tied to ${userEmail}. This operation is completely automated, irreversible and immediate. Secure authentication codes will be destroyed. Do you wish to proceed?`,
      confirmText: 'YES, ERASE PROFILE FOREVER',
      cancelText: 'ABORT AND REMAIN',
      type: 'danger',
      onConfirm: () => {
        if (onDeleteAccount) {
          onDeleteAccount();
        }
      },
    });
  }

  return {
    handleExportCollectionCSV,
    handleExportFullDataJson,
    handleExportWishlistCSV,
    handleDeleteAccountAction,
  };
}
