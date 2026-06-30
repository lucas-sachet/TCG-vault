import React from 'react';
import { BookOpen, Camera } from 'lucide-react';
import type { Card, CollectionItem } from '../../types';
import type { CarouselImage } from './cardDetailsTypes';

interface CardDetailsImageCarouselProps {
  card: Card;
  carouselImages: CarouselImage[];
  activeImageIdx: number;
  onActiveImageChange: (index: number) => void;
  isOwned: boolean;
  collectionItem: CollectionItem | undefined;
}

export const CardDetailsImageCarousel: React.FC<CardDetailsImageCarouselProps> = ({
  card,
  carouselImages,
  activeImageIdx,
  onActiveImageChange,
  isOwned,
  collectionItem
}) => {
  const activeImage = carouselImages[activeImageIdx];

  return (
    <div className="md:col-span-2 flex flex-col gap-3">
      <div className="relative aspect-[3/4.1] bg-slate-950/40 rounded-2xl flex items-center justify-center p-3 border border-slate-800 overflow-hidden shadow-inner shrink-0 leading-3 group">
        {activeImage?.url ? (
          <img
            src={activeImage.url}
            alt={activeImage.label}
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

        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
          {activeImage?.isSpecimen ? (
            <span className="bg-gradient-to-r from-orange-500/95 to-amber-500/95 text-slate-950 font-black px-2 py-0.5 rounded text-[8px] tracking-wide uppercase border border-amber-300 shadow-md flex items-center gap-1">
              <Camera className="w-2.5 h-2.5" />
              <span>SPECIMEN CAPTURE</span>
            </span>
          ) : (
            <span className="bg-slate-900/90 text-slate-300 font-bold px-2 py-0.5 rounded text-[8px] tracking-wide uppercase border border-slate-800 shadow-sm">
              ILLUSTRATION ART
            </span>
          )}

          {carouselImages.length > 1 && (
            <span className="bg-slate-950/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-800 backdrop-blur-sm shrink-0">
              {activeImageIdx + 1} / {carouselImages.length}
            </span>
          )}
        </div>

        {activeImage?.isSpecimen && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/85 border border-slate-800 backdrop-blur-md rounded-xl p-2 flex justify-between items-center text-[9px] font-mono pointer-events-none z-10">
            <div className="text-left">
              <span className="text-slate-500 block text-[7px] uppercase leading-3">CONDITION</span>
              <span className="text-emerald-400 font-extrabold leading-3">{activeImage.condition}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[7px] uppercase leading-3">SLAB/GRADE</span>
              <span className="text-amber-500 font-black leading-3">{activeImage.grade}</span>
            </div>
          </div>
        )}

        {(!activeImage?.isSpecimen && isOwned && collectionItem && collectionItem.gradeType !== 'Raw') && (
          <span className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 font-black text-slate-950 rounded px-2 py-0.5 text-[9px] tracking-widest border border-amber-300 shadow-md z-10">
            SLAB {collectionItem.gradeType} {collectionItem.gradeValue}
          </span>
        )}

        {carouselImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActiveImageChange(activeImageIdx > 0 ? activeImageIdx - 1 : carouselImages.length - 1);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-15 active:scale-95 cursor-pointer"
              title="Previous Image"
            >
              &larr;
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActiveImageChange(activeImageIdx < carouselImages.length - 1 ? activeImageIdx + 1 : 0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-15 active:scale-95 cursor-pointer"
              title="Next Image"
            >
              &rarr;
            </button>
          </>
        )}
      </div>

      {carouselImages.length > 1 && (
        <div className="flex gap-1.5 items-center justify-center overflow-x-auto py-0.5 bg-slate-950/30 p-1.5 rounded-xl border border-slate-850">
          {carouselImages.map((image, index) => {
            const isActive = index === activeImageIdx;
            return (
              <button
                key={image.id}
                onClick={() => onActiveImageChange(index)}
                className={`relative w-8 h-10 bg-slate-950 border rounded overflow-hidden transition-all shrink-0 ${
                  isActive ? 'border-[#FFCB05] ring-1 ring-[#FFCB05]/40 scale-105' : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-105'
                }`}
                title={image.label}
              >
                <img src={image.url} alt={image.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                {image.isSpecimen && (
                  <div className="absolute inset-x-0 bottom-0 bg-orange-600/90 text-white font-mono text-[6px] tracking-wide py-0.5 flex items-center justify-center">
                    COPY #{image.copyNum}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
