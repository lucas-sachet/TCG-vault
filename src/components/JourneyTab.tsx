/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Image as ImageIcon, 
  FolderHeart, 
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  BookMarked,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  MessageSquare,
  HelpCircle,
  Camera,
  ArrowUpDown,
  Film,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Crown,
  Sparkle,
  CalendarDays,
  User,
  Info,
  Calendar as CalendarIcon,
  Tag,
  ShieldCheck,
  TrendingDown,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CollectionItem, PriceSnapshot, Binder, CardQuality } from '../types';

interface JourneyTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  priceHistories: Record<string, PriceSnapshot[]>;
  binders: Binder[];
  onViewCardDetails: (cardId: string) => void;
  currencySymbol?: string;
  userEmail?: string;
}

interface JourneyEvent {
  id: string; // unique event ID
  holdingId: string;
  cardId: string;
  card: Card;
  date: string; // YYYY-MM-DD
  type: 'acquired' | 'additional_copy' | 'grading_submitted' | 'grade_received' | 'price_milestone' | 'personal_note' | 'photo_added' | 'binder_moved';
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
  holding: CollectionItem;
  meta?: {
    notes?: string;
    photoFront?: string;
    photoBack?: string;
    binderName?: string;
    oldPrice?: number;
    newPrice?: number;
    gradeType?: string;
    gradeValue?: string | number;
    certNumber?: string;
  };
}

// Simple helper to add days to a date string YYYY-MM-DD
const addDays = (dateStr: string, days: number, maxDateStr: string = '2026-06-15'): string => {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    const resultStr = d.toISOString().split('T')[0];
    if (resultStr > maxDateStr) return maxDateStr;
    return resultStr;
  } catch {
    return dateStr;
  }
};

