/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { isMvpFeatureEnabled } from '../config/mvpFeatures';
import type { CardDetailsModalProps, ConfirmModalConfig } from '../features/card-details';
import {
  useCardCarouselImages,
  useCardJourneyTimeline,
  useCardPriceChart,
  CardDetailsModalShell,
  CardDetailsImageCarousel,
  CardDetailsOverview,
  CardDetailsPriceChart,
  CardDetailsPriceAlerts,
  CardDetailsHoldingsSection,
  CardDetailsJourneyPanel,
  CardDetailsActivityLog
} from '../features/card-details';

export type { CardDetailsModalProps } from '../features/card-details';

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  isOpen,
  cardId,
  cards,
  collectionItems,
  wishlistItems,
  marketPrices,
  priceHistories,
  binders,
  onClose,
  onDeleteCollectionItem,
  onDeleteWishlistItem,
  onUpdateCollectionItemBinder,
  onUpdateCollectionItemNotes,
  currencySymbol = '$',
  priceAlerts = {},
  onUpdatePriceAlert,
  onUpdateCollectionItemQuality,
  onUpdateCollectionItemPhotos,
  onUpdateCollectionItemPurchaseDetails,
  focusedHoldingId = null,
  onRemoveFromSlot,
}) => {
  const [imageError] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(100);

  const card = cards.find((catalogCard) => catalogCard.id === cardId);
  const allCardHoldings = collectionItems.filter((item) => item.cardId === cardId);
  const cardHoldings = useMemo(() => {
    if (focusedHoldingId) {
      const focused = collectionItems.find((item) => item.id === focusedHoldingId);
      return focused ? [focused] : allCardHoldings;
    }
    return allCardHoldings;
  }, [collectionItems, focusedHoldingId, allCardHoldings, cardId]);

  const wishlistItem = wishlistItems.find((item) => item.cardId === cardId);
  const currentPrice = cardId ? (marketPrices[cardId] || 0) : 0;
  const historySeries = cardId ? (priceHistories[cardId] || []) : [];

  const { carouselImages, activeImageIdx, setActiveImageIdx } = useCardCarouselImages({
    card,
    cardHoldings,
    cardId
  });

  useEffect(() => {
    if (cardId && isMvpFeatureEnabled('priceAlerts')) {
      const alertConfig = priceAlerts[cardId] || {
        enabled: false,
        targetPrice: marketPrices[cardId] || 100
      };
      setAlertEnabled(alertConfig.enabled);
      setAlertThreshold(alertConfig.targetPrice || marketPrices[cardId] || 100);
    }
  }, [cardId, priceAlerts, marketPrices]);

  const isOwned = cardHoldings.length > 0;
  const isWishlist = Boolean(wishlistItem);

  const totalHoldingsQty = cardHoldings.reduce((sum, holding) => sum + holding.quantity, 0);
  const totalCost = cardHoldings.reduce(
    (sum, holding) => sum + holding.purchasePrice * holding.quantity,
    0
  );
  const averageCostBasis = totalHoldingsQty > 0 ? totalCost / totalHoldingsQty : 0;
  const totalValue = currentPrice * totalHoldingsQty;
  const profitLoss = totalValue - totalCost;
  const returnOnInvestment = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  const isProfit = profitLoss >= 0;

  const collectionItem = cardHoldings[0];
  const purchasePrice = focusedHoldingId && collectionItem
    ? collectionItem.purchasePrice
    : averageCostBasis;
  const quantity = focusedHoldingId ? 1 : totalHoldingsQty;

  const journeyTimeline = useCardJourneyTimeline({
    card,
    cardHoldings,
    isOwned,
    isWishlist,
    wishlistItem,
    historySeries,
    averageCostBasis,
    totalValue,
    totalHoldingsQty,
    currencySymbol
  });

  const priceChart = useCardPriceChart({
    historySeries,
    currentPrice,
    journeyTimeline
  });

  const handleToggleAlert = (checked: boolean) => {
    setAlertEnabled(checked);
    if (onUpdatePriceAlert && card) {
      onUpdatePriceAlert(card.id, checked, alertThreshold);
    }
  };

  const handleThresholdChange = (value: number) => {
    setAlertThreshold(value);
    if (onUpdatePriceAlert && card) {
      onUpdatePriceAlert(card.id, alertEnabled, value);
    }
  };

  if (!card) {
    return null;
  }

  const showPortfolioMetrics = isMvpFeatureEnabled('portfolioMetrics');

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <CardDetailsModalShell
            card={card}
            cardHoldings={cardHoldings}
            isOwned={isOwned}
            isWishlist={isWishlist}
            wishlistItemId={wishlistItem?.id}
            onClose={onClose}
            onDeleteAllCopies={() => {
              setConfirmModal({
                isOpen: true,
                title: focusedHoldingId ? 'Remove this holding?' : 'Erase All Copies?',
                description: focusedHoldingId
                  ? `Remove this copy of "${card.name}" from your collection?`
                  : `Remove all ${cardHoldings.length} physical copies of "${card.name}" from your collection vault permanently?`,
                confirmText: focusedHoldingId ? 'REMOVE' : 'YES, ERASE ALL',
                cancelText: 'Keep',
                type: 'danger',
                onConfirm: () => {
                  if (focusedHoldingId) {
                    onRemoveFromSlot?.(focusedHoldingId);
                    onDeleteCollectionItem(focusedHoldingId);
                  } else {
                    cardHoldings.forEach((holding) => onDeleteCollectionItem(holding.id));
                  }
                  onClose();
                }
              });
            }}
            onDeleteWishlistItem={() => {
              if (wishlistItem) {
                onDeleteWishlistItem(wishlistItem.id);
                onClose();
              }
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
              <CardDetailsImageCarousel
                card={card}
                carouselImages={carouselImages}
                activeImageIdx={activeImageIdx}
                onActiveImageChange={setActiveImageIdx}
                isOwned={isOwned}
                collectionItem={collectionItem}
              />
              <CardDetailsOverview
                card={card}
                currencySymbol={currencySymbol}
                currentPrice={currentPrice}
                isOwned={isOwned}
                isWishlist={isWishlist}
                wishlistItem={wishlistItem}
                purchasePrice={purchasePrice}
                qty={quantity}
                profitLoss={profitLoss}
                roi={returnOnInvestment}
                isProfit={isProfit}
                showPortfolioMetrics={showPortfolioMetrics}
              />
            </div>

            {isMvpFeatureEnabled('priceChart') && (
              <CardDetailsPriceChart
                historySeries={historySeries}
                currencySymbol={currencySymbol}
                chartWidth={priceChart.chartWidth}
                chartHeight={priceChart.chartHeight}
                chartPadding={priceChart.chartPadding}
                minPriceInHistory={priceChart.minPriceInHistory}
                maxPriceInHistory={priceChart.maxPriceInHistory}
                sparklinePoints={priceChart.sparklinePoints}
                sparklineD={priceChart.sparklineD}
                areaD={priceChart.areaD}
                pointsWithEvents={priceChart.pointsWithEvents}
                hoveredPointIndex={priceChart.hoveredPointIndex}
                onMouseMove={priceChart.handleMouseMove}
                onMouseLeave={priceChart.handleMouseLeave}
              />
            )}

            {isOwned && (
              <CardDetailsHoldingsSection
                card={card}
                cardHoldings={cardHoldings}
                binders={binders}
                currentPrice={currentPrice}
                currencySymbol={currencySymbol}
                totalHoldingsQty={totalHoldingsQty}
                averageCostBasis={averageCostBasis}
                totalValue={totalValue}
                profitLoss={profitLoss}
                roi={returnOnInvestment}
                onDeleteCollectionItem={onDeleteCollectionItem}
                onUpdateCollectionItemNotes={onUpdateCollectionItemNotes}
                onUpdateCollectionItemBinder={onUpdateCollectionItemBinder}
                onUpdateCollectionItemQuality={onUpdateCollectionItemQuality}
                onUpdateCollectionItemPhotos={onUpdateCollectionItemPhotos}
                onUpdateCollectionItemPurchaseDetails={onUpdateCollectionItemPurchaseDetails}
                setConfirmModal={setConfirmModal}
              />
            )}

            {isMvpFeatureEnabled('journeyPanel') && (
              <CardDetailsJourneyPanel
                card={card}
                journeyTimeline={journeyTimeline}
                imageError={imageError}
              />
            )}

            {isMvpFeatureEnabled('priceAlerts') && (
              <CardDetailsPriceAlerts
                currencySymbol={currencySymbol}
                alertEnabled={alertEnabled}
                alertThreshold={alertThreshold}
                onToggleAlert={handleToggleAlert}
                onThresholdChange={handleThresholdChange}
              />
            )}

            {isMvpFeatureEnabled('activityLog') && (
              <CardDetailsActivityLog
                isOwned={isOwned}
                isWishlist={isWishlist}
                collectionItem={collectionItem}
                wishlistItem={wishlistItem}
                currencySymbol={currencySymbol}
                qty={quantity}
                purchasePrice={purchasePrice}
                totalCost={totalCost}
              />
            )}
          </CardDetailsModalShell>
        )}
      </AnimatePresence>

      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </>
  );
};
