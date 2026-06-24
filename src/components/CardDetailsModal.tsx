/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { 
  X, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  BookOpen, 
  Grid, 
  ShieldAlert, 
  Shield,
  HeartCrack,
  FolderSync,
  Save,
  MessageSquare,
  Bell,
  TrendingUp,
  Check,
  History,
  Sparkles,
  Award,
  Activity,
  Plus,
  Camera,
  Loader2
} from 'lucide-react';
import { Card, CollectionItem, WishlistItem, PriceSnapshot, Binder, CardQuality } from '../types';
import { LANGUAGE_METADATA, QUALITY_METADATA } from '../data/pokemonData';
import { services } from '../services/serviceProvider';
import { supabase } from '../services/supabaseClient';
import { uploadImageIfBase64 } from '../services/imageUpload.service';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface CardDetailsModalProps {
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

interface HoldingItemProps {
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
  setConfirmModal?: (config: any) => void;
}

const HoldingItem: React.FC<HoldingItemProps> = ({
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
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(holding.notes || '');

  const [photoFront, setPhotoFront] = useState(holding.frontPhotoUrl || '');
  const [photoBack, setPhotoBack] = useState(holding.backPhotoUrl || '');
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editPrice, setEditPrice] = useState(holding.purchasePrice || 0);
  const [editDate, setEditDate] = useState(holding.purchaseDate);
  const [editGradeType, setEditGradeType] = useState(holding.gradeType || 'Raw');
  const [editGradeValue, setEditGradeValue] = useState(holding.gradeValue || '10');
  const [editCertNumber, setEditCertNumber] = useState(holding.certNumber || '');

  // Reset/sync edit states if holding changes externally
  useEffect(() => {
    setEditPrice(holding.purchasePrice || 0);
    setEditDate(holding.purchaseDate);
    setEditGradeType(holding.gradeType || 'Raw');
    setEditGradeValue(holding.gradeValue || '10');
    setEditCertNumber(holding.certNumber || '');
  }, [holding.purchasePrice, holding.purchaseDate, holding.gradeType, holding.gradeValue, holding.certNumber]);

  const handleSaveDetails = () => {
    if (onUpdatePurchaseDetails) {
      onUpdatePurchaseDetails(holding.id, {
        purchasePrice: holding.purchasePrice === 0 ? Number(editPrice) : holding.purchasePrice,
        purchaseDate: editDate,
        gradeType: editGradeType,
        gradeValue: editGradeType === 'Raw' ? 'Raw' : (isNaN(Number(editGradeValue)) ? editGradeValue : Number(editGradeValue)),
        certNumber: editCertNumber.trim() || undefined
      });
    }
    setIsEditingDetails(false);
  };

  // Sync state if holding photo URLs change externally
  useEffect(() => {
    setPhotoFront(holding.frontPhotoUrl || '');
    setPhotoBack(holding.backPhotoUrl || '');
  }, [holding.frontPhotoUrl, holding.backPhotoUrl]);

  const handleUpdateSpecimenPhotos = (front: string, back: string) => {
    setPhotoFront(front);
    setPhotoBack(back);
    if (onUpdatePhotos) {
      onUpdatePhotos(holding.id, front || undefined, back || undefined);
    }
  };

  const handleFrontPhotoFileChange = async (file: File) => {
    setIsUploadingFront(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target?.result as string;
          const publicUrl = await uploadImageIfBase64(base64, userId, `front-${holding.id}`);
          setPhotoFront(publicUrl);
          if (onUpdatePhotos) {
            onUpdatePhotos(holding.id, publicUrl || undefined, photoBack || undefined);
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploadingFront(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingFront(false);
    }
  };

  const handleBackPhotoFileChange = async (file: File) => {
    setIsUploadingBack(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target?.result as string;
          const publicUrl = await uploadImageIfBase64(base64, userId, `back-${holding.id}`);
          setPhotoBack(publicUrl);
          if (onUpdatePhotos) {
            onUpdatePhotos(holding.id, photoFront || undefined, publicUrl || undefined);
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploadingBack(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingBack(false);
    }
  };

  const holdingCost = holding.purchasePrice * holding.quantity;
  const holdingValue = currentPrice * holding.quantity;
  const holdingProfit = holdingValue - holdingCost;
  const holdingRoi = holdingCost > 0 ? (holdingProfit / holdingCost) * 100 : 0;
  const isHoldingProfit = holdingProfit >= 0;

  const handleSaveNotes = () => {
    onUpdateNotes(holding.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <div className="bg-[#171921] border border-slate-800 rounded-2xl p-4 space-y-3.5">
      {/* Top Details & Delete row */}
      <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-850/80">
        <div>
          <span className="text-[10px] text-[#FFCB05] font-bold font-mono block uppercase">Holdings Copy Entry</span>
          <span className="text-xs text-slate-400 font-medium">Purchased on {holding.purchaseDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {!isEditingDetails && (
            <button
              type="button"
              onClick={() => setIsEditingDetails(true)}
              className="p-1.5 text-slate-500 hover:text-[#FFCB05] hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
              title="Edit Copy Details"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => {
              if (setConfirmModal) {
                setConfirmModal({
                  isOpen: true,
                  title: 'Remove Individual Copy?',
                  description: `Are you sure you want to delete this specific copy purchased on ${holding.purchaseDate} for ${currencySymbol}${holding.purchasePrice}? This action is irreversible.`,
                  confirmText: 'Yes, Delete Copy',
                  cancelText: 'Keep Copy',
                  type: 'danger',
                  onConfirm: () => onDelete(holding.id)
                });
              } else if (window.confirm('Are you sure you want to delete this copy?')) {
                onDelete(holding.id);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
            title="Delete Copy"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of properties or inline edit form */}
      {!isEditingDetails ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-fade-in">
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-mono block uppercase">PURCHASE PRICE</span>
            <span className="font-bold text-slate-200 mt-0.5 block font-mono">
              {currencySymbol}{holding.purchasePrice.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 font-mono block">Cost: {currencySymbol}{holdingCost.toLocaleString()}</span>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-mono block uppercase">QUANTITY</span>
            <span className="font-bold text-slate-200 mt-0.5 block font-mono">
              {holding.quantity}x
            </span>
            <span className="text-[9px] text-slate-500 font-mono block">Value: {currencySymbol}{holdingValue.toLocaleString()}</span>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-mono block uppercase">CONDITION</span>
            <span className="font-bold text-[#FFCB05] mt-0.5 block font-mono">
              {holding.quality || 'NM'}
            </span>
            {onUpdateQuality ? (
              <select
                value={holding.quality || 'NM'}
                onChange={(e) => onUpdateQuality(holding.id, e.target.value as CardQuality)}
                className="w-full bg-slate-900 text-[10px] text-slate-300 border-none outline-none mt-1 p-0.5 rounded cursor-pointer animate-fade-in"
              >
                <option value="M">M - Mint</option>
                <option value="NM">NM - Near Mint</option>
                <option value="SP">SP - Slightly Played</option>
                <option value="MP">MP - Moderately Played</option>
                <option value="HP">HP - Heavily Played</option>
                <option value="D">D - Damaged</option>
              </select>
            ) : (
              <span className="text-[9px] text-slate-500 block truncate">
                {QUALITY_METADATA[holding.quality || 'NM']?.label || 'Near Mint'}
              </span>
            )}
          </div>

          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-mono block uppercase">SLAB GRADE</span>
            <span className={`font-bold mt-0.5 block font-mono truncate ${holding.gradeType !== 'Raw' ? 'text-amber-500' : 'text-slate-400'}`}>
              {holding.gradeType} {holding.gradeType !== 'Raw' ? holding.gradeValue : ''}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {holding.gradeType !== 'Raw' ? 'Graded Copy' : 'Raw Copy'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#111317] border border-slate-850 rounded-xl space-y-3 animate-fade-in text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Purchase Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[9px] text-[#FFCB05] font-mono block uppercase mb-1 font-bold">Purchase Price ({currencySymbol})</label>
              {holding.purchasePrice === 0 ? (
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
                  min="0"
                />
              ) : (
                <div className="flex items-center justify-between bg-slate-900/50 border border-slate-850 rounded-lg p-2 text-slate-450 select-none cursor-not-allowed">
                  <span className="font-mono">{currencySymbol}{holding.purchasePrice}</span>
                  <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                    <span>🔒 LOCKED</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Grade Type</label>
              <select
                value={editGradeType}
                onChange={(e) => setEditGradeType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="Raw">Raw (Ungraded)</option>
                <option value="PSA">PSA</option>
                <option value="CGC">CGC</option>
                <option value="BGS">BGS</option>
              </select>
            </div>
            {editGradeType !== 'Raw' && (
              <>
                <div>
                  <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Grade score</label>
                  <input
                    type="text"
                    value={editGradeValue}
                    onChange={(e) => setEditGradeValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Cert Number</label>
                  <input
                    type="text"
                    value={editCertNumber}
                    onChange={(e) => setEditCertNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
            <button
              type="button"
              onClick={() => {
                setIsEditingDetails(false);
                setEditPrice(holding.purchasePrice);
                setEditDate(holding.purchaseDate);
                setEditGradeType(holding.gradeType || 'Raw');
                setEditGradeValue(holding.gradeValue || '10');
                setEditCertNumber(holding.certNumber || '');
              }}
              className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-850 hover:bg-slate-800 transition cursor-pointer select-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDetails}
              className="px-3.5 py-1.5 text-[10px] uppercase font-black text-slate-950 bg-[#FFCB05] hover:bg-yellow-400 rounded-lg transition cursor-pointer select-none"
            >
              Save Details
            </button>
          </div>
        </div>
      )}

      {/* Value Growth Row for this specific copy */}
      {!isEditingDetails && (
        <div className="flex justify-between items-center text-[11px] bg-slate-900/40 p-2 rounded-xl border border-slate-850">
          <span className="text-slate-400 font-mono">Value Growth:</span>
          <div className={`flex items-center gap-1 font-mono font-bold ${isHoldingProfit ? 'text-green-500' : 'text-red-500'}`}>
            <span>{isHoldingProfit ? '+' : ''}{currencySymbol}{Math.round(holdingProfit).toLocaleString()}</span>
            <span>({isHoldingProfit ? '+' : ''}{holdingRoi.toFixed(0)}%)</span>
          </div>
        </div>
      )}

      {/* Binder Selector & Notes edit container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Binder Selector */}
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-mono uppercase block">SHELF BINDER</label>
          <select
            value={holding.binderId || 'binder-all'}
            onChange={(e) => onUpdateBinder(holding.id, e.target.value === 'binder-all' ? '' : e.target.value)}
            className="w-full bg-slate-900 text-[11px] text-slate-200 py-1.5 px-3 rounded-lg border border-slate-850 focus:outline-none"
          >
            <option value="binder-all">None (General Main Shelf)</option>
            {binders.filter(b => b.id !== 'binder-all').map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1 relative">
          <label className="text-[9px] text-slate-500 font-mono uppercase block">PRIVATE NOTES</label>
          {isEditingNotes ? (
            <div className="space-y-1">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg p-1.5 text-[11px] text-slate-100 placeholder-slate-550 focus:outline-none min-h-[45px]"
              />
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded text-[9px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[9px]"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingNotes(true)}
              className="p-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-850/60 cursor-pointer min-h-[32px] flex items-center justify-between"
            >
              <p className="text-[11px] text-slate-300 italic truncate max-w-[170px]">
                {holding.notes || 'Click to log notes...'}
              </p>
              <span className="text-[9px] text-[#FFCB05] font-bold">Edit &rarr;</span>
            </div>
          )}
        </div>
      </div>

      {/* Specimen Visual Records (Side-By-Side Artwork and Personal Photos) */}
      <div className="pt-2.5 border-t border-slate-850/60 space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider uppercase bg-slate-900 border border-slate-850 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-yellow-500" />
            <span>PHYSICAL SPECIMEN PROOFS</span>
          </span>
          <button
            onClick={() => setIsEditingPhotos(!isEditingPhotos)}
            className="text-[10px] text-slate-400 hover:text-[#FFCB05] font-bold"
          >
            {isEditingPhotos ? 'Hide Photo Controls' : (!photoFront && !photoBack ? '+ Attach Specimen Photos' : 'Edit Specimen Photos')}
          </button>
        </div>

        {isEditingPhotos && (
          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/80 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 text-left">
              {/* Front Photo Input */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] text-slate-400 font-mono block uppercase">Front Photo</label>
                <div className="relative aspect-[4/3] bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-slate-700 transition"
                     onClick={() => document.getElementById(`holding-front-file-${holding.id}`)?.click()}>
                  <input
                    type="file"
                    id={`holding-front-file-${holding.id}`}
                    className="hidden"
                    accept="image/*"
                    disabled={isUploadingFront}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFrontPhotoFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  {isUploadingFront ? (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FFCB05]" />
                      <span className="text-[8px] text-slate-400 font-mono">Uploading...</span>
                    </div>
                  ) : photoFront ? (
                    <img src={photoFront} alt="Front Specimen" className="w-full h-full object-contain rounded" />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold block">Upload Front Image</span>
                  )}
                  <div className="absolute bottom-1 inset-x-1 flex items-center bg-slate-950 px-1 py-0.5 rounded" onClick={e=>e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Or URL..."
                      value={photoFront}
                      onChange={(e) => handleUpdateSpecimenPhotos(e.target.value, photoBack)}
                      className="w-full text-[8.5px] bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Back Photo Input */}
              <div className="flex-1 space-y-1">
                <label className="text-[9px] text-slate-400 font-mono block uppercase">Back Photo</label>
                <div className="relative aspect-[4/3] bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-slate-700 transition"
                     onClick={() => document.getElementById(`holding-back-file-${holding.id}`)?.click()}>
                  <input
                    type="file"
                    id={`holding-back-file-${holding.id}`}
                    className="hidden"
                    accept="image/*"
                    disabled={isUploadingBack}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleBackPhotoFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  {isUploadingBack ? (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FFCB05]" />
                      <span className="text-[8px] text-slate-400 font-mono">Uploading...</span>
                    </div>
                  ) : photoBack ? (
                    <img src={photoBack} alt="Back Specimen" className="w-full h-full object-contain rounded" />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold block">Upload Back Image</span>
                  )}
                  <div className="absolute bottom-1 inset-x-1 flex items-center bg-slate-950 px-1 py-0.5 rounded" onClick={e=>e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Or URL..."
                      value={photoBack}
                      onChange={(e) => handleUpdateSpecimenPhotos(photoFront, e.target.value)}
                      className="w-full text-[8.5px] bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
            {(photoFront || photoBack) && (
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => handleUpdateSpecimenPhotos('', '')}
                  className="px-2 py-0.5 text-[9px] bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold"
                >
                  Clear Both Photos
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* 1. Official Artwork Reference */}
          <div className="relative aspect-[3/4.1] bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-end p-2 group shadow-sm">
            <img 
              src={getOptimizedImageUrl(card.imageUrl, 600, 95)} 
              alt="Official Art Reference" 
              className="absolute inset-0 w-full h-full object-contain p-1 rounded-lg transition-transform duration-300 hover:scale-[1.05]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-center transition-opacity py-1 opacity-0 group-hover:opacity-100">
              <span className="text-[8px] font-mono text-slate-400">Official Art Reference</span>
            </div>
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded text-[7px] font-mono text-slate-400 font-bold">
              Official Art
            </span>
          </div>

          {/* 2. Personal Front Photograph */}
          <div className="relative aspect-[3/4.1] bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-end p-2 group shadow-sm">
            {photoFront ? (
              <>
                <img 
                  src={photoFront} 
                  alt="Personal Front specimen" 
                  className="absolute inset-0 w-full h-full object-contain p-1 rounded-lg transition-transform duration-300 hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-center transition-opacity py-1 opacity-0 group-hover:opacity-100">
                  <span className="text-[8px] font-mono text-slate-400">Your Specimen Front</span>
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-950/90 backdrop-blur-sm border border-emerald-800 rounded text-[7px] font-mono text-emerald-400 font-black">
                  Specimen Front
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-[10px] text-slate-500 font-bold space-y-1">
                <Camera className="w-4 h-4 text-slate-650" />
                <span>No front photo</span>
                <span className="text-[8px] font-mono text-slate-600 font-normal">Attach front specimen</span>
              </div>
            )}
          </div>

          {/* 3. Personal Back Photograph */}
          <div className="relative aspect-[3/4.1] bg-slate-950/60 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-end p-2 group shadow-sm">
            {photoBack ? (
              <>
                <img 
                  src={photoBack} 
                  alt="Personal Back specimen" 
                  className="absolute inset-0 w-full h-full object-contain p-1 rounded-lg transition-transform duration-300 hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-center transition-opacity py-1 opacity-0 group-hover:opacity-100">
                  <span className="text-[8px] font-mono text-slate-400">Your Specimen Back</span>
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-950/90 backdrop-blur-sm border border-emerald-800 rounded text-[7px] font-mono text-emerald-400 font-black">
                  Specimen Back
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-[10px] text-slate-500 font-bold space-y-1">
                <Camera className="w-4 h-4 text-slate-650" />
                <span>No back photo</span>
                <span className="text-[8px] font-mono text-slate-600 font-normal">Attach back specimen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  onUpdateCollectionItemPurchaseDetails
}) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteState, setNoteState] = useState('');
  const [imageError, setImageError] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Active carousel photo preview index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Find active card and associations
  const card = cards.find(c => c.id === cardId);
  const cardHoldings = collectionItems.filter(item => item.cardId === cardId);

  // Dynamic set of images inside CardDetailsModal (Official visual illustration + individual spec photo assets)
  const carouselImages = React.useMemo(() => {
    if (!card) return [];
    const list: { id: string; url: string; label: string; isSpecimen: boolean; copyNum?: number; condition?: string; grade?: string }[] = [
      { id: 'official', url: card.imageUrl, label: 'Official Art', isSpecimen: false }
    ];
    
    let copyIndex = 1;
    cardHoldings.forEach((h) => {
      if (h.frontPhotoUrl) {
        list.push({ 
          id: `specimen-front-${h.id}`, 
          url: h.frontPhotoUrl, 
          label: `Your Copy #${copyIndex} (Front)`, 
          isSpecimen: true,
          copyNum: copyIndex,
          condition: h.quality || 'NM',
          grade: h.gradeType && h.gradeType !== 'Raw' ? `${h.gradeType} ${h.gradeValue}` : 'RAW'
        });
      }
      if (h.backPhotoUrl) {
        list.push({ 
          id: `specimen-back-${h.id}`, 
          url: h.backPhotoUrl, 
          label: `Your Copy #${copyIndex} (Back)`, 
          isSpecimen: true,
          copyNum: copyIndex,
          condition: h.quality || 'NM',
          grade: h.gradeType && h.gradeType !== 'Raw' ? `${h.gradeType} ${h.gradeValue}` : 'RAW'
        });
      }
      copyIndex++;
    });

    return list;
  }, [card, cardHoldings]);

  // Try to default to the physical photograph in detailed preview if user chose photo prioritization in application system settings
  useEffect(() => {
    if (cardId) {
      const preferSpecimenPhoto = services.settings.getPreferSpecimenPhoto();
      if (preferSpecimenPhoto) {
        const firstSpecimenIdx = carouselImages.findIndex(img => img.isSpecimen);
        if (firstSpecimenIdx !== -1) {
          setActiveImageIdx(firstSpecimenIdx);
          return;
        }
      }
      setActiveImageIdx(0);
    }
  }, [cardId, carouselImages]);
  const wishlistItem = wishlistItems.find(item => item.cardId === cardId);
  const currentPrice = cardId ? (marketPrices[cardId] || 0) : 0;
  const historySeries = cardId ? (priceHistories[cardId] || []) : [];

  // Local state for Price Alerts
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(100);

  useEffect(() => {
    if (cardId) {
      const config = priceAlerts[cardId] || { enabled: false, targetPrice: marketPrices[cardId] || 100 };
      setAlertEnabled(config.enabled);
      setAlertThreshold(config.targetPrice || marketPrices[cardId] || 100);
    }
  }, [cardId, priceAlerts, marketPrices]);

  const isOwned = cardHoldings.length > 0;
  const isWishlist = !!wishlistItem;

  // Grouped Financial Calculations (representing aggregated statistics)
  const totalHoldingsQty = cardHoldings.reduce((sum, h) => sum + h.quantity, 0);
  const totalCost = cardHoldings.reduce((sum, h) => sum + (h.purchasePrice * h.quantity), 0);
  const averageCostBasis = totalHoldingsQty > 0 ? (totalCost / totalHoldingsQty) : 0;
  const totalValue = currentPrice * totalHoldingsQty;
  const profitLoss = totalValue - totalCost;
  const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  const isProfit = profitLoss >= 0;

  // Backward-compatible variables for general card details styling
  const collectionItem = cardHoldings[0];
  const purchasePrice = averageCostBasis;
  const qty = totalHoldingsQty;

  const languageInfo = card ? (LANGUAGE_METADATA[card.language] || { flag: '🌐', label: card.language }) : { flag: '🌐', label: '' };

  // Price history calculations for customized charts inside detailed page
  const maxPriceInHistory = historySeries.length > 0 ? Math.max(...historySeries.map(s => s.marketPrice)) : currentPrice;
  const minPriceInHistory = historySeries.length > 0 ? Math.min(...historySeries.map(s => s.marketPrice)) : currentPrice;
  
  // Hover & Story Index on tracking timeline
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 24;

  const sparklinePoints = historySeries.map((h, i) => {
    const denominator = historySeries.length > 1 ? (historySeries.length - 1) : 1;
    const x = padding + (i / denominator) * (chartWidth - padding * 2);
    const range = maxPriceInHistory - minPriceInHistory;
    const y = chartHeight - padding - ((h.marketPrice - minPriceInHistory) / (range || 1)) * (chartHeight - padding * 2);
    return { x, y, price: h.marketPrice, date: h.capturedAt };
  });

  const sparklineD = sparklinePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaD = sparklinePoints.length > 0
    ? `${sparklineD} L ${sparklinePoints[sparklinePoints.length - 1].x} ${chartHeight - padding} L ${sparklinePoints[0].x} ${chartHeight - padding} Z`
    : '';

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (sparklinePoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * chartWidth;

    let closestIndex = 0;
    let minDistance = Math.abs(sparklinePoints[0].x - svgX);

    sparklinePoints.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoveredPointIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  const handleStartEditingNotes = () => {
    setNoteState(collectionItem?.notes || '');
    setEditingNotes(true);
  };

  const handleSaveNotes = () => {
    if (collectionItem) {
      onUpdateCollectionItemNotes(collectionItem.id, noteState);
    }
    setEditingNotes(false);
  };

  const handleBinderShift = (binderId: string) => {
    if (collectionItem) {
      onUpdateCollectionItemBinder(collectionItem.id, binderId === 'binder-all' ? '' : binderId);
    }
  };

  const handleToggleAlert = (checked: boolean) => {
    setAlertEnabled(checked);
    if (onUpdatePriceAlert && card) {
      onUpdatePriceAlert(card.id, checked, alertThreshold);
    }
  };

  const handleThresholdChange = (val: number) => {
    setAlertThreshold(val);
    if (onUpdatePriceAlert && card) {
      onUpdatePriceAlert(card.id, alertEnabled, val);
    }
  };

  const handleQualityChange = (val: CardQuality) => {
    if (onUpdateCollectionItemQuality && collectionItem) {
      onUpdateCollectionItemQuality(collectionItem.id, val);
    }
  };

  const formatJournalDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const month = monthNames[monthNum - 1] || parts[1];
        return `${month} ${day}, ${year}`;
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  const journeyTimeline = React.useMemo(() => {
    if (!card) return [];
    const list: Array<{
      type: 'purchased' | 'additional_copy' | 'sent_grading' | 'grade_received' | 'price_milestone' | 'portfolio_milestone' | 'notes';
      date: string;
      title: string;
      description: string;
      badge: string;
      badgeType: 'success' | 'warning' | 'info' | 'primary';
    }> = [];

    if (isWishlist && wishlistItem) {
      list.push({
        type: 'purchased',
        date: new Date().toISOString().split('T')[0],
        title: '🔒 Wishlist Target Set',
        description: `Marked as wishlist item, seeking acquisition under target price of ${currencySymbol}${wishlistItem.desiredPrice}.`,
        badge: 'WISHLIST SEEKING',
        badgeType: 'warning'
      });
    }

    if (!isOwned) {
      return list;
    }

    // Sort holdings by purchase date
    const sortedHoldings = [...cardHoldings].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

    sortedHoldings.forEach((holding, idx) => {
      const isInitial = idx === 0;
      const displayDate = holding.purchaseDate;
      const qtyText = holding.quantity > 1 ? ` (${holding.quantity}x copies)` : '';
      
      // 1. Initial or Additional purchase
      list.push({
        type: isInitial ? 'purchased' : 'additional_copy',
        date: displayDate,
        title: isInitial ? '✨ First Copy Sourced' : '📦 Additional Copy Acquired',
        description: isInitial
          ? `Officially added to your collection! Sourced first copy of ${card.name} for ${currencySymbol}${holding.purchasePrice.toLocaleString()}${qtyText} in condition ${holding.quality || 'NM'}.`
          : `Grew your collection! Sourced another copy on ${displayDate} for ${currencySymbol}${holding.purchasePrice.toLocaleString()}${qtyText}.`,
        badge: isInitial ? 'FIRST OWNED' : 'COLLECTION GROWTH',
        badgeType: isInitial ? 'primary' : 'success'
      });

      // 2. Graded Slab Journey Simulation
      if (holding.gradeType && holding.gradeType !== 'Raw') {
        const buyDateObj = new Date(holding.purchaseDate);
        
        // 12 days later: Sent for grading
        const sentDateObj = new Date(buyDateObj.getTime() + 12 * 24 * 60 * 60 * 1000);
        const sentDateStr = sentDateObj.toISOString().split('T')[0];
        
        // 35 days later: Slab certified & returned
        const certDateObj = new Date(buyDateObj.getTime() + 35 * 24 * 60 * 60 * 1000);
        const certDateStr = certDateObj.toISOString().split('T')[0];

        // Ensure we don't output future dates beyond local date "2026-06-15"
        const todayStr = '2026-06-15';
        if (sentDateStr <= todayStr) {
          list.push({
            type: 'sent_grading',
            date: sentDateStr,
            title: `🛡️ Sent to ${holding.gradeType} Core Labs`,
            description: `Prepared, packaged, and dispatched copy securely for official grading credentials.`,
            badge: 'GRADING IN PROGRESS',
            badgeType: 'info'
          });
        }

        if (certDateStr <= todayStr) {
          list.push({
            type: 'grade_received',
            date: certDateStr,
            title: `🏆 Certified Grade: ${holding.gradeType} ${holding.gradeValue}`,
            description: `Certification complete! Returned with authenticated mint slab grade of ${holding.gradeValue} under active collection tracking.`,
            badge: 'SLAB ACTIVATED',
            badgeType: 'primary'
          });
        }
      }

      // 3. Notes mapping
      if (holding.notes && holding.notes.trim()) {
        list.push({
          type: 'notes',
          date: displayDate,
          title: '📝 Collector Journal Insight Added',
          description: `"${holding.notes}"`,
          badge: 'MEMORABILIA RECORD',
          badgeType: 'info'
        });
      }
    });

    // 4. Price milestones based on history series
    const sortedHistory = [...historySeries].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    if (sortedHistory.length > 0) {
      let lastPrice = sortedHistory[0].marketPrice;
      
      sortedHistory.forEach((snap, snapIdx) => {
        const percentageDiff = lastPrice > 0 ? ((snap.marketPrice - lastPrice) / lastPrice) * 100 : 0;
        
        if (Math.abs(percentageDiff) >= 10 && snapIdx > 0) {
          const isUp = percentageDiff > 0;
          list.push({
            type: 'price_milestone',
            date: snap.capturedAt,
            title: isUp ? '📈 Price Apex Achievement' : '📉 Price Readjustment',
            description: `Standard market quote changed ${isUp ? '+' : ''}${percentageDiff.toFixed(0)}%, registering at ${currencySymbol}${snap.marketPrice} on historical pricing catalogs.`,
            badge: isUp ? 'MARKET APPRECIATION' : 'PRICE CORRECTION',
            badgeType: isUp ? 'success' : 'warning'
          });
        }
        lastPrice = snap.marketPrice;
      });

      // Show peak valuation highlight
      const highestPriceObj = sortedHistory.reduce((max, obj) => obj.marketPrice > max.marketPrice ? obj : max, sortedHistory[0]);
      if (highestPriceObj.marketPrice > averageCostBasis && sortedHistory.length > 1) {
        list.push({
          type: 'price_milestone',
          date: highestPriceObj.capturedAt,
          title: `🎯 Record Valuation Summit`,
          description: `Market quote spiked to a historical peak of ${currencySymbol}${highestPriceObj.marketPrice}, marking a milestone high in appreciation.`,
          badge: 'ALL-TIME HIGH RECORD',
          badgeType: 'success'
        });
      }
    }

    // 5. Collection milestones
    if (totalHoldingsQty > 0) {
      if (totalValue >= 500) {
        list.push({
          type: 'portfolio_milestone',
          date: new Date().toISOString().split('T')[0],
          title: '💎 Premium Card Milestone',
          description: `This card's combined collection value crossed the half-grand benchmark, reaching ${currencySymbol}${Math.round(totalValue).toLocaleString()}!`,
          badge: 'PREMIUM TIER CARD',
          badgeType: 'primary'
        });
      }
    }

    // Sort list chronologically by Date
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [cardHoldings, isWishlist, wishlistItems, historySeries, currentPrice, card, averageCostBasis, totalValue, totalHoldingsQty, currencySymbol]);

  // Associate parsed collector milestone events directly with exact coordinate indices on the SVG timeline path
  const pointsWithEvents = React.useMemo(() => {
    if (sparklinePoints.length === 0) return [];
    return sparklinePoints.map(p => {
      const matchedEvents = journeyTimeline.filter(ev => {
        let bestPoint = sparklinePoints[0];
        let minDiff = Infinity;
        sparklinePoints.forEach(pt => {
          const diff = Math.abs(new Date(pt.date).getTime() - new Date(ev.date).getTime());
          if (diff < minDiff) {
            minDiff = diff;
            bestPoint = pt;
          }
        });
        return bestPoint.date === p.date;
      });
      return {
        ...p,
        events: matchedEvents
      };
    });
  }, [sparklinePoints, journeyTimeline]);

  if (!card) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="card-details-screen-overlay" className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          
          {/* Backdrop layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#090b0e]"
          />

          {/* Detailed Page Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[95vh] bg-[#12141C] border-t md:border border-slate-800 rounded-t-3xl md:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl z-50"
          >
            {/* Header toolbar */}
            <div className="p-4 border-b border-slate-800/80 bg-[#161923]/80 backdrop-blur-md flex justify-between items-center shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[#FFCB05] font-black font-mono">
                  {card.language} EDITION
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {card.id}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Delete collection items controls inside cards */}
                {isOwned && (
                  <button
                    id="delete-owned-item-btn"
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Erase All Copies?',
                        description: `Remove all ${cardHoldings.length} physical copies of "${card.name}" from your collection vault permanently? This clears all grade scores, purchase histories, and photographs of this specimen.`,
                        confirmText: 'YES, ERASE ALL',
                        cancelText: 'Keep Copies',
                        type: 'danger',
                        onConfirm: () => {
                          cardHoldings.forEach((h) => onDeleteCollectionItem(h.id));
                          onClose();
                        }
                      });
                    }}
                    className="p-2 text-red-400 hover:text-white bg-red-950/20 hover:bg-red-900/60 rounded-xl transition-all"
                    title="Delete entire card from collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {isWishlist && (
                  <button
                    id="delete-wishlist-item-btn"
                    onClick={() => {
                      onDeleteWishlistItem(wishlistItem.id);
                      onClose();
                    }}
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

            {/* Content box */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Main Banner: card image and base descriptors */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                
                {/* Image layout container & interactive carousel */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <div className="relative aspect-[3/4.1] bg-slate-950/40 rounded-2xl flex items-center justify-center p-3 border border-slate-800 overflow-hidden shadow-inner shrink-0 leading-3 group">
                    {/* Render active slide/image */}
                    {carouselImages[activeImageIdx]?.url ? (
                      <img 
                        src={carouselImages[activeImageIdx].url} 
                        alt={carouselImages[activeImageIdx].label} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain rounded-lg transition-all duration-300 transform group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[#FFCB05] mx-auto mb-2">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-sm block text-yellow-500">{card.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">{card.set}</span>
                      </div>
                    )}

                    {/* Image Specimen Info Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
                      {carouselImages[activeImageIdx]?.isSpecimen ? (
                        <span className="bg-gradient-to-r from-orange-500/95 to-amber-500/95 text-slate-950 font-black px-2 py-0.5 rounded text-[8px] tracking-wide uppercase border border-amber-300 shadow-md flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" />
                          <span>SPECIMEN CAPTURE</span>
                        </span>
                      ) : (
                        <span className="bg-slate-900/90 text-slate-300 font-bold px-2 py-0.5 rounded text-[8px] tracking-wide uppercase border border-slate-800 shadow-sm">
                          ILLUSTRATION ART
                        </span>
                      )}

                      {/* Display current page index indicator */}
                      {carouselImages.length > 1 && (
                        <span className="bg-slate-950/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-800 backdrop-blur-sm shrink-0">
                          {activeImageIdx + 1} / {carouselImages.length}
                        </span>
                      )}
                    </div>

                    {/* Slab status or holding metadata overlay if active slide is specimen */}
                    {carouselImages[activeImageIdx]?.isSpecimen && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/85 border border-slate-800 backdrop-blur-md rounded-xl p-2 flex justify-between items-center text-[9px] font-mono pointer-events-none z-10">
                        <div className="text-left">
                          <span className="text-slate-500 block text-[7px] uppercase leading-3">CONDITION</span>
                          <span className="text-emerald-400 font-extrabold leading-3">{carouselImages[activeImageIdx].condition}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[7px] uppercase leading-3">SLAB/GRADE</span>
                          <span className="text-amber-500 font-black leading-3">{carouselImages[activeImageIdx].grade}</span>
                        </div>
                      </div>
                    )}

                    {/* High contrast visual overlays for graded raw status */}
                    {(!carouselImages[activeImageIdx]?.isSpecimen && isOwned && collectionItem.gradeType !== 'Raw') && (
                      <span className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 font-black text-slate-950 rounded px-2 py-0.5 text-[9px] tracking-widest border border-amber-300 shadow-md z-10">
                        SLAB {collectionItem.gradeType} {collectionItem.gradeValue}
                      </span>
                    )}

                    {/* Arrows for sliding, displayed if there's more than 1 image */}
                    {carouselImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : carouselImages.length - 1));
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-15 active:scale-95 cursor-pointer"
                          title="Previous Image"
                        >
                          &larr;
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIdx((prev) => (prev < carouselImages.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-15 active:scale-95 cursor-pointer"
                          title="Next Image"
                        >
                          &rarr;
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row Indicator */}
                  {carouselImages.length > 1 && (
                    <div className="flex gap-1.5 items-center justify-center overflow-x-auto py-0.5 bg-slate-950/30 p-1.5 rounded-xl border border-slate-850">
                      {carouselImages.map((img, idx) => {
                        const isActive = idx === activeImageIdx;
                        return (
                          <button
                            key={img.id}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`relative w-8 h-10 bg-slate-950 border rounded overflow-hidden transition-all shrink-0 ${
                              isActive ? 'border-[#FFCB05] ring-1 ring-[#FFCB05]/40 scale-105' : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-105'
                            }`}
                            title={img.label}
                          >
                            <img src={img.url} alt={img.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            {img.isSpecimen && (
                              <div className="absolute inset-x-0 bottom-0 bg-orange-600/90 text-white font-mono text-[6px] tracking-wide py-0.5 flex items-center justify-center">
                                COPY #{img.copyNum}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Details Panel */}
                <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">{card.name}</h1>
                    <p className="text-sm font-bold text-[#FFCB05] mt-1">{card.set} • #{card.number}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                      <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-500 block uppercase">RARITY STYLE</span>
                        <span className="text-slate-200 font-bold block mt-1 truncate">{card.rarity}</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-500 block uppercase">LANG EDITION</span>
                        <span className="text-slate-200 font-bold block mt-1 flex items-center gap-1.5">
                          <span>{languageInfo.flag}</span>
                          <span className="truncate">{languageInfo.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ownership financial overview */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 border border-slate-800 rounded-2xl">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold leading-3">COLLECTION INSIGHTS</span>
                    
                    <div className="grid grid-cols-2 gap-3.5 mt-3.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Current Value</span>
                        <span className="text-xl font-black text-yellow-400 font-mono block mt-0.5">
                          {currencySymbol}{currentPrice.toLocaleString()}
                        </span>
                      </div>

                      {isOwned ? (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Appreciation</span>
                          <span className={`text-xl font-black font-mono block mt-0.5 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                            {isProfit ? '+' : ''}{roi.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Spread Target</span>
                          <span className="text-sm font-bold font-mono text-slate-300 block mt-1">
                            {isWishlist ? `${currencySymbol}${wishlistItem.desiredPrice} (Wish)` : 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>

                    {isOwned && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono">ACQUISITION COST</span>
                          <span className="block font-bold text-slate-300 font-mono mt-0.5">{currencySymbol}{purchasePrice.toLocaleString()} (qty: {qty})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 font-mono">ESTIMATED GAIN</span>
                          <span className={`block font-black font-mono mt-0.5 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{currencySymbol}{profitLoss.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price History Sparkline graph */}
              <div className="bg-[#131520] p-5 border border-slate-800/80 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="font-extrabold text-slate-100 tracking-tight">Interactive Card Value History</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md">
                    Range: {currencySymbol}{minPriceInHistory} &mdash; {currencySymbol}{maxPriceInHistory}
                  </span>
                </div>

                {historySeries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-sans italic">Historical market data points caching...</div>
                ) : (
                  <div className="space-y-4">
                    {/* SVG Graphic Map */}
                    <div className="relative overflow-hidden bg-slate-950/35 rounded-xl border border-slate-900 p-2 select-none">
                      <svg 
                        className="w-full h-auto min-w-[300px]" 
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      >
                        <defs>
                          {/* Rich gradient filling area below currency curves */}
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFCB05" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#FFCB05" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Baseline standard grid lines */}
                        <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#334155" strokeOpacity="0.25" strokeDasharray="4 4" />
                        <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#334155" strokeOpacity="0.15" strokeDasharray="2 2" />
                        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeOpacity="0.15" strokeDasharray="2 2" />

                        {/* Filled Gradient Area Under Curve */}
                        {areaD && (
                          <path 
                            d={areaD} 
                            fill="url(#chartGradient)"
                          />
                        )}

                        {/* Main Market Sparkline Line */}
                        <path 
                          d={sparklineD} 
                          fill="none" 
                          stroke="#FFCB05" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />

                        {/* Vertical scrub ruler guide */}
                        {hoveredPointIndex !== null && (
                          <line 
                            x1={sparklinePoints[hoveredPointIndex].x}
                            y1={padding}
                            x2={sparklinePoints[hoveredPointIndex].x}
                            y2={chartHeight - padding}
                            stroke="#FFCB05"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            strokeOpacity="0.8"
                          />
                        )}

                        {/* Event and standard marker nodes */}
                        {pointsWithEvents.map((pt, idx) => {
                          const hasEvents = pt.events.length > 0;
                          const isHovered = hoveredPointIndex === idx;

                          let nodeColor = '#94a3b8'; // default slate color
                          if (hasEvents) {
                            const types = pt.events.map(e => e.type);
                            if (types.includes('purchased') || types.includes('additional_copy')) {
                              nodeColor = '#10B981'; // Emerald acquisition
                            } else if (types.includes('grade_received') || types.includes('sent_grading')) {
                              nodeColor = '#6366F1'; // Indigo Grading
                            } else if (types.includes('price_milestone') || types.includes('portfolio_milestone')) {
                              nodeColor = '#EAB308'; // Gold Milestone
                            } else {
                              nodeColor = '#ED64A6'; // Pink Notes
                            }
                          }

                          return (
                            <g key={idx}>
                              {/* Background outer radiant glow circles for milestones */}
                              {hasEvents && (
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isHovered ? 9 : 6.5} 
                                  fill={nodeColor} 
                                  fillOpacity="0.15" 
                                  stroke={nodeColor}
                                  strokeOpacity="0.3"
                                />
                              )}

                              {/* Standard dot or event anchor */}
                              <circle 
                                cx={pt.x} 
                                cy={pt.y} 
                                r={isHovered ? 5 : hasEvents ? 4 : 2.5} 
                                fill={isHovered ? "#FFFFFF" : hasEvents ? nodeColor : "#0F172A"} 
                                stroke={isHovered ? nodeColor : hasEvents ? "#FFFFFF" : "#FFCB05"} 
                                strokeWidth={isHovered ? 2.5 : hasEvents ? 1 : 1} 
                              />
                            </g>
                          );
                        })}

                        {/* Transparent mouse detection layer to catch gestures seamlessly across the whole sparkline width */}
                        <rect 
                          width={chartWidth} 
                          height={chartHeight} 
                          fill="transparent" 
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          className="cursor-crosshair"
                        />
                      </svg>

                      {/* Timeline Limits Date Legend */}
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold uppercase mt-2 px-3">
                        <span>{historySeries[0]?.capturedAt}</span>
                        <span className="text-[8px] tracking-widest text-[#FFCB05]/40 font-sans">← SCRUB TIMELINE FOR STORY DETAILS &rarr;</span>
                        <span>{historySeries[historySeries.length - 1]?.capturedAt}</span>
                      </div>
                    </div>

                    {/* STORYBOARD DESCRIPTOR BOX - TELLS A CUSTOM NARRATIVE */}
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 min-h-[90px] transition-all duration-300">
                      {hoveredPointIndex !== null ? (
                        <div className="space-y-3">
                          {/* Story head row */}
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-[#FFCB05] text-slate-950 font-extrabold px-2 py-0.5 rounded font-mono uppercase">
                                Snapshot Date
                              </span>
                              <span className="text-xs font-black text-slate-200">
                                {formatJournalDate(sparklinePoints[hoveredPointIndex].date)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Standard Quote</span>
                              <span className="text-sm font-black text-yellow-400 font-mono">
                                {currencySymbol}{sparklinePoints[hoveredPointIndex].price}
                              </span>
                            </div>
                          </div>

                          {/* Story narrative checklist or empty indicators */}
                          {pointsWithEvents[hoveredPointIndex]?.events.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {pointsWithEvents[hoveredPointIndex].events.map((ev, evIdx) => {
                                let evIcon = <Activity className="w-3.5 h-3.5" />;
                                let evColorClasses = "text-slate-400 bg-slate-900 border-slate-800";

                                if (ev.type === 'purchased' || ev.type === 'additional_copy') {
                                  evIcon = <Sparkles className="w-3.5 h-3.5" />;
                                  evColorClasses = "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
                                } else if (ev.type === 'sent_grading') {
                                  evIcon = <Calendar className="w-3.5 h-3.5" />;
                                  evColorClasses = "text-indigo-400 bg-indigo-950/40 border-indigo-500/20";
                                } else if (ev.type === 'grade_received') {
                                  evIcon = <Award className="w-3.5 h-3.5" />;
                                  evColorClasses = "text-indigo-400 bg-indigo-950/40 border-indigo-500/20";
                                } else if (ev.type === 'price_milestone') {
                                  evIcon = <TrendingUp className="w-3.5 h-3.5" />;
                                  evColorClasses = "text-yellow-400 bg-yellow-950/40 border-yellow-500/20";
                                } else if (ev.type === 'notes') {
                                  evIcon = <MessageSquare className="w-3.5 h-3.5" />;
                                  evColorClasses = "text-pink-400 bg-pink-950/40 border-pink-500/20";
                                }

                                return (
                                  <div key={evIdx} className={`flex items-start gap-2.5 p-2 rounded-lg border ${evColorClasses}`}>
                                    <div className="mt-0.5 shrink-0">
                                      {evIcon}
                                    </div>
                                    <div className="space-y-0.5 text-left leading-tight">
                                      <p className="text-[10px] font-black tracking-wide uppercase font-mono text-slate-350">{ev.badge}</p>
                                      <p className="text-xs font-bold text-slate-200">{ev.title}</p>
                                      <p className="text-[11px] text-slate-400">{ev.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1 leading-relaxed font-sans">
                              <Activity className="w-4 h-4 text-slate-500 shrink-0" />
                              <div className="text-left text-slate-400">
                                <p className="font-bold text-slate-300">Standard market value activity.</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Undergoing standard marketplace updates. No additions, grading cycles, or collector updates recorded on this specific timeline.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Default state explanatory text */}
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <History className="w-4 h-4 text-[#FFCB05]" />
                            </div>
                            <div className="text-left leading-normal">
                              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest font-mono">
                                Timeline Chronicle Sync
                              </h4>
                              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed font-medium">
                                Scrub with your cursor or finger over the timeline chart to display personal acquisition events, graded certifying cycles, and notable market quote metrics aligned with each date marker.
                              </p>
                            </div>
                          </div>

                          {/* Beautiful Legend of badges */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-900 pt-3 text-[10px] font-mono font-bold text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                              <span>Acquisition</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                              <span>PSA/CGC Cert</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                              <span>Valuation Shift</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#ED64A6]" />
                              <span>Private Log</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Owned Copies (Holdings) Section */}
              {isOwned && (
                <div className="border-t border-slate-800/60 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm uppercase text-slate-100 tracking-wider flex items-center gap-2">
                      <Grid className="w-4 h-4 text-[#FFCB05]" />
                      <span>Owned Copies (Holdings)</span>
                    </h3>
                  </div>

                  {/* Aggregated Statistics Block */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#171921] p-3 border border-slate-800 rounded-2xl text-xs">
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Total Holdings</span>
                      <span className="text-base font-bold text-white font-mono block mt-0.5">{totalHoldingsQty}x</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Average Cost</span>
                      <span className="text-base font-bold text-yellow-500 font-mono block mt-0.5">
                        {currencySymbol}{Math.round(averageCostBasis).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Market Value</span>
                      <span className="text-base font-bold text-emerald-400 font-mono block mt-0.5">
                        {currencySymbol}{Math.round(totalValue).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Total Growth</span>
                      <span className={`text-base font-bold font-mono block mt-0.5 ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitLoss >= 0 ? '+' : ''}{roi.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* List of individual holdings */}
                  <div className="space-y-4">
                    {cardHoldings.map((holding) => (
                      <HoldingItem
                        key={holding.id}
                        holding={holding}
                        card={card!}
                        currentPrice={currentPrice}
                        binders={binders}
                        onDelete={onDeleteCollectionItem}
                        onUpdateNotes={onUpdateCollectionItemNotes}
                        onUpdateBinder={onUpdateCollectionItemBinder}
                        onUpdateQuality={onUpdateCollectionItemQuality}
                        onUpdatePhotos={onUpdateCollectionItemPhotos}
                        onUpdatePurchaseDetails={onUpdateCollectionItemPurchaseDetails}
                        currencySymbol={currencySymbol}
                        setConfirmModal={setConfirmModal}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Collection Journey (Timeline Journal) */}
              {journeyTimeline.length > 0 && (
                <div className="border-t border-slate-800/60 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm uppercase text-slate-100 tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-[#FFCB05]" />
                      <span>Collection Journey Journal</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                      {journeyTimeline.length} memorable events
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    A chronicle of physical acquisitions, certifications, market quote benchmarks, and curators observations registered for this rare print edition.
                  </p>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-550/80 before:via-blue-500/60 before:to-purple-500/25 before:rounded">
                    {journeyTimeline.map((item, idx) => {
                      // Determine proper icons and style highlights
                      let iconElement = <History className="w-3 h-3" />;
                      let colorClasses = "bg-slate-900 text-slate-400 border-slate-800";
                      let badgeColors = "bg-slate-950/40 text-slate-400 border-slate-850";

                      if (item.type === 'purchased') {
                        iconElement = <Sparkles className="w-3.5 h-3.5" />;
                        colorClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                        badgeColors = "bg-emerald-950/40 text-emerald-400 border-emerald-850/50";
                      } else if (item.type === 'additional_copy') {
                        iconElement = <Plus className="w-3.5 h-3.5" />;
                        colorClasses = "bg-blue-500/15 text-blue-400 border-blue-500/30";
                        badgeColors = "bg-blue-950/40 text-blue-400 border-blue-850/50";
                      } else if (item.type === 'sent_grading') {
                        iconElement = <Calendar className="w-3.5 h-3.5" />;
                        colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                        badgeColors = "bg-amber-950/40 text-amber-400 border-amber-850/50";
                      } else if (item.type === 'grade_received') {
                        iconElement = <Award className="w-3.5 h-3.5" />;
                        colorClasses = "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
                        badgeColors = "bg-indigo-950/40 text-indigo-400 border-indigo-850/50";
                      } else if (item.type === 'price_milestone') {
                        iconElement = <TrendingUp className="w-3.5 h-3.5" />;
                        colorClasses = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
                        badgeColors = "bg-yellow-950/40 text-yellow-500 border-yellow-850/50";
                      } else if (item.type === 'portfolio_milestone') {
                        iconElement = <Grid className="w-3.5 h-3.5" />;
                        colorClasses = "bg-purple-500/15 text-purple-400 border-purple-500/30";
                        badgeColors = "bg-purple-950/40 text-purple-400 border-purple-850/50";
                      } else if (item.type === 'notes') {
                        iconElement = <MessageSquare className="w-3.5 h-3.5" />;
                        colorClasses = "bg-pink-500/15 text-pink-400 border-pink-500/30";
                        badgeColors = "bg-pink-950/40 text-pink-400 border-pink-850/50";
                      }

                      return (
                        <div key={idx} className="relative group/timeline-item transition-all duration-300">
                          {/* Visual Timeline Circle Marker */}
                          <div className={`absolute -left-[23px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 group-hover/timeline-item:scale-110 shadow ${colorClasses}`}>
                            {iconElement}
                          </div>

                          {/* Event Card Content */}
                          <div className="bg-[#171921] border border-slate-800/80 rounded-2xl p-4 space-y-2.5 transition-all duration-300 hover:border-slate-700/85">
                            {/* Header row: badge and date */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md border ${badgeColors}`}>
                                {item.badge}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono font-medium block">
                                {formatJournalDate(item.date)}
                              </span>
                            </div>

                            {/* Main descriptions */}
                            <div className="space-y-1">
                              <h4 className="text-xs font-extrabold text-slate-200 tracking-tight font-sans">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-normal font-sans">
                                {item.description}
                              </p>
                            </div>

                            {/* Special Content Attachments, e.g., card thumbnails for acquisitions or grades */}
                            {(item.type === 'purchased' || item.type === 'additional_copy' || item.type === 'grade_received') && (
                              <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/80 max-w-sm mt-1">
                                <div className="w-8 h-11 relative overflow-hidden bg-slate-900 border border-slate-800 rounded shrink-0 leading-3">
                                  {!imageError ? (
                                    <img 
                                      src={card.imageUrl} 
                                      alt={card.name} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover object-top"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-yellow-500">
                                      PKM
                                    </div>
                                  )}
                                </div>
                                <div className="text-left leading-3">
                                  <p className="text-[10px] text-slate-350 font-extrabold line-clamp-1">{card.name}</p>
                                  <span className="text-[9px] text-[#FFCB05] font-mono mt-0.5 block">{card.set} • #{card.number}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Alerts Configuration Section */}
              <div className="bg-[#171921] p-4 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[10px] text-slate-550 font-mono tracking-wider block uppercase font-bold flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Card Price Alert Tracking</span>
                </span>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-400 font-mono block">Price Alert Notification</label>
                    <span className="text-[9px] text-slate-500">Notify when target threshold is hit</span>
                  </div>
                  <button
                    onClick={() => handleToggleAlert(!alertEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alertEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${alertEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {alertEnabled && (
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-xs font-mono text-slate-400">{currencySymbol}</span>
                    <input
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => handleThresholdChange(Number(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-550 focus:outline-none font-mono"
                      placeholder="e.g., 250"
                    />
                    <span className="text-[9px] text-slate-500 font-mono">Target</span>
                  </div>
                )}
              </div>

              {/* Transaction history logs */}
              <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="bg-indigo-400/10 text-indigo-400 px-2 py-0.5 rounded font-bold font-mono text-[9px] tracking-wider uppercase">Collection Activity</span>
                  <span className="text-xs text-slate-300 font-bold">Ownership History Log</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {isOwned ? (
                    <div className="flex justify-between items-center bg-[#15171e] p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-green-400 font-black block font-mono">ACQUISITION PURCHASE</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5 max-w-sm">
                          Purchased {qty}x copy on {collectionItem.purchaseDate} for {currencySymbol}{purchasePrice} USD/ea raw model.
                        </span>
                      </div>
                      <span className="font-mono text-[#FFCB05] font-bold">{currencySymbol}{totalCost}</span>
                    </div>
                  ) : isWishlist ? (
                    <div className="flex justify-between items-center bg-[#15171e] p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-amber-500 font-black block font-mono">WISHLIST PREFERENCE REGISTERED</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">
                          Added target wish seeking acquisition under {currencySymbol}{wishlistItem.desiredPrice}.
                        </span>
                      </div>
                      <span className="font-mono text-slate-300 font-bold">{currencySymbol}{wishlistItem.desiredPrice}</span>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-500 italic text-[11px]">
                      No transaction records. Card loaded from catalog view.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom panel actions */}
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
      )}

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
    </AnimatePresence>
  );
};