export const JourneyTab: React.FC<JourneyTabProps> = ({
  cards,
  collectionItems,
  marketPrices,
  priceHistories,
  binders,
  onViewCardDetails,
  currencySymbol = '$',
  userEmail = ''
}) => {
  // Navigation active sub-view: 'timeline' (Chronological Timeline) or 'cinema' (Interactive Story Book)
  const [activeViewMode, setActiveViewMode] = useState<'timeline' | 'cinema'>('timeline');

  // Filters state (for timeline)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBinderId, setSelectedBinderId] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [sortByRecent, setSortByRecent] = useState(true);

  // Picture Zoom Modal Overlay State
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Active user name and avatar preferences
  const activeEmail = userEmail || localStorage.getItem('pokevault_currentUser') || '';
  const trainerName = useMemo(() => {
    if (activeEmail) {
      const storedDisplay = localStorage.getItem(`pokevault_displayName_${activeEmail}`);
      const storedNick = localStorage.getItem(`pokevault_nickname_${activeEmail}`);
      return (storedNick?.trim() || storedDisplay?.trim() || 'Trainer Ash');
    }
    return 'Trainer Ash';
  }, [activeEmail]);

  const trainerAvatar = useMemo(() => {
    if (activeEmail) {
      const storedPic = localStorage.getItem(`pokevault_profilePic_${activeEmail}`);
      if (storedPic) {
        if (storedPic.startsWith('data:')) return storedPic;
        const presetAvatars: Record<string, string> = {
          'avatar-oak': '👴',
          'avatar-ash': '🧢',
          'avatar-misty': '💧',
          'avatar-pikachu': '⚡'
        };
        return presetAvatars[storedPic] || '👴';
      }
    }
    return '👴';
  }, [activeEmail]);

  // Parse and generate all timeline events based on the collection holdings
  const timelineEvents = useMemo(() => {
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
  }, [collectionItems, cards, binders, priceHistories, currencySymbol]);

  // Filtered timeline events for the "Chronicle Timeline" view
  const filteredTimelineEvents = useMemo(() => {
    let list = [...timelineEvents];

    // Apply Filter Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.card.name.toLowerCase().includes(q) || 
        e.card.set.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Apply Filter Binder ID
    if (selectedBinderId !== 'ALL') {
      list = list.filter(e => e.holding.binderId === selectedBinderId);
    }

    // Apply Filter Event Type
    if (eventTypeFilter !== 'ALL') {
      list = list.filter(e => e.type === eventTypeFilter);
    }

    // Chronological Sort
    list.sort((a, b) => {
      if (a.date !== b.date) {
        return sortByRecent 
          ? b.date.localeCompare(a.date) 
          : a.date.localeCompare(b.date);
      }
      return b.id.localeCompare(a.id);
    });

    return list;
  }, [timelineEvents, searchQuery, selectedBinderId, eventTypeFilter, sortByRecent]);


  // ==========================================
  // CINEMATIC STORY MODE / HIGHLIGHTS ENGINE
  // ==========================================
  
  const cinematicSlides = useMemo(() => {
    if (collectionItems.length === 0) return [];

    let slides: Array<{
      type: 'cover' | 'first' | 'high_value' | 'graded_gems' | 'best_note' | 'biggest_gainer' | 'compilation_flow';
      title: string;
      subtitle: string;
      narrative: string;
      card?: Card;
      holding?: CollectionItem;
      stats?: Record<string, any>;
    }> = [];

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
  }, [collectionItems, cards, trainersCount => binders.length, marketPrices, trainerName, trainerAvatar, timelineEvents, currencySymbol]);

  // Current Cinema Slide State
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const activeSlide = useMemo(() => {
    if (cinematicSlides.length === 0) return null;
    return cinematicSlides[currentSlideIdx];
  }, [cinematicSlides, currentSlideIdx]);

  // Interactive Hover Tilt Effect state for active Cinema card display
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x, y });
    
    // Tilt angle calculations (restrict max tilt to 14deg)
    const tiltX = (e.clientX - rect.left) / rect.width - 0.5;
    const tiltY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: tiltX * 24, y: -tiltY * 24 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  // Slideshow Autoplay Engine
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentSlideIdx((prev) => {
          if (prev >= cinematicSlides.length - 1) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 7000); // 7s per slide
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, cinematicSlides]);

  // Handle compilation sliding indices
  const [activeCompilationCardIndex, setActiveCompilationCardIndex] = useState(0);
  const compilationCards = useMemo(() => {
    return collectionItems.map(item => {
      const card = cards.find(c => c.id === item.cardId);
      return { item, card };
    }).filter(c => c.card !== undefined);
  }, [collectionItems, cards]);

  const activeCompObj = useMemo(() => {
    if (compilationCards.length === 0) return null;
    return compilationCards[activeCompilationCardIndex];
  }, [compilationCards, activeCompilationCardIndex]);

  // Safety trigger index resetting when switching views
  useEffect(() => {
    setTilt({ x: 0, y: 0 });
    setIsPlaying(false);
  }, [activeViewMode]);

  return (
    <div className="space-y-6">
      {/* Visual Header Banner with Dynamic Sub-Tab Selector toggles */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/30 via-[#10121a] to-slate-950 px-6 py-6 rounded-3xl border border-slate-800 shadow-2xl text-left flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FFCB05]/5 rounded-full blur-3xl animate-pulse" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider uppercase bg-yellow-950/60 border border-yellow-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLECTOR ODYSSEY Log</span>
            </span>
            <span className="text-[9px] text-indigo-400 font-mono tracking-wider uppercase bg-indigo-950/60 border border-indigo-900/40 px-2 rounded-md font-bold">
              Premium V2
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1.5">
            Jornada do Colecionador
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Sua odisseia PokéVault retratada sob medida. Alterne entre a <strong className="text-slate-300">Linha de Arquivo completa</strong> com relatórios em ordem cronológica ou o <strong className="text-[#FFCB05]">Álbum Cinemático Interativo</strong> para reviver marcos, conquistas lendárias e diários de bordo com visual imersivo.
          </p>
        </div>

        {/* View Mode Switcher Pill Slider */}
        <div className="bg-slate-950/90 border border-slate-800/80 p-1.5 rounded-2xl flex items-center self-start lg:self-center w-full sm:w-auto shrink-0 relative">
          <button
            onClick={() => setActiveViewMode('timeline')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeViewMode === 'timeline' 
                ? 'bg-slate-900 border border-slate-800 text-[#FFCB05] shadow-[0_0_20px_rgba(255,203,5,0.08)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Linha de Arquivo</span>
          </button>
          
          <button
            onClick={() => setActiveViewMode('cinema')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeViewMode === 'cinema' 
                ? 'bg-slate-900 border border-slate-800 text-[#FFCB05] shadow-[0_0_20px_rgba(255,203,5,0.08)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 animate-pulse text-[#FFCB05]" />
            <span>Álbum Cinema</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT PRESENTATION CONTAINER */}
      <AnimatePresence mode="wait">
        {activeViewMode === 'timeline' ? (
          // ==========================================
          // VIEW A: CHRONOLOGICAL ARCHIVE TIMELINE
          // ==========================================
          <motion.div
            key="timeline-container-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Filtering Utilities Grid */}
            <div className="bg-[#14161f]/80 p-4 border border-slate-850 rounded-2xl flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar cartas da jornada, conjuntos ou memorandos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-slate-100 bg-[#0F1115] pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40 transition"
                />
              </div>

              {/* Binder Filter */}
              <div className="w-full md:w-44 text-left">
                <select
                  value={selectedBinderId}
                  onChange={(e) => setSelectedBinderId(e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#0F1115] py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40"
                >
                  <option value="ALL">Coleção Inteira</option>
                  {binders.map((b) => (
                    <option key={b.id} value={b.id}>
                      📂 {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div className="w-full md:w-44 text-left">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full text-xs text-slate-200 bg-[#0F1115] py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#FFCB05]/40"
                >
                  <option value="ALL">Todos os Eventos</option>
                  <option value="acquired">✨ Aquisições</option>
                  <option value="personal_note">✍️ Diários e Notas</option>
                  <option value="photo_added">📸 Fotos Registradas</option>
                  <option value="grade_received">🏆 Retornos de Notas (PSA/CGC)</option>
                  <option value="price_milestone">📈 Altas e Baixas de Tickers</option>
                  <option value="binder_moved">📂 Alocações de Pasta</option>
                </select>
              </div>

              {/* Sorting Toggle Button */}
              <button
                onClick={() => setSortByRecent(!sortByRecent)}
                className="bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 font-bold px-4 py-2.5 rounded-xl border border-slate-750 text-xs flex items-center justify-center gap-2 transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FFCB05]" />
                <span>{sortByRecent ? 'Mais Recentes primeiro' : 'Mais Antigas primeiro'}</span>
              </button>
            </div>

            {/* Main Timestream list */}
            <div className="relative py-4 text-left">
              {filteredTimelineEvents.length === 0 ? (
                <div className="py-20 text-center bg-slate-950/20 border border-slate-850/60 rounded-3xl p-6">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Nenhuma crônica correspondente</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    Nenhum registro correspondente foi localizado para os seus filtros. Adote notas, submeta gemas a certificadores ou anexe fotos de espécimes reais para preencher seu compêndio!
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 md:pl-32 space-y-12">
                  {/* Timeline primary connector path */}
                  <div className="absolute left-[13px] md:left-[111px] top-6 bottom-6 w-[2px] bg-indigo-950" />

                  <AnimatePresence initial={false}>
                    {filteredTimelineEvents.map((event, idx) => {
                      const IconComponent = event.icon;
                      const formattedDate = new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <motion.div
                          key={event.id}
                          id={`journey-event-div-${event.id}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 1) }}
                          className="relative flex flex-col md:flex-row gap-5"
                        >
                          {/* Left date side panel on medium viewports */}
                          <div className="hidden md:absolute md:block md:-left-[152px] md:w-[120px] text-right pt-2 space-y-0.5">
                            <span className="text-xs font-black text-[#FFCB05] font-mono whitespace-nowrap block leading-none">
                              {formattedDate}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block tracking-wide leading-none">
                              {event.date}
                            </span>
                          </div>

                          {/* Timeline central bullet */}
                          <div className="absolute -left-[20px] md:-left-[26px] z-10 w-[14px] h-[14px] rounded-full bg-[#0F1115] border-2 border-indigo-500/80 mt-[15px] flex items-center justify-center">
                            <div className="w-[6px] h-[6px] rounded-full bg-[#FFCB05]" />
                          </div>

                          {/* Primary content component body */}
                          <div className="flex-1 bg-gradient-to-br from-[#12141c] to-[#0d0e14] border border-slate-850/80 rounded-2xl p-4 md:p-5.5 hover:border-slate-800 transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                            
                            {/* Card Inspect Click trigger redirect */}
                            <button
                              onClick={() => onViewCardDetails(event.card.id)}
                              className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                              title="Inspecionar ficha da carta"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Mobile inline fallback date badge */}
                            <div className="md:hidden inline-flex self-start px-2 py-0.5 bg-indigo-950/65 border border-indigo-900 rounded font-mono text-[9px] text-[#FFCB05] font-bold tracking-wide uppercase mb-1">
                              {formattedDate}
                            </div>

                            {/* Artifact/Card thumbnail */}
                            <div className="w-14 h-20 shrink-0 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center relative group p-0.5 self-start sm:self-center">
                              <img
                                src={event.card.imageUrl}
                                alt={event.card.name}
                                className="w-full h-full object-contain cursor-pointer transform group-hover:scale-105 transition"
                                referrerPolicy="no-referrer"
                                onClick={() => onViewCardDetails(event.card.id)}
                              />
                            </div>

                            {/* Core description elements */}
                            <div className="flex-1 space-y-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-mono tracking-wider font-bold uppercase border ${event.iconBg}`}>
                                  <IconComponent className="w-3 h-3" />
                                  <span>{event.title}</span>
                                </span>

                                <span className="text-[10px] text-slate-400 font-bold block">
                                  — {event.card.name} ({event.card.language})
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="text-white font-black text-xs sm:text-sm tracking-wide">
                                  {event.subtitle}
                                </h4>

                                {event.type === 'personal_note' ? (
                                  <div className="p-3 bg-yellow-950/15 border-l-3 border-yellow-500/50 text-yellow-100 rounded-r-xl text-xs leading-relaxed italic font-mono bg-[radial-gradient(#1A1D24_1px,transparent_1px)] [background-size:16px_16px]">
                                    "{event.description}"
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                                    {event.description}
                                  </p>
                                )}
                              </div>

                              {/* Physical Photo previews attachment layout */}
                              {event.type === 'photo_added' && event.meta && (
                                <div className="flex flex-wrap gap-3 pt-1.5">
                                  {event.meta.photoFront && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Frente do Espécime</span>
                                      <div 
                                        onClick={() => setZoomedImage({ url: event.meta!.photoFront!, title: `${event.card.name} (Fotografia do Espécime - Frente)` })}
                                        className="w-24 h-18 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden cursor-zoom-in relative group hover:border-[#FFCB05]/40 transition"
                                      >
                                        <img src={event.meta.frontPhotoUrl || event.meta.photoFront} alt="Fotografia Frente" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <Eye className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {event.meta.photoBack && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Verso do Espécime</span>
                                      <div 
                                        onClick={() => setZoomedImage({ url: event.meta!.photoBack!, title: `${event.card.name} (Fotografia do Espécime - Verso)` })}
                                        className="w-24 h-18 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden cursor-zoom-in relative group hover:border-[#FFCB05]/40 transition"
                                      >
                                        <img src={event.meta.backPhotoUrl || event.meta.photoBack} alt="Fotografia Verso" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <Eye className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Financial appraisal events details */}
                              {event.type === 'price_milestone' && event.meta && (
                                <div className="flex items-center gap-4 text-[10px] font-mono mt-1 text-slate-400">
                                  <div>
                                    <span>Preço de Compra: </span>
                                    <strong className="text-slate-300 font-mono">{currencySymbol}{event.meta.oldPrice}</strong>
                                  </div>
                                  <div className="h-3 w-px bg-slate-800" />
                                  <div>
                                    <span>Cotação Estimada: </span>
                                    <strong className={`font-mono ${event.meta.newPrice! >= event.meta.oldPrice! ? 'text-green-400' : 'text-red-400'}`}>
                                      {currencySymbol}{event.meta.newPrice}
                                    </strong>
                                  </div>
                                </div>
                              )}

                              {/* Technical Grading details layout */}
                              {event.type === 'grade_received' && event.meta && (
                                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-[10px] font-mono max-w-md">
                                  <div className="px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-900/50 rounded-lg font-black text-center shrink-0 min-w-[65px] flex flex-col justify-center leading-none">
                                    <span className="text-[6px] tracking-wide text-indigo-400 uppercase font-bold mb-0.5">{event.meta.gradeType}</span>
                                    <span className="text-xs font-mono">{event.meta.gradeValue}</span>
                                  </div>
                                  <div className="text-left">
                                    <span className="text-slate-500 block text-[9px] uppercase">ID de Certificação Serial</span>
                                    <span className="text-slate-300 font-bold block mt-0.5">{event.meta.certNumber || 'N/A: Sem ID registrado'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ==========================================
          // VIEW B: PREMIUM CINEMATIC JOURNEY BOOK
          // ==========================================
          <motion.div
            key="cinema-container-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {collectionItems.length === 0 ? (
              <div className="py-24 text-center bg-slate-950/20 border border-slate-850/60 rounded-3xl p-6">
                <Film className="w-12 h-12 text-[#FFCB05] mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Cinema bloqueado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Para acionar o Álbum de Memórias Cinemático, você deve possuir pelo menos 1 carta adicionada na sua coleção pessoal. Insira conquistas para iniciar os marcos de sua jornada!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. LEFT PANEL: Cinematic Interactive Display Card (Columns 1-4 on Large, standard on mobile) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0d0f15]/80 border border-slate-850 rounded-3xl p-6 relative overflow-hidden min-h-[460px]">
                  
                  {/* Dynamic Radial Ambient Blur Artwork Glow (Steam Backlight style) */}
                  {activeSlide && activeSlide.card && (
                    <motion.div 
                      key={`bg-blur-${activeSlide.card.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-cover bg-center filter blur-3xl pointer-events-none scale-125 z-0"
                      style={{ backgroundImage: `url(${activeSlide.card.imageUrl})` }}
                    />
                  )}

                  {/* Standard fallback background glow pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_70%)] z-0 pointer-events-none" />

                  {/* Top-aligned badge detailing which visual chapter this represents */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#FFCB05] uppercase bg-black/40 border border-slate-800/60 px-2.5 py-1 rounded-lg">
                      Capítulo Fólio {currentSlideIdx + 1} de {cinematicSlides.length}
                    </span>
                    
                    {activeSlide && activeSlide.card && (
                      <button 
                        onClick={() => onViewCardDetails(activeSlide.card!.id)}
                        className="p-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-all uppercase"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspecionar</span>
                      </button>
                    )}
                  </div>

                  {/* Holographic active card stage */}
                  <div className="relative w-full flex flex-col items-center justify-center z-10 pt-4">
                    <AnimatePresence mode="wait">
                      
                      {activeSlide && activeSlide.type === 'cover' ? (
                        // ==========================================
                        // COVER SLIDE FRONT ART STAGE
                        // ==========================================
                        <motion.div
                          key="stage-cover"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFCB05] to-indigo-500 p-0.5 shadow-2xl relative select-none">
                            <div className="w-full h-full bg-[#12141c] rounded-full flex items-center justify-center text-5xl">
                              {activeSlide.stats?.trainerAvatar.startsWith('data:') ? (
                                <img src={activeSlide.stats?.trainerAvatar} alt="Trainer Avatar" className="w-16 h-16 rounded-full object-cover" />
                              ) : (
                                activeSlide.stats?.trainerAvatar || '👴'
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#12141c] text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 font-sans">
                              Active
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCB05]/10 border border-[#FFCB05]/20 text-[#FFCB05] text-[10px] font-bold font-mono uppercase tracking-wider rounded-full">
                              <Crown className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span>Membro Certificado</span>
                            </div>
                            <h3 className="text-white font-black text-lg font-mono tracking-tight pt-1">
                              {activeSlide.stats?.trainerName}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold font-mono">
                              Cadastro de Coleções PokéVault
                            </p>
                          </div>
                        </motion.div>

                      ) : activeSlide && activeSlide.type === 'compilation_flow' ? (
                        // ==========================================
                        // COMPILATION CAROUSEL SHINE ART STAGE
                        // ==========================================
                        <motion.div
                          key={`stage-compilation-${activeCompilationCardIndex}`}
                          initial={{ opacity: 0, scale: 0.93 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.93 }}
                          transition={{ duration: 0.3 }}
                          className="w-full flex flex-col items-center justify-center text-center space-y-4"
                        >
                          {activeCompObj ? (
                            <div className="space-y-4 w-full flex flex-col items-center">
                              {/* Glowing card display with simulated touch/tilt */}
                              <div 
                                className="w-[180px] sm:w-[200px] aspect-[3/4.15] bg-[#0c0d12] rounded-[20px] border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative group overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
                                onMouseMove={handleCardMouseMove}
                                onMouseLeave={handleCardMouseLeave}
                                style={{
                                  transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                                  transition: 'transform 0.1s ease-out'
                                }}
                              >
                                <img 
                                  src={activeCompObj.card?.imageUrl} 
                                  alt={activeCompObj.card?.name}
                                  className="w-full h-full object-contain p-1 rounded-[16px] z-10 pointer-events-none"
                                />

                                {/* Foil dynamic glare gradient absolute wrap */}
                                <div 
                                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60 z-20 group-hover:opacity-90 transition-opacity"
                                  style={{
                                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 203, 5, 0.15) 35%, transparent 70%)`
                                  }}
                                />

                                {/* Prism line sparkle diagonal sweep */}
                                <div className="absolute inset-x-0 -top-full bottom-full bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:top-full transition-all duration-1000 ease-out z-20 pointer-events-none" />
                              </div>

                              {/* Compilation pagination toggler */}
                              <div className="flex items-center gap-3 bg-black/40 border border-slate-800/80 px-3 py-1.5 rounded-xl z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCompilationCardIndex(prev => prev > 0 ? prev - 1 : compilationCards.length - 1);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                                  title="Carta anterior"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <span className="text-[9px] text-[#FFCB05] font-mono font-bold tracking-wider">
                                  {activeCompilationCardIndex + 1} / {compilationCards.length} CARTAS
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCompilationCardIndex(prev => prev < compilationCards.length - 1 ? prev + 1 : 0);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                                  title="Próxima carta"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="h-6 leading-none">
                                <span className="text-xs font-black text-slate-200 block truncate max-w-[220px]">
                                  {activeCompObj.card?.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">
                                  {activeCompObj.card?.set} • Cod: {activeCompObj.item.quality || 'Raw'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Sem cartas registradas na coleção.</span>
                          )}
                        </motion.div>

                      ) : (
                        // ==========================================
                        // STANDARD MARCOS SLIDES ART STAGE (With Hover Tilt and Foil effects)
                        // ==========================================
                        <motion.div
                          key={`stage-slide-${activeSlide?.type}-${activeSlide?.card?.id}`}
                          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.94, rotate: 2 }}
                          transition={{ duration: 0.35 }}
                          className="flex flex-col items-center justify-center text-center space-y-4 w-full"
                        >
                          {activeSlide && activeSlide.card ? (
                            <div className="flex flex-col items-center justify-center space-y-4 w-full">
                              
                              {/* 3D Interactive Card Stage */}
                              <div 
                                className="w-[185px] sm:w-[205px] aspect-[3/4.15] bg-[#0c0d12] rounded-[20px] border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] relative group overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
                                onMouseMove={handleCardMouseMove}
                                onMouseLeave={handleCardMouseLeave}
                                style={{
                                  transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                                  transition: 'transform 0.1s ease-out'
                                }}
                              >
                                <img 
                                  src={activeSlide.card.imageUrl} 
                                  alt={activeSlide.card.name}
                                  className="w-full h-full object-contain p-1 rounded-[16px] z-10 pointer-events-none"
                                />

                                {/* Holographic linear glare sweep */}
                                <div 
                                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60 z-20 group-hover:opacity-90 transition-opacity"
                                  style={{
                                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.42) 0%, rgba(99, 102, 241, 0.15) 30%, transparent 65%)`
                                  }}
                                />

                                {/* Sparkle Sweeper sweep line */}
                                <div className="absolute inset-x-0 -top-full bottom-full bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:top-full transition-all duration-1000 ease-out z-20 pointer-events-none" />
                              </div>

                              {/* Small details text overlay */}
                              <div className="text-center block max-w-[200px] truncate leading-none">
                                <span className="text-xs font-black text-[#FFCB05] tracking-wide block uppercase font-mono">
                                  {activeSlide.card.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block tracking-normal mt-1 block uppercase">
                                  {activeSlide.card.set}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Carregando mídias autorizadas...</span>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Corner aesthetic coordinates design elements */}
                  <div className="absolute bottom-3 left-4 text-[7px] text-slate-600 font-mono tracking-wider font-bold">
                    PVAULT_HD_SPECIMEN_STAGE
                  </div>
                  <div className="absolute bottom-3 right-4 text-[7px] text-slate-600 font-mono tracking-wider font-bold">
                    SYS_BEACON_ONLINE
                  </div>
                </div>

                {/* 2. RIGHT PANEL: Panoramic Story Narratives (Columns 5-12 on Large) */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-br from-[#12141d] to-[#0c0d12] border border-slate-850 rounded-3xl p-6 sm:p-8 text-left relative overflow-hidden min-h-[460px]">
                  
                  {/* Decorative background visual elements */}
                  <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0" />

                  {/* Top slide labels */}
                  <div className="relative z-10 flex items-center justify-between border-b border-slate-850 pb-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#FFCB05] animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">
                        HISTÓRICO CINEMÁTICO DE RECORDES
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`} />
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                        {isPlaying ? 'Autoplay Ativo' : 'Pausado'}
                      </span>
                    </div>
                  </div>

                  {/* Main Slide narrative text block */}
                  <div className="relative z-10 py-6 sm:py-8 space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`narrative-slide-${activeSlide?.type}-${currentSlideIdx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Slide Custom Titles */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] sm:text-xs font-mono font-black text-indigo-400 uppercase tracking-widest block">
                            {activeSlide?.subtitle}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none font-sans">
                            {activeSlide?.title}
                          </h3>
                        </div>

                        {/* Interactive Chapter narrative layout */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-medium pt-1.5">
                          {activeSlide?.narrative}
                        </p>

                        {/* ==========================================
                            DYNAMIC SLIDE SPECIFIC PREFERENCES
                           ========================================== */}
                        
                        {/* COVER STATS BREAKDOWN GRID */}
                        {activeSlide && activeSlide.type === 'cover' && activeSlide.stats && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Acervo Total</span>
                              <strong className="text-white text-base font-black font-mono block mt-0.5">{activeSlide.stats.cardCount} cartas</strong>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Pastas Organizadoras</span>
                              <strong className="text-white text-base font-black font-mono block mt-0.5">{activeSlide.stats.bindersCount} pastas</strong>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl col-span-2 sm:col-span-1">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Valorização Total</span>
                              <strong className={`text-base font-black font-mono block mt-0.5 ${activeSlide.stats.growthPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {activeSlide.stats.growthPct >= 0 ? '+' : ''}{activeSlide.stats.growthPct.toFixed(0)}%
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* FIRST CARD MARKED STATISTICS */}
                        {activeSlide && activeSlide.type === 'first' && activeSlide.holding && (
                          <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Registrado em: <strong>{activeSlide.holding.purchaseDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <Tag className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span>Valor de Compra: <strong>{currencySymbol}{activeSlide.holding.purchasePrice}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* HOLY CROWN JEWEL DETAILS */}
                        {activeSlide && activeSlide.type === 'high_value' && activeSlide.holding && (
                          <div className="flex flex-wrap gap-4 pt-3 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl">
                              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                              <span>Gema Dominante</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFCB05]/10 border border-[#FFCB05]/20 rounded-xl">
                              <Crown className="w-3.5 h-3.5 text-[#FFCB05]" />
                              <span className="text-[#FFCB05]">Cotação Estimada: <strong>{currencySymbol}{(marketPrices[activeSlide.holding.cardId] || activeSlide.holding.purchasePrice).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* BEST NOTES PERSONAL SCROLL WRAPPERS */}
                        {activeSlide && activeSlide.type === 'best_note' && activeSlide.holding && (
                          <div className="pt-2">
                            <div className="p-4 bg-yellow-950/15 border-l-4 border-yellow-500/60 rounded-r-2xl max-w-xl text-xs sm:text-sm font-mono text-yellow-105 italic leading-relaxed bg-[radial-gradient(#1E2330_1px,transparent_1px)] [background-size:16px_16px]">
                              "{activeSlide.holding.notes}"
                            </div>
                          </div>
                        )}

                        {/* GRADING MASTER SPECIFICS */}
                        {activeSlide && activeSlide.type === 'graded_gems' && activeSlide.holding && (
                          <div className="grid grid-cols-2 gap-3 pt-3 max-w-md text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#4f46e5]/10 border border-[#4f46e5]/20 rounded-xl">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="text-indigo-300">Certificadora: <strong>{activeSlide.holding.gradeType}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl">
                              <Award className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                              <span>Grade Registrada: <strong>{activeSlide.holding.gradeValue}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl col-span-2">
                              <span className="truncate">Cert ID Serial: <strong className="text-slate-200">{activeSlide.holding.certNumber || 'N/A: Sem serial catalogado'}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* COMPILATION FLOW GENERAL STATISTICS */}
                        {activeSlide && activeSlide.type === 'compilation_flow' && activeCompObj && (
                          <div className="pt-2 max-w-md">
                            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-2.5">
                              <span className="text-[9px] text-[#FFCB05] font-mono block uppercase font-bold tracking-wider">MARCOS INDIVIDUAIS DA CARTA ATIVA</span>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Qualidade física:</span>
                                <strong className="text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">{activeCompObj.item.quality || 'Raw / Bruto'}</strong>
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Lote adquirido em:</span>
                                <strong className="text-white">{activeCompObj.item.purchaseDate}</strong>
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-400">Preço de Cotação:</span>
                                <strong className="text-white">{currencySymbol}{(marketPrices[activeCompObj.card.id] || activeCompObj.item.purchasePrice).toLocaleString()}</strong>
                              </div>
                              {activeCompObj.item.notes && (
                                <div className="border-t border-slate-850 mt-1.5 pt-2 text-[10px] text-slate-400 italic">
                                  "{activeCompObj.item.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Panoramic controls and visual navigation dots */}
                  <div className="relative z-10 space-y-4 pt-4 border-t border-slate-850/80">
                    {/* Visual Slide dots representation */}
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      {cinematicSlides.map((_, dotIdx) => (
                        <button
                          key={`dot-${dotIdx}`}
                          onClick={() => setCurrentSlideIdx(dotIdx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentSlideIdx === dotIdx ? 'w-6 bg-[#FFCB05]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Ir para o Capítulo ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Play/Pause Autoplayer triggers */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider flex items-center gap-2 cursor-pointer transition active:scale-95 border ${
                          isPlaying 
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-current" />
                            <span>Pausar Apresentação</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-[#FFCB05] shrink-0 fill-current animate-pulse" />
                            <span>Iniciar Slideshow</span>
                          </>
                        )}
                      </button>

                      {/* Panoramic manual layout selectors */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentSlideIdx((prev) => prev > 0 ? prev - 1 : cinematicSlides.length - 1);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition active:scale-95"
                          title="Recuar Capítulo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-[10px] font-mono text-slate-400 font-bold px-1 select-none">
                          CAPÍTULO {currentSlideIdx + 1} / {cinematicSlides.length}
                        </span>

                        <button
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentSlideIdx((prev) => prev < cinematicSlides.length - 1 ? prev + 1 : 0);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition active:scale-95"
                          title="Avançar Capítulo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picture Zoom Popover Dialog */}
      <AnimatePresence>
        {zoomedImage && (
          <div 
            id="zoom-modal-container"
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-150 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#14161f] border border-slate-800 rounded-2xl max-w-xl w-full p-4 relative text-center space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold font-mono text-[11px] bg-slate-900 p-2 border border-slate-800 rounded-lg cursor-pointer"
              >
                ✖ FECHAR
              </button>
              <h3 className="font-bold text-slate-100 text-xs text-left mb-1 pr-6 truncate">{zoomedImage.title}</h3>
              <div className="aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-850 flex items-center justify-center p-2">
                <img src={zoomedImage.url} alt={zoomedImage.title} className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Fotografia física do espécime arquivada e registrada localmente.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
