import { useState, useEffect, useMemo } from 'react';
import type { Card, CollectionItem } from '../../types';
import { services } from '../../services/serviceProvider';
import type { CarouselImage } from './cardDetailsTypes';

interface UseCardCarouselImagesParams {
  card: Card | undefined;
  cardHoldings: CollectionItem[];
  cardId: string | null;
}

export function useCardCarouselImages({ card, cardHoldings, cardId }: UseCardCarouselImagesParams) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const carouselImages = useMemo((): CarouselImage[] => {
    if (!card) return [];
    const list: CarouselImage[] = [
      { id: 'official', url: card.imageUrl, label: 'Official Art', isSpecimen: false }
    ];

    let copyIndex = 1;
    cardHoldings.forEach((holding) => {
      if (holding.frontPhotoUrl) {
        list.push({
          id: `specimen-front-${holding.id}`,
          url: holding.frontPhotoUrl,
          label: `Your Copy #${copyIndex} (Front)`,
          isSpecimen: true,
          copyNum: copyIndex,
          condition: holding.quality || 'NM',
          grade: holding.gradeType && holding.gradeType !== 'Raw'
            ? `${holding.gradeType} ${holding.gradeValue}`
            : 'RAW'
        });
      }
      if (holding.backPhotoUrl) {
        list.push({
          id: `specimen-back-${holding.id}`,
          url: holding.backPhotoUrl,
          label: `Your Copy #${copyIndex} (Back)`,
          isSpecimen: true,
          copyNum: copyIndex,
          condition: holding.quality || 'NM',
          grade: holding.gradeType && holding.gradeType !== 'Raw'
            ? `${holding.gradeType} ${holding.gradeValue}`
            : 'RAW'
        });
      }
      copyIndex++;
    });

    return list;
  }, [card, cardHoldings]);

  useEffect(() => {
    if (cardId) {
      const preferSpecimenPhoto = services.settings.getPreferSpecimenPhoto();
      if (preferSpecimenPhoto) {
        const firstSpecimenIdx = carouselImages.findIndex((image) => image.isSpecimen);
        if (firstSpecimenIdx !== -1) {
          setActiveImageIdx(firstSpecimenIdx);
          return;
        }
      }
      setActiveImageIdx(0);
    }
  }, [cardId, carouselImages]);

  return { carouselImages, activeImageIdx, setActiveImageIdx };
}
