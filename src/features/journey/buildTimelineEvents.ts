/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Award, BookMarked, ExternalLink, FolderHeart, Image as ImageIcon,
  MessageSquare, Plus, TrendingUp,
} from 'lucide-react';
import type { Card, CollectionItem, Binder, PriceSnapshot } from '../../types';
import type { JourneyEvent } from './types';
import { addDays } from './journey-utils';

export interface BuildTimelineEventsParams {
  collectionItems: CollectionItem[];
  cards: Card[];
  binders: Binder[];
  priceHistories: Record<string, PriceSnapshot[]>;
  currencySymbol: string;
}

export function buildTimelineEvents(params: BuildTimelineEventsParams): JourneyEvent[] {
  const { collectionItems, cards, binders, priceHistories, currencySymbol } = params;
  let list: JourneyEvent[] = [];

    collectionItems.forEach((holding) => {
      const card = cards.find(c => c.id === holding.cardId);
      if (!card) return;

      const binder = binders.find(b => b.id === holding.binderId);
      const binderName = binder ? binder.name : 'General Binder';

      // 1. Core Acquisition Event
      list.push({
        id: `event-acq-${holding.id}`,
        holdingId: holding.id,
        cardId: holding.cardId,
        card,
        date: holding.purchaseDate,
        type: 'acquired',
        icon: BookMarked,
        iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        iconColor: 'text-emerald-400',
        title: '✨ Card Acquired',
        subtitle: card.name,
        description: `Sourced a beautiful copy of ${card.name} (${card.language}) for your collection catalog. Condition graded: ${holding.quality || 'Raw'}. Paid an initial price of ${currencySymbol}${holding.purchasePrice.toLocaleString()}.`,
        holding,
        meta: {
          gradeType: holding.gradeType,
          gradeValue: holding.gradeValue,
          certNumber: holding.certNumber
        }
      });

      // 2. Additional Copy Acquired Event (if quantity > 1)
      if (holding.quantity > 1) {
        list.push({
          id: `event-bulk-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: holding.purchaseDate,
          type: 'additional_copy',
          icon: Plus,
          iconBg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
          iconColor: 'text-teal-400',
          title: '📦 Extra Copies Sourced',
          subtitle: `Added +${holding.quantity - 1} extra duplicates`,
          description: `Grew ownership density for ${card.name}! Checked-in ${holding.quantity - 1} additional duplicates on the very same transaction register.`,
          holding
        });
      }

      // 3. Folder/Binder Shelved Event
      if (holding.binderId) {
        list.push({
          id: `event-binder-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: addDays(holding.purchaseDate, 1),
          type: 'binder_moved',
          icon: FolderHeart,
          iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          iconColor: 'text-blue-400',
          title: '📂 Slid Into Organizer Binder',
          subtitle: `Sorted into: ${binderName}`,
          description: `Secured the physical card inside the specialized album slots for protected visual presentation.`,
          holding,
          meta: {
            binderName
          }
        });
      }

      // 4. Collector's Journal Personal Notes Event
      if (holding.notes && holding.notes.trim() !== '') {
        list.push({
          id: `event-note-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: addDays(holding.purchaseDate, 2),
          type: 'personal_note',
          icon: MessageSquare,
          iconBg: 'bg-yellow-500/10 border-yellow-500/30 text-[#FFCB05]',
          iconColor: 'text-[#FFCB05]',
          title: '✍️ Journal Entry Recorded',
          subtitle: 'Collector thoughts',
          description: holding.notes,
          holding,
          meta: {
            notes: holding.notes
          }
        });
      }

      // 5. Specimen Photos Attached Event
      if (holding.frontPhotoUrl || holding.backPhotoUrl) {
        list.push({
          id: `event-photos-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: addDays(holding.purchaseDate, 3),
          type: 'photo_added',
          icon: ImageIcon,
          iconBg: 'bg-[#EA580C]/10 border-[#EA580C]/30 text-orange-400',
          iconColor: 'text-orange-400',
          title: '📸 Physical Specimen Witnessed',
          subtitle: 'Personal Photo Proofs Added',
          description: `Captured digital high-resolution visual proof of the raw/slabbed specimen card's corners, surfaces and holographic shine.`,
          holding,
          meta: {
            photoFront: holding.frontPhotoUrl,
            photoBack: holding.backPhotoUrl
          }
        });
      }

      // 6. Professional Grading Submission Track
      if (holding.gradeType && holding.gradeType !== 'Raw') {
        list.push({
          id: `event-sub-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: addDays(holding.purchaseDate, 5),
          type: 'grading_submitted',
          icon: ExternalLink,
          iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          iconColor: 'text-purple-400',
          title: '✈️ Submitted For Grading',
          subtitle: `Sent to ${holding.gradeType}`,
          description: `Ensured secure bubblewrap padding and rigid sleeves. Dispatched cardboard specimen off to the headquarters of ${holding.gradeType} for technical certification and centering appraisal.`,
          holding,
          meta: {
            gradeType: holding.gradeType
          }
        });

        // 7. Graded Cert return
        list.push({
          id: `event-grade-rec-${holding.id}`,
          holdingId: holding.id,
          cardId: holding.cardId,
          card,
          date: addDays(holding.purchaseDate, 18),
          type: 'grade_received',
          icon: Award,
          iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          iconColor: 'text-indigo-400',
          title: `🏆 Graded Mint Slab Returned`,
          subtitle: `${holding.gradeType} Grades: ${holding.gradeValue}`,
          description: `Return slab parcel unboxing! Authenticated and sealed in crystal-clear rigid sonically sealed acrylic armor by ${holding.gradeType} judges. Certified Certification ID: ${holding.certNumber || 'N/A'}.`,
          holding,
          meta: {
            gradeType: holding.gradeType,
            gradeValue: holding.gradeValue,
            certNumber: holding.certNumber
          }
        });
      }

      // 8. Historical Price Milestone Events matching card history snapshots
      const history = priceHistories[holding.cardId] || [];
      history.forEach((snap, idx) => {
        // Only include historical shifts after purchase date
        if (snap.capturedAt > holding.purchaseDate) {
          const diffPct = ((snap.marketPrice - holding.purchasePrice) / holding.purchasePrice) * 100;
          const appreciationText = diffPct >= 0 
            ? `appreciating by +${diffPct.toFixed(0)}% from initial buy-in!` 
            : `adjusting by ${diffPct.toFixed(0)}% in active cardboard indices.`;
          
          list.push({
            id: `event-price-${holding.id}-${idx}`,
            holdingId: holding.id,
            cardId: holding.cardId,
            card,
            date: snap.capturedAt,
            type: 'price_milestone',
            icon: TrendingUp,
            iconBg: diffPct >= 0 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400',
            iconColor: diffPct >= 0 ? 'text-green-400' : 'text-red-400',
            title: diffPct >= 0 ? '📈 Valuation Milestone' : '📉 Valuation Shift',
            subtitle: `Index Quote: ${currencySymbol}${snap.marketPrice.toLocaleString()}`,
            description: `TGC composite pricing updated. The card is currently valued at ${currencySymbol}${snap.marketPrice.toLocaleString()}, ${appreciationText}`,
            holding,
            meta: {
              oldPrice: holding.purchasePrice,
              newPrice: snap.marketPrice
            }
          });
        }
      });
    });

  return list;
}
