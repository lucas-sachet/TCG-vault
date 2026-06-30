/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { findDefaultBinder } from '../../constants/defaultBinder';
import type { BindersTabProps } from './types';
import { BinderListPanel } from './BinderListPanel';
import { BinderPageView } from './BinderPageView';
import { UnslottedHoldingsPanel } from './UnslottedHoldingsPanel';
import { BinderEmptyState } from './BinderEmptyState';
import { SlotPickerModal } from './SlotPickerModal';
import { CoverCardPickerModal } from './CoverCardPickerModal';
import { filterUnslottedHoldings } from './binderStats';

export function BindersTabContent({
  cards,
  collectionItems,
  marketPrices,
  binders,
  binderSlots,
  selectedBinderId,
  onSelectBinder,
  onAddBinder,
  onUpdateBinder,
  onDeleteBinder,
  onViewHolding,
  onOpenAddModal,
  currencySymbol = '$',
  getSlotHoldingId,
  getSlottedHoldingIds,
  getBinderPageCount,
  assignHoldingToSlot,
  clearSlot,
  moveHoldingBetweenSlots,
}: BindersTabProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [slotPickTarget, setSlotPickTarget] = useState<{ page: number; slot: number } | null>(null);
  const [showAllUnslotted, setShowAllUnslotted] = useState(false);
  const [coverPickerBinderId, setCoverPickerBinderId] = useState<string | null>(null);

  const slottedIds = getSlottedHoldingIds();
  const unslottedHoldings = useMemo(
    () =>
      selectedBinderId
        ? filterUnslottedHoldings(
            collectionItems,
            slottedIds,
            selectedBinderId,
            showAllUnslotted,
          )
        : [],
    [collectionItems, slottedIds, selectedBinderId, showAllUnslotted],
  );

  const selectedBinder = binders.find((binder) => binder.id === selectedBinderId) ?? null;
  const pageCount = selectedBinderId ? getBinderPageCount(selectedBinderId) : 1;
  const defaultBinderName = findDefaultBinder(binders)?.name ?? 'Main Collection';

  const coverPickerHoldings = useMemo(() => {
    if (!coverPickerBinderId) {
      return [];
    }
    const slottedInBinder = new Set(
      binderSlots
        .filter(
          (slot) => slot.binderId === coverPickerBinderId && slot.collectionItemId !== null,
        )
        .map((slot) => slot.collectionItemId as string),
    );
    return collectionItems.filter(
      (item) =>
        slottedInBinder.has(item.id)
        || item.binderId === coverPickerBinderId,
    );
  }, [coverPickerBinderId, binderSlots, collectionItems]);

  useEffect(() => {
    setCurrentPage(0);
    setShowAllUnslotted(false);
  }, [selectedBinderId]);

  useEffect(() => {
    if (binders.length > 0 && !selectedBinderId) {
      onSelectBinder(binders[0].id);
    }
  }, [binders, selectedBinderId, onSelectBinder]);

  function handleAddBinder(name: string, description?: string): string {
    const binderId = onAddBinder(name, description);
    onSelectBinder(binderId);
    return binderId;
  }

  function handleCreateFirstBinder() {
    handleAddBinder('My First Binder');
  }

  if (binders.length === 0) {
    return (
      <BinderEmptyState
        onCreateBinder={handleCreateFirstBinder}
        onOpenAddModal={onOpenAddModal}
      />
    );
  }

  if (!selectedBinder || !selectedBinderId) {
    return null;
  }

  const coverPickerBinder = binders.find((binder) => binder.id === coverPickerBinderId);

  return (
    <div className="animate-fadeIn space-y-6 pb-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <BinderListPanel
          binders={binders}
          binderSlots={binderSlots}
          cards={cards}
          selectedBinderId={selectedBinderId}
          defaultBinderName={defaultBinderName}
          onSelectBinder={onSelectBinder}
          onAddBinder={handleAddBinder}
          onUpdateBinder={onUpdateBinder}
          onDeleteBinder={(binderId) => {
            onDeleteBinder(binderId);
            const defaultBinder = binders.find((binder) => binder.isDefault);
            if (defaultBinder && defaultBinder.id !== binderId) {
              onSelectBinder(defaultBinder.id);
              return;
            }
            const remaining = binders.filter((binder) => binder.id !== binderId);
            if (remaining[0]) {
              onSelectBinder(remaining[0].id);
            }
          }}
          onOpenCoverPicker={setCoverPickerBinderId}
        />

        <BinderPageView
          binderId={selectedBinderId}
          binderName={selectedBinder.name}
          binderSlots={binderSlots}
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          getSlotHoldingId={(pageNumber, slotNumber) =>
            getSlotHoldingId(selectedBinderId, pageNumber, slotNumber)
          }
          collectionItems={collectionItems}
          cards={cards}
          marketPrices={marketPrices}
          currencySymbol={currencySymbol}
          onAssignHolding={(pageNumber, slotNumber, holdingId) =>
            assignHoldingToSlot(selectedBinderId, pageNumber, slotNumber, holdingId)
          }
          onMoveHolding={(sourcePage, sourceSlot, targetPage, targetSlot) =>
            moveHoldingBetweenSlots(
              selectedBinderId,
              sourcePage,
              sourceSlot,
              selectedBinderId,
              targetPage,
              targetSlot,
            )
          }
          onViewHolding={onViewHolding}
          onRequestSlotPick={(page, slot) => setSlotPickTarget({ page, slot })}
          onClearPocket={(page, slot) => void clearSlot(selectedBinderId, page, slot)}
          onRequestReplaceHolding={(page, slot) => setSlotPickTarget({ page, slot })}
        />
      </div>

      <UnslottedHoldingsPanel
        holdings={unslottedHoldings}
        cards={cards}
        showAllUnslotted={showAllUnslotted}
        onToggleShowAll={() => setShowAllUnslotted((previous) => !previous)}
        onDragHolding={(event, holdingId) => {
          event.dataTransfer.setData('text/holding-id', holdingId);
          event.dataTransfer.setData('text/source-binder-id', 'pool');
        }}
        onSelectHolding={onViewHolding}
        onDropHoldingFromSlot={(holdingId, binderId, pageNumber, slotNumber) => {
          void clearSlot(binderId, pageNumber, slotNumber);
        }}
      />

      <SlotPickerModal
        isOpen={slotPickTarget !== null}
        holdings={unslottedHoldings}
        cards={cards}
        onClose={() => setSlotPickTarget(null)}
        onSelectHolding={(holdingId) => {
          if (!slotPickTarget || !selectedBinderId) return;
          assignHoldingToSlot(
            selectedBinderId,
            slotPickTarget.page,
            slotPickTarget.slot,
            holdingId,
          );
          setSlotPickTarget(null);
        }}
      />

      <CoverCardPickerModal
        isOpen={coverPickerBinderId !== null}
        holdings={coverPickerHoldings}
        cards={cards}
        currentCoverCardId={coverPickerBinder?.coverCardId}
        onClose={() => setCoverPickerBinderId(null)}
        onSelectCover={(cardId) => {
          if (coverPickerBinderId) {
            onUpdateBinder(coverPickerBinderId, { coverCardId: cardId });
          }
        }}
        onClearCover={() => {
          if (coverPickerBinderId) {
            onUpdateBinder(coverPickerBinderId, { coverCardId: null });
          }
        }}
      />
    </div>
  );
}
