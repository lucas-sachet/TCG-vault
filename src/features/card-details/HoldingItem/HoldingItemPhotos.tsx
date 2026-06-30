import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { Card } from '../../../types';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';

interface HoldingItemPhotoEditorProps {
  holdingId: string;
  photoFront: string;
  photoBack: string;
  isUploadingFront: boolean;
  isUploadingBack: boolean;
  onFrontPhotoFileChange: (file: File) => void;
  onBackPhotoFileChange: (file: File) => void;
  onUpdateSpecimenPhotos: (front: string, back: string) => void;
}

export const HoldingItemPhotoEditor: React.FC<HoldingItemPhotoEditorProps> = ({
  holdingId,
  photoFront,
  photoBack,
  isUploadingFront,
  isUploadingBack,
  onFrontPhotoFileChange,
  onBackPhotoFileChange,
  onUpdateSpecimenPhotos
}) => (
  <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/80 space-y-3">
    <div className="flex flex-col sm:flex-row gap-3 text-left">
      <div className="flex-1 space-y-1">
        <label className="text-[9px] text-slate-400 font-mono block uppercase">Front Photo</label>
        <div
          className="relative aspect-[4/3] bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-slate-700 transition"
          onClick={() => document.getElementById(`holding-front-file-${holdingId}`)?.click()}
        >
          <input
            type="file"
            id={`holding-front-file-${holdingId}`}
            className="hidden"
            accept="image/*"
            disabled={isUploadingFront}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFrontPhotoFileChange(e.target.files[0]);
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
          <div className="absolute bottom-1 inset-x-1 flex items-center bg-slate-950 px-1 py-0.5 rounded" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Or URL..."
              value={photoFront}
              onChange={(e) => onUpdateSpecimenPhotos(e.target.value, photoBack)}
              className="w-full text-[8.5px] bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none text-center font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-[9px] text-slate-400 font-mono block uppercase">Back Photo</label>
        <div
          className="relative aspect-[4/3] bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-slate-700 transition"
          onClick={() => document.getElementById(`holding-back-file-${holdingId}`)?.click()}
        >
          <input
            type="file"
            id={`holding-back-file-${holdingId}`}
            className="hidden"
            accept="image/*"
            disabled={isUploadingBack}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onBackPhotoFileChange(e.target.files[0]);
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
          <div className="absolute bottom-1 inset-x-1 flex items-center bg-slate-950 px-1 py-0.5 rounded" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Or URL..."
              value={photoBack}
              onChange={(e) => onUpdateSpecimenPhotos(photoFront, e.target.value)}
              className="w-full text-[8.5px] bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none text-center font-mono"
            />
          </div>
        </div>
      </div>
    </div>
    {(photoFront || photoBack) && (
      <div className="flex justify-end gap-1.5 pt-1">
        <button
          onClick={() => onUpdateSpecimenPhotos('', '')}
          className="px-2 py-0.5 text-[9px] bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold"
        >
          Clear Both Photos
        </button>
      </div>
    )}
  </div>
);

interface HoldingItemPhotoGalleryProps {
  card: Card;
  photoFront: string;
  photoBack: string;
}

export const HoldingItemPhotoGallery: React.FC<HoldingItemPhotoGalleryProps> = ({
  card,
  photoFront,
  photoBack
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
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
);

interface HoldingItemPhotosProps {
  card: Card;
  holdingId: string;
  photoFront: string;
  photoBack: string;
  isEditingPhotos: boolean;
  isUploadingFront: boolean;
  isUploadingBack: boolean;
  onToggleEditingPhotos: () => void;
  onFrontPhotoFileChange: (file: File) => void;
  onBackPhotoFileChange: (file: File) => void;
  onUpdateSpecimenPhotos: (front: string, back: string) => void;
}

export const HoldingItemPhotos: React.FC<HoldingItemPhotosProps> = ({
  card,
  holdingId,
  photoFront,
  photoBack,
  isEditingPhotos,
  isUploadingFront,
  isUploadingBack,
  onToggleEditingPhotos,
  onFrontPhotoFileChange,
  onBackPhotoFileChange,
  onUpdateSpecimenPhotos
}) => (
  <div className="pt-2.5 border-t border-slate-850/60 space-y-2.5 text-left">
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider uppercase bg-slate-900 border border-slate-850 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-yellow-500" />
        <span>PHYSICAL SPECIMEN PROOFS</span>
      </span>
      <button
        onClick={onToggleEditingPhotos}
        className="text-[10px] text-slate-400 hover:text-[#FFCB05] font-bold"
      >
        {isEditingPhotos ? 'Hide Photo Controls' : (!photoFront && !photoBack ? '+ Attach Specimen Photos' : 'Edit Specimen Photos')}
      </button>
    </div>

    {isEditingPhotos && (
      <HoldingItemPhotoEditor
        holdingId={holdingId}
        photoFront={photoFront}
        photoBack={photoBack}
        isUploadingFront={isUploadingFront}
        isUploadingBack={isUploadingBack}
        onFrontPhotoFileChange={onFrontPhotoFileChange}
        onBackPhotoFileChange={onBackPhotoFileChange}
        onUpdateSpecimenPhotos={onUpdateSpecimenPhotos}
      />
    )}

    <HoldingItemPhotoGallery card={card} photoFront={photoFront} photoBack={photoBack} />
  </div>
);
