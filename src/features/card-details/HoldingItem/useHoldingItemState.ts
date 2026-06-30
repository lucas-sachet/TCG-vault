import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { uploadImageIfBase64 } from '../../../services/imageUpload.service';
import type { CollectionItem } from '../../../types';
import type { GradeType, PurchaseDetailsUpdate } from '../cardDetailsTypes';

interface UseHoldingItemStateParams {
  holding: CollectionItem;
  onUpdatePhotos?: (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => void;
  onUpdatePurchaseDetails?: (itemId: string, updates: PurchaseDetailsUpdate) => void;
}

export function useHoldingItemState({
  holding,
  onUpdatePhotos,
  onUpdatePurchaseDetails
}: UseHoldingItemStateParams) {
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
  const [editGradeType, setEditGradeType] = useState<GradeType>(holding.gradeType || 'Raw');
  const [editGradeValue, setEditGradeValue] = useState<string | number>(holding.gradeValue || '10');
  const [editCertNumber, setEditCertNumber] = useState(holding.certNumber || '');

  useEffect(() => {
    setEditPrice(holding.purchasePrice || 0);
    setEditDate(holding.purchaseDate);
    setEditGradeType(holding.gradeType || 'Raw');
    setEditGradeValue(holding.gradeValue || '10');
    setEditCertNumber(holding.certNumber || '');
  }, [holding.purchasePrice, holding.purchaseDate, holding.gradeType, holding.gradeValue, holding.certNumber]);

  useEffect(() => {
    setPhotoFront(holding.frontPhotoUrl || '');
    setPhotoBack(holding.backPhotoUrl || '');
  }, [holding.frontPhotoUrl, holding.backPhotoUrl]);

  const handleSaveDetails = () => {
    if (onUpdatePurchaseDetails) {
      onUpdatePurchaseDetails(holding.id, {
        purchasePrice: holding.purchasePrice === 0 ? Number(editPrice) : holding.purchasePrice,
        purchaseDate: editDate,
        gradeType: editGradeType,
        gradeValue: editGradeType === 'Raw'
          ? 'Raw'
          : (isNaN(Number(editGradeValue)) ? editGradeValue : Number(editGradeValue)),
        certNumber: editCertNumber.trim() || undefined
      });
    }
    setIsEditingDetails(false);
  };

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
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          const publicUrl = await uploadImageIfBase64(base64, userId, `front-${holding.id}`);
          setPhotoFront(publicUrl);
          if (onUpdatePhotos) {
            onUpdatePhotos(holding.id, publicUrl || undefined, photoBack || undefined);
          }
        } catch (error) {
          console.error(error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploadingFront(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploadingFront(false);
    }
  };

  const handleBackPhotoFileChange = async (file: File) => {
    setIsUploadingBack(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          const publicUrl = await uploadImageIfBase64(base64, userId, `back-${holding.id}`);
          setPhotoBack(publicUrl);
          if (onUpdatePhotos) {
            onUpdatePhotos(holding.id, photoFront || undefined, publicUrl || undefined);
          }
        } catch (error) {
          console.error(error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploadingBack(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploadingBack(false);
    }
  };

  const resetEditDetails = () => {
    setIsEditingDetails(false);
    setEditPrice(holding.purchasePrice);
    setEditDate(holding.purchaseDate);
    setEditGradeType(holding.gradeType || 'Raw');
    setEditGradeValue(holding.gradeValue || '10');
    setEditCertNumber(holding.certNumber || '');
  };

  return {
    isEditingNotes,
    setIsEditingNotes,
    notesText,
    setNotesText,
    photoFront,
    photoBack,
    isEditingPhotos,
    setIsEditingPhotos,
    isUploadingFront,
    isUploadingBack,
    isEditingDetails,
    setIsEditingDetails,
    editPrice,
    setEditPrice,
    editDate,
    setEditDate,
    editGradeType,
    setEditGradeType,
    editGradeValue,
    setEditGradeValue,
    editCertNumber,
    setEditCertNumber,
    handleSaveDetails,
    handleUpdateSpecimenPhotos,
    handleFrontPhotoFileChange,
    handleBackPhotoFileChange,
    resetEditDetails
  };
}
