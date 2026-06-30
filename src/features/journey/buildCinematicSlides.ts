/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Card, CollectionItem, Binder } from '../../types';
import type { CinematicSlide, JourneyEvent } from './types';

export interface BuildCinematicSlidesParams {
  collectionItems: CollectionItem[];
  cards: Card[];
  binders: Binder[];
  marketPrices: Record<string, number>;
  trainerName: string;
  trainerAvatar: string;
  timelineEvents: JourneyEvent[];
  currencySymbol: string;
}

export function buildCinematicSlides(params: BuildCinematicSlidesParams): CinematicSlide[] {
  const { collectionItems, cards, binders, marketPrices, trainerName, trainerAvatar, timelineEvents, currencySymbol } = params;

  if (collectionItems.length === 0) return [];

  const slides: CinematicSlide[] = [];

    // --- SLIDE 0: Collection Chronicle Cover Page ---
    const totalSpent = collectionItems.reduce((acc, h) => acc + (h.purchasePrice * h.quantity), 0);
    const totalEstimatedWorth = collectionItems.reduce((acc, h) => {
      const currentPrice = marketPrices[h.cardId] || h.purchasePrice;
      return acc + (currentPrice * h.quantity);
    }, 0);
    const appreciationAll = totalEstimatedWorth - totalSpent;
    const appreciationAllPct = totalSpent > 0 ? (appreciationAll / totalSpent) * 100 : 0;

    slides.push({
      type: 'cover',
      title: `Coleção de ${trainerName}`,
      subtitle: 'ÁLBUM CINEMATOGRÁFICO DE MEMÓRIAS',
      narrative: `Bem-vindo ao Diário de Bordo do colecionador de elite da PokéVault. Este compêndio cinematográfico vasculha suas pastas físicas, analisa marcos de valores históricos e transcreve suas notas pessoais para retratar sua odisseia. Prepare-se para reviver cada conquista, carta por carta, detalhe por detalhe.`,
      stats: {
        trainerName,
        trainerAvatar,
        cardCount: collectionItems.reduce((sum, item) => sum + item.quantity, 0),
        bindersCount: binders.length,
        growthPct: appreciationAllPct,
        financialGain: appreciationAll,
        totalWorth: totalEstimatedWorth
      }
    });

    // --- SLIDE 1: The First Acquisition (Primitivas Origens) ---
    const sortedByPurchaseDate = [...collectionItems].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
    if (sortedByPurchaseDate.length > 0) {
      const firstHolding = sortedByPurchaseDate[0];
      const firstCard = cards.find(c => c.id === firstHolding.cardId);
      if (firstCard) {
        slides.push({
          type: 'first',
          title: 'Primeiro Passo Sourced',
          subtitle: firstCard.name,
          narrative: `Toda grande coleção herda um marco de partida. Em ${new Date(firstHolding.purchaseDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}, você marcou o início desta odisséia ao catalogar ${firstCard.name} (${firstCard.set}). Uma aquisição fundadora de valor e persistência!`,
          card: firstCard,
          holding: firstHolding
        });
      }
    }

    // --- SLIDE 2: The Holy Grail / Crown Jewel (Estrela da Coroa) ---
    const sortedByValuation = [...collectionItems].map(h => {
      const currentPrice = marketPrices[h.cardId] || h.purchasePrice;
      return { holding: h, value: currentPrice };
    }).sort((a, b) => b.value - a.value);

    if (sortedByValuation.length > 0) {
      const topValuation = sortedByValuation[0];
      const topCard = cards.find(c => c.id === topValuation.holding.cardId);
      if (topCard) {
        slides.push({
          type: 'high_value',
          title: 'A Joia da Coroa',
          subtitle: topCard.name,
          narrative: `O zênite financeiro da sua coleção. ${topCard.name}, originário do conjunto ${topCard.set}, brilha como a sua peça de maior valor unitário no mercado, estimada hoje em expressivos ${currencySymbol}${topValuation.value.toLocaleString()}! A estrela absoluta dos seus organizadores.`,
          card: topCard,
          holding: topValuation.holding
        });
      }
    }

    // --- SLIDE 3: Best Written Journal Entry (Registro de Memória) ---
    const holdingsWithNotes = collectionItems.filter(h => h.notes && h.notes.trim().length > 5);
    if (holdingsWithNotes.length > 0) {
      // Find the one with longest notes
      const notesH = [...holdingsWithNotes].sort((a, b) => (b.notes || '').length - (a.notes || '').length)[0];
      const noteCard = cards.find(c => c.id === notesH.cardId);
      if (noteCard) {
        slides.push({
          type: 'best_note',
          title: 'Diários de Viagem',
          subtitle: noteCard.name,
          narrative: `Eis uma lembrança afetiva que transborda em sua gaveta de anotações. Você registrou uma preciosa crônica pessoal sobre o processo de conquista desta carta. A PokéVault eterniza esses pensamentos que transcendem os preços do papel.`,
          card: noteCard,
          holding: notesH
        });
      }
    }

    // --- SLIDE 4: Graded Slabs Highlights (Gemas Certificadas) ---
    const gradedHoldings = collectionItems.filter(h => h.gradeType && h.gradeType !== 'Raw');
    if (gradedHoldings.length > 0) {
      // Get the highest grade or first
      const bestGraded = [...gradedHoldings].sort((a, b) => {
        const valA = parseFloat(String(a.gradeValue)) || 0;
        const valB = parseFloat(String(b.gradeValue)) || 0;
        return valB - valA;
      })[0];
      const gradedCard = cards.find(c => c.id === bestGraded.cardId);
      if (gradedCard) {
        slides.push({
          type: 'graded_gems',
          title: 'Colecionismo de Elite',
          subtitle: `${gradedCard.name} (Grade ${bestGraded.gradeValue})`,
          narrative: `Chancelada, avaliada e blindada contra o tempo. Essa fantástica raridade ultrapassou o mero status raw/bruto para ser imortalizada por juízes técnicos da ${bestGraded.gradeType}. Com Certificado Serial #${bestGraded.certNumber || 'N/A'}, ela garante reputação impecável à sua prateleira.`,
          card: gradedCard,
          holding: bestGraded
        });
      }
    }

    // --- SLIDE 5: Absolute Highest Appreciation Peak (Valorização de Ouro) ---
    const milestoneEvents = timelineEvents.filter(e => e.type === 'price_milestone');
    if (milestoneEvents.length > 0) {
      // Sort to find biggest gain percent
      let maxGainPct = 0;
      let targetEvent: JourneyEvent | null = null;
      
      milestoneEvents.forEach(e => {
        if (e.meta && e.meta.oldPrice && e.meta.newPrice) {
          const gain = ((e.meta.newPrice - e.meta.oldPrice) / e.meta.oldPrice) * 100;
          if (gain > maxGainPct) {
            maxGainPct = gain;
            targetEvent = e;
          }
        }
      });

      if (targetEvent && maxGainPct > 1) {
        const devEvent = targetEvent as JourneyEvent;
        slides.push({
          type: 'biggest_gainer',
          title: 'Pico de Valorização',
          subtitle: devEvent.card.name,
          narrative: `Seus instintos de mestre colecionador deram lucros astronômicos! Este lendário espécime superou todas as estimativas iniciais com uma valorização de mercado de +${maxGainPct.toFixed(0)}% desde a sua compra por ${currencySymbol}${devEvent.meta?.oldPrice}. Um autêntico golpe de mestre financeiro em sua carteira!`,
          card: devEvent.card,
          holding: devEvent.holding
        });
      }
    }

    // --- SLIDE 6: Automated Memory Stream Carousel ---
    slides.push({
      type: 'compilation_flow',
      title: 'Carrossel Holográfico completo',
      subtitle: 'HISTÓRIA COMPLETA EM SLIDES',
      narrative: `Toda a sua constelação de relíquias reunida. Ative o modo de reprodução de slides auto-executável ou navegue e inspecione manualmente cada exemplar com efeito de brilho prismático. Sinta o peso de cada conquista física em suas mãos digitais.`
    });

  return slides;
}
