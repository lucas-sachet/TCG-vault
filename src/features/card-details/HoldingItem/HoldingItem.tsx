import React from 'react';
import type { HoldingItemProps } from '../cardDetailsTypes';
import { useHoldingItemState } from './useHoldingItemState';
import { HoldingItemHeader } from './HoldingItemHeader';
import { HoldingItemDetailsGrid } from './HoldingItemDetailsGrid';
import { HoldingItemEditDetails } from './HoldingItemEditDetails';
import { HoldingItemNotesBinder } from './HoldingItemNotesBinder';
import { HoldingItemPhotos } from './HoldingItemPhotos';

export const HoldingItem: React.FC<HoldingItemProps> = ({
  holding,
  card,
  currentPrice,
  binders,
  onDelete,
  onUpdateNotes,
  onUpdateBinder,
  onUpdateQuality,
  onUpdatePhotos,
  onUpdatePurchaseDetails,
  currencySymbol,
  setConfirmModal
}) => {
  const state = useHoldingItemState({ holding, onUpdatePhotos, onUpdatePurchaseDetails });

  const holdingCost = holding.purchasePrice * holding.quantity;
  const holdingValue = currentPrice * holding.quantity;
  const holdingProfit = holdingValue - holdingCost;
  const holdingRoi = holdingCost > 0 ? (holdingProfit / holdingCost) * 100 : 0;
  const isHoldingProfit = holdingProfit >= 0;

  const handleSaveNotes = () => {
    onUpdateNotes(holding.id, state.notesText);
    state.setIsEditingNotes(false);
  };

  return (
    <div className="bg-[#171921] border border-slate-800 rounded-2xl p-4 space-y-3.5">
      <HoldingItemHeader
        holding={holding}
        currencySymbol={currencySymbol}
        isEditingDetails={state.isEditingDetails}
        onStartEdit={() => state.setIsEditingDetails(true)}
        onDelete={onDelete}
        setConfirmModal={setConfirmModal}
      />

      {!state.isEditingDetails ? (
        <HoldingItemDetailsGrid
          holding={holding}
          currentPrice={currentPrice}
          currencySymbol={currencySymbol}
          onUpdateQuality={onUpdateQuality}
        />
      ) : (
        <HoldingItemEditDetails
          holding={holding}
          currencySymbol={currencySymbol}
          editPrice={state.editPrice}
          editDate={state.editDate}
          editGradeType={state.editGradeType}
          editGradeValue={state.editGradeValue}
          editCertNumber={state.editCertNumber}
          onEditPriceChange={state.setEditPrice}
          onEditDateChange={state.setEditDate}
          onEditGradeTypeChange={state.setEditGradeType}
          onEditGradeValueChange={state.setEditGradeValue}
          onEditCertNumberChange={state.setEditCertNumber}
          onCancel={state.resetEditDetails}
          onSave={state.handleSaveDetails}
        />
      )}

      {!state.isEditingDetails && (
        <div className="flex justify-between items-center text-[11px] bg-slate-900/40 p-2 rounded-xl border border-slate-850">
          <span className="text-slate-400 font-mono">Value Growth:</span>
          <div className={`flex items-center gap-1 font-mono font-bold ${isHoldingProfit ? 'text-green-500' : 'text-red-500'}`}>
            <span>{isHoldingProfit ? '+' : ''}{currencySymbol}{Math.round(holdingProfit).toLocaleString()}</span>
            <span>({isHoldingProfit ? '+' : ''}{holdingRoi.toFixed(0)}%)</span>
          </div>
        </div>
      )}

      <HoldingItemNotesBinder
        holding={holding}
        binders={binders}
        isEditingNotes={state.isEditingNotes}
        notesText={state.notesText}
        onUpdateBinder={onUpdateBinder}
        onStartEditingNotes={() => state.setIsEditingNotes(true)}
        onNotesTextChange={state.setNotesText}
        onCancelNotes={() => state.setIsEditingNotes(false)}
        onSaveNotes={handleSaveNotes}
      />

      <HoldingItemPhotos
        card={card}
        holdingId={holding.id}
        photoFront={state.photoFront}
        photoBack={state.photoBack}
        isEditingPhotos={state.isEditingPhotos}
        isUploadingFront={state.isUploadingFront}
        isUploadingBack={state.isUploadingBack}
        onToggleEditingPhotos={() => state.setIsEditingPhotos(!state.isEditingPhotos)}
        onFrontPhotoFileChange={state.handleFrontPhotoFileChange}
        onBackPhotoFileChange={state.handleBackPhotoFileChange}
        onUpdateSpecimenPhotos={state.handleUpdateSpecimenPhotos}
      />
    </div>
  );
};
