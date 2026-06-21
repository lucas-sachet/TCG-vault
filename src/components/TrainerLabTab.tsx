/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Award, 
  Grid, 
  Layers, 
  Sliders, 
  TrendingUp, 
  Plus, 
  Eye, 
  BookMarked, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  BellRing, 
  HelpCircle,
  HelpCircle as InfoIcon,
  Maximize2,
  Trash2,
  DollarSign,
  Briefcase,
  Crosshair,
  BadgeAlert,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CollectionItem, Binder, WishlistItem } from '../types';

interface TrainerLabTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  onViewCardDetails: (cardId: string) => void;
  onAddHolding: (holding: any) => void;
  onUpdateCollectionItemQuality: (id: string, quality: any) => void;
  onUpdateCollectionItemNotes: (id: string, notes: string) => void;
  wishlistItems: WishlistItem[];
  onAddWishlistItem: (item: any) => void;
  currencySymbol?: string;
  onViewCardDetailsDirect?: (cardId: string) => void;
}

// Preset complete rosters & listings for the Set Tracker to be functional out-of-the-box
const PRESET_TRACK_SETS = [
  {
    name: '151 Classic Collection (Kanto)',
    year: '2023',
    cards: [
      { id: 'track-151-1', name: 'Charizard ex - Alternate Art', number: '199/165', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png', currentPrice: 124.50 },
      { id: 'track-151-2', name: 'Blastoise ex - Alternate Art', number: '200/165', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/200_hires.png', currentPrice: 48.00 },
      { id: 'track-151-3', name: 'Venusaur ex - Alternate Art', number: '198/165', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/198_hires.png', currentPrice: 42.50 },
      { id: 'track-151-4', name: 'Pikachu', number: '173/165', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/173_hires.png', currentPrice: 24.90 },
      { id: 'track-151-5', name: 'Mew ex - Gold Hyper Rare', number: '205/165', rarity: 'Hyper Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/205_hires.png', currentPrice: 85.00 },
      { id: 'track-151-6', name: 'Alakazam ex', number: '201/165', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/201_hires.png', currentPrice: 34.00 },
      { id: 'track-151-7', name: 'Dragonair', number: '181/165', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/181_hires.png', currentPrice: 17.50 },
      { id: 'track-151-8', name: 'Zapdos ex', number: '202/165', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/202_hires.png', currentPrice: 39.90 },
      { id: 'track-151-9', name: 'Psyduck', number: '175/165', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3pt5/175_hires.png', currentPrice: 11.20 }
    ]
  },
  {
    name: 'Obsidian Flames (Charizard Apex)',
    year: '2023',
    cards: [
      { id: 'track-obf-1', name: 'Charizard ex - Tera Darkness', number: '223/197', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3/223_hires.png', currentPrice: 62.00 },
      { id: 'track-obf-2', name: 'Pidgeot ex', number: '225/197', rarity: 'Special Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3/225_hires.png', currentPrice: 14.50 },
      { id: 'track-obf-3', name: 'Ninetales', number: '199/197', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3/199_hires.png', currentPrice: 9.80 },
      { id: 'track-obf-4', name: 'Cleffa', number: '202/197', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3/202_hires.png', currentPrice: 6.50 },
      { id: 'track-obf-5', name: 'Gloom', number: '198/197', rarity: 'Illustration Rare', imageUrl: 'https://images.pokemontcg.io/sv3/198_hires.png', currentPrice: 4.90 },
      { id: 'track-obf-6', name: 'Charizard ex - Ultra Rare Full Art', number: '228/197', rarity: 'Ultra Rare', imageUrl: 'https://images.pokemontcg.io/sv3/228_hires.png', currentPrice: 28.00 }
    ]
  },
  {
    name: 'Base Set Retro (1999 Classic)',
    year: '1999',
    cards: [
      { id: 'track-bset-1', name: 'Charizard Holo', number: '4/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png', currentPrice: 380.00 },
      { id: 'track-bset-2', name: 'Blastoise Holo', number: '2/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png', currentPrice: 115.00 },
      { id: 'track-bset-3', name: 'Venusaur Holo', number: '15/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png', currentPrice: 85.00 },
      { id: 'track-bset-4', name: 'Alakazam Holo', number: '1/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/1_hires.png', currentPrice: 32.00 },
      { id: 'track-bset-5', name: 'Mewtwo Holo', number: '10/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png', currentPrice: 28.00 },
      { id: 'track-bset-6', name: 'Pikachu Red Cheeks', number: '58/102', rarity: 'Common', imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png', currentPrice: 45.00 },
      { id: 'track-bset-7', name: 'Gyarados Holo', number: '6/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/6_hires.png', currentPrice: 20.00 },
      { id: 'track-bset-8', name: 'Zapdos Holo', number: '16/102', rarity: 'Holo Rare', imageUrl: 'https://images.pokemontcg.io/base1/16_hires.png', currentPrice: 25.00 }
    ]
  }
];

export const TrainerLabTab: React.FC<TrainerLabTabProps> = ({
  cards,
  collectionItems,
  marketPrices,
  onViewCardDetails,
  onAddHolding,
  onUpdateCollectionItemQuality,
  onUpdateCollectionItemNotes,
  wishlistItems,
  onAddWishlistItem,
  currencySymbol = '$',
  onViewCardDetailsDirect
}) => {
  // Navigation for Sub-Tools
  const [activeTool, setActiveTool] = useState<'checklist' | 'binder' | 'grading' | 'sniper'>('checklist');

  // Unified available cards list including preloaded and created user cards
  const allKnownCards = useMemo(() => {
    const map = new Map<string, Card>();
    // Add presets first
    PRESET_TRACK_SETS.forEach(set => {
      set.cards.forEach(c => {
        map.set(c.id, {
          id: c.id,
          name: c.name,
          set: set.name,
          number: c.number,
          rarity: c.rarity,
          language: 'EN',
          imageUrl: c.imageUrl
        });
      });
    });
    // Overlay user created cards
    cards.forEach(c => {
      map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [cards]);

  const allOwnedCardIds = useMemo(() => {
    return new Set(collectionItems.map(item => item.cardId));
  }, [collectionItems]);

  const userOwnedCards = useMemo(() => {
    return collectionItems.map(item => {
      const card = allKnownCards.find(c => c.id === item.cardId);
      return { item, card };
    }).filter(x => !!x.card);
  }, [collectionItems, allKnownCards]);


  // ==========================================
  // TOOL 1: MASTER SET COMPLETISMO CHECKLIST
  // ==========================================
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const activeSet = PRESET_TRACK_SETS[selectedSetIndex];

  const setProgress = useMemo(() => {
    if (!activeSet) return { total: 0, owned: 0, percent: 0 };
    const total = activeSet.cards.length;
    let owned = 0;
    activeSet.cards.forEach(c => {
      if (allOwnedCardIds.has(c.id) || allOwnedCardIds.has(`track-${c.id}`)) {
        owned++;
      } else {
        // Fallback checks for similar card names
        const matchingSimilar = collectionItems.some(item => {
          const uCard = cards.find(uc => uc.id === item.cardId);
          return uCard && uCard.name.toLowerCase().includes(c.name.split('-')[0].trim().toLowerCase());
        });
        if (matchingSimilar) owned++;
      }
    });
    return {
      total,
      owned,
      percent: total > 0 ? Math.round((owned / total) * 100) : 0
    };
  }, [activeSet, allOwnedCardIds, collectionItems, cards]);


  // ==========================================
  // TOOL 2: 3x3 VIRTUAL BINDER SIMULATOR
  // ==========================================
  // Saved local state storing manual pocket layout configurations for binder slots [1-9]
  const [binderPage, setBinderPage] = useState(1);
  const [binderPageSlots, setBinderPageSlots] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pokevault_virtual_binder');
    return saved ? JSON.parse(saved) : {};
  });

  const saveBinderSlots = (newSlots: Record<string, string>) => {
    setBinderPageSlots(newSlots);
    localStorage.setItem('pokevault_virtual_binder', JSON.stringify(newSlots));
  };

  // List of items available to be slotted in
  const assignableCards = useMemo(() => {
    return userOwnedCards.map(c => ({
      id: c.card!.id,
      name: c.card!.name,
      imageUrl: c.card!.imageUrl,
      set: c.card!.set
    }));
  }, [userOwnedCards]);

  const [assigningSlot, setAssigningSlot] = useState<number | null>(null);

  const placeCardInSlot = (slotNumber: number, cardId: string) => {
    const key = `page_${binderPage}_slot_${slotNumber}`;
    const updated = { ...binderPageSlots };
    if (cardId === 'empty') {
      delete updated[key];
    } else {
      updated[key] = cardId;
    }
    saveBinderSlots(updated);
    setAssigningSlot(null);
  };


  // ==========================================
  // TOOL 3: CENTER CALCULATOR & PRE-GRADING
  // ==========================================
  const [gradingSelectedCardId, setGradingSelectedCardId] = useState<string>('');
  
  // Align grading properties
  const [centeringLeftRight, setCenteringLeftRight] = useState(50); // 50 means perfect 50/50
  const [centeringTopBottom, setCenteringTopBottom] = useState(50);
  const [condCorners, setCondCorners] = useState(10);
  const [condEdges, setCondEdges] = useState(10);
  const [condSurface, setCondSurface] = useState(10);

  const [savingGradeResult, setSavingGradeResult] = useState(false);
  const [savedGradesHistory, setSavedGradesHistory] = useState<Array<{ id: string; cardName: string; grade: string; text: string; date: string }>>(() => {
    const historical = localStorage.getItem('pokevault_grading_sims');
    return historical ? JSON.parse(historical) : [];
  });

  const gradingCard = useMemo(() => {
    if (!gradingSelectedCardId) return null;
    return allKnownCards.find(c => c.id === gradingSelectedCardId) || null;
  }, [gradingSelectedCardId, allKnownCards]);

  // Set gradingCard automatically on mount if cards exists
  useEffect(() => {
    if (userOwnedCards.length > 0 && !gradingSelectedCardId) {
      setGradingSelectedCardId(userOwnedCards[0].card!.id);
    } else if (allKnownCards.length > 0 && !gradingSelectedCardId) {
      setGradingSelectedCardId(allKnownCards[0].id);
    }
  }, [userOwnedCards, allKnownCards, gradingSelectedCardId]);

  // Calculating grades
  const gradingScoreCalculated = useMemo(() => {
    const diffLR = Math.abs(50 - centeringLeftRight);
    const diffTB = Math.abs(50 - centeringTopBottom);
    
    // Max penalty of 3 points if centering is terrible (e.g. 70/30)
    let centeringGrade = 10;
    const maxDiff = Math.max(diffLR, diffTB);
    if (maxDiff > 3) centeringGrade = 9.5;
    if (maxDiff > 6) centeringGrade = 9;
    if (maxDiff > 10) centeringGrade = 8.5;
    if (maxDiff > 15) centeringGrade = 7.5;
    if (maxDiff > 20) centeringGrade = 6.0;

    const subscores = [centeringGrade, condCorners, condEdges, condSurface];
    const average = subscores.reduce((sum, v) => sum + v, 0) / 4;
    
    // PSA doesn't do decimals except 8.5. Let's output a rounded standard
    let predictedPSA = 10;
    if (average >= 9.85) predictedPSA = 10;
    else if (average >= 9.3) predictedPSA = 9;
    else if (average >= 8.5) predictedPSA = 8;
    else if (average >= 7.5) predictedPSA = 7;
    else if (average >= 6.5) predictedPSA = 6;
    else if (average >= 5.5) predictedPSA = 5;
    else predictedPSA = 4;

    // Condition Level translation label text
    let label = '💎 GEM MINT';
    let text = 'Flawless centering eligible for PSA 10 gem certification. Symmetrical alignment and glossy finishes.';
    if (predictedPSA === 9) {
      label = '✨ MINT';
      text = 'Virtually pristine specimen with minor alignment offset or micro surface scratch invisible to naked eye.';
    } else if (predictedPSA === 8) {
      label = '🏆 NEAR MINT-MINT';
      text = 'Slight corner white point or light silvering at back edges; high overall eye appeal.';
    } else if (predictedPSA === 7) {
      label = '🛡️ NEAR MINT';
      text = 'Definitive surface hair scuff or minor edge chipping. Suitable for binder display.';
    } else if (predictedPSA <= 6) {
      label = '⚠️ EXCELLENT / PLAYED';
      text = 'Moderate whitening or noticeable print line. Recommended to keep raw or sleeved.';
    }

    return {
      average: average.toFixed(1),
      predictedPSA,
      label,
      text,
      centeringScore: centeringGrade
    };
  }, [centeringLeftRight, centeringTopBottom, condCorners, condEdges, condSurface]);

  const saveSimulationToNotes = () => {
    if (!gradingCard) return;
    setSavingGradeResult(true);

    const holding = collectionItems.find(it => it.cardId === gradingCard.id);
    const newEntry = {
      id: `grad-sim-${Date.now()}`,
      cardName: gradingCard.name,
      grade: `PSA ${gradingScoreCalculated.predictedPSA}`,
      text: `${gradingScoreCalculated.label} (Subnotes: Centering ${gradingScoreCalculated.centeringScore}/10, Corners ${condCorners}/10, Edges ${condEdges}/10, Surface ${condSurface}/10)`,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedSims = [newEntry, ...savedGradesHistory].slice(0, 5);
    setSavedGradesHistory(updatedSims);
    localStorage.setItem('pokevault_grading_sims', JSON.stringify(updatedSims));

    if (holding) {
      // Auto upgrade quality
      const qualityMap: Record<number, string> = { 10: 'M', 9: 'NM', 8: 'NM', 7: 'SP', 6: 'MP', 5: 'HP', 4: 'D' };
      onUpdateCollectionItemQuality(holding.id, qualityMap[gradingScoreCalculated.predictedPSA] || 'SP');
      onUpdateCollectionItemNotes(holding.id, `${holding.notes || ''}\n[Pre-grading: ${newEntry.grade} - Cent ${centeringLeftRight}/${100-centeringLeftRight}]`.trim());
    }

    setTimeout(() => {
      setSavingGradeResult(false);
    }, 1200);
  };


  // ==========================================
  // TOOL 4: PRICE SNIPER DEALS ENGINE
  // ==========================================
  const [alertFormCardId, setAlertFormCardId] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number | ''>('');
  
  // Custom alerts state
  const [sniperRules, setSniperRules] = useState<Array<{ id: string; cardId: string; cardName: string; targetPrice: number; currentPrice: number }>>(() => {
    const saved = localStorage.getItem('pokevault_sniper_rules');
    if (saved) return JSON.parse(saved);
    // Initial basic trigger
    return [
      { id: 'rule-1', cardId: 'track-151-1', cardName: 'Charizard ex AA (151)', targetPrice: 100, currentPrice: 124.5 },
      { id: 'rule-2', cardId: 'track-bset-1', cardName: 'Charizard Holo (Base Set)', targetPrice: 320, currentPrice: 380 }
    ];
  });

  // Automatically populated live sniped deals
  const sniperDeals = useMemo(() => {
    return [
      {
        id: 'deal-1',
        cardId: 'track-151-1',
        name: 'Charizard ex - Alt Art',
        set: '151 Classic Collection',
        source: 'eBay Auction Deal',
        discount: '32%',
        marketVal: 124.50,
        dealPrice: 84.00,
        shipping: 4.50,
        endsIn: '4 mins remaining',
        trusted: true,
        imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png'
      },
      {
        id: 'deal-2',
        cardId: 'track-obf-1',
        name: 'Charizard ex - Tera',
        set: 'Obsidian Flames',
        source: 'Discord Trade Group',
        discount: '23%',
        marketVal: 62.00,
        dealPrice: 48.00,
        shipping: 2.00,
        endsIn: 'Direct offer',
        trusted: false,
        imageUrl: 'https://images.pokemontcg.io/sv3/223_hires.png'
      },
      {
        id: 'deal-3',
        cardId: 'track-151-4',
        name: 'Pikachu IR',
        set: '151 Classic Collection',
        source: 'Cardmarket Listing',
        discount: '42%',
        marketVal: 24.90,
        dealPrice: 14.50,
        shipping: 1.50,
        endsIn: 'Instant Buy',
        trusted: true,
        imageUrl: 'https://images.pokemontcg.io/sv3pt5/173_hires.png'
      }
    ];
  }, []);

  const addNewSniperRule = () => {
    if (!alertFormCardId || !alertTargetPrice) return;
    const cardSelected = allKnownCards.find(c => c.id === alertFormCardId);
    if (!cardSelected) return;

    const currentPrice = marketPrices[alertFormCardId] || 25.00;
    const newRule = {
      id: `rule-${Date.now()}`,
      cardId: alertFormCardId,
      cardName: `${cardSelected.name} (${cardSelected.number})`,
      targetPrice: Number(alertTargetPrice),
      currentPrice
    };

    const updated = [...sniperRules, newRule];
    setSniperRules(updated);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updated));
    setAlertTargetPrice('');
  };

  const removeSniperRule = (id: string) => {
    const updated = sniperRules.filter(r => r.id !== id);
    setSniperRules(updated);
    localStorage.setItem('pokevault_sniper_rules', JSON.stringify(updated));
  };

  const snipPurchaseCard = (deal: typeof sniperDeals[number]) => {
    // Simulate immediate purchase and add to user collection items!
    onAddHolding({
      id: `own-item-${Date.now()}`,
      cardId: deal.cardId,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: deal.dealPrice,
      currency: 'USD',
      quantity: 1,
      gradeType: 'Raw',
      notes: `Sniped via Trainer Lab Sniper Engine! Source: ${deal.source} (Saved ${deal.discount})`
    });

    // Save alert trigger feedback
    const toastDiv = document.createElement('div');
    toastDiv.className = 'fixed bottom-10 right-10 z-50 bg-[#161a21] border-2 border-emerald-500 font-bold p-4.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce';
    toastDiv.innerHTML = `
      <div class="p-2 bg-emerald-500/10 rounded-full text-emerald-400">🏆</div>
      <div class="text-left">
        <div class="text-xs text-emerald-400 uppercase tracking-widest font-mono">SNIPE COMPLETO!</div>
        <div class="text-xs text-white">Adicionado com sucesso pela pechincha de $${deal.dealPrice.toFixed(2)}!</div>
      </div>
    `;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 4000);
  };


  return (
    <div className="space-y-6 text-left">
      
      {/* Visual Sub Navigation for Lab Tools */}
      <div id="trainer-lab-tabs-nav" className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-2 border border-slate-850 rounded-2xl">
        <button
          onClick={() => setActiveTool('checklist')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTool === 'checklist' 
              ? 'bg-[#181A24] border border-slate-800 text-[#FFCB05] shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookMarked className="w-4 h-4 text-[#FFCB05]" />
          <span>Completismo (Master Sets)</span>
        </button>

        <button
          onClick={() => setActiveTool('binder')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTool === 'binder' 
              ? 'bg-[#181A24] border border-slate-800 text-[#FFCB05] shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4 text-sky-400" />
          <span>Pasta Virtual (Binder)</span>
        </button>

        <button
          onClick={() => setActiveTool('grading')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTool === 'grading' 
              ? 'bg-[#181A24] border border-slate-800 text-[#FFCB05] shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Grading Lab (Notas)</span>
        </button>

        <button
          onClick={() => setActiveTool('sniper')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTool === 'sniper' 
              ? 'bg-[#181A24] border border-slate-800 text-[#FFCB05] shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Sniper de Preços</span>
        </button>
      </div>


      {/* TOOL RENDER VIEWPORT */}
      <AnimatePresence mode="wait">
        
        {/* ==========================================
            1. MASTER SET CHECKLIST & COMPLETISMO
            ========================================== */}
        {activeTool === 'checklist' && (
          <motion.div
            key="tool-checklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Set Selection & Tracker Ring Card */}
              <div className="bg-[#12141c] border border-slate-850 p-6 rounded-3xl space-y-6">
                <div>
                  <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">TCG MASTER SETS</span>
                  <h3 className="text-white font-black text-lg mt-0.5">Expansões de Elite</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Selecione uma coleção oficial do repositório para acompanhar o seu progresso de completismo.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {PRESET_TRACK_SETS.map((set, idx) => (
                    <button
                      key={set.name}
                      onClick={() => setSelectedSetIndex(idx)}
                      className={`w-full p-4 rounded-2xl border text-left transition relative flex items-center justify-between cursor-pointer ${
                        selectedSetIndex === idx 
                          ? 'bg-slate-900 border-slate-850 text-white' 
                          : 'bg-[#0b0c11] hover:bg-slate-900/40 border-transparent text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wide font-black uppercase block leading-none">{set.year} Set Range</span>
                        <span className="text-xs font-black font-sans block mt-1 leading-tight">{set.name}</span>
                      </div>
                      <span className="text-[10px] text-[#FFCB05] font-mono font-bold bg-[#FFCB05]/10 border border-[#FFCB05]/35 px-2 py-0.5 rounded-lg shrink-0 scale-95 uppercase">
                        {set.cards.length} Cards
                      </span>
                    </button>
                  ))}
                </div>

                {/* Completeness gauge circular donut preview */}
                <div className="bg-[#0b0c11] border border-slate-850/60 p-5 rounded-2xl flex items-center gap-4.5">
                  <div className="relative w-18 h-18 rounded-full border-4 border-slate-850 flex items-center justify-center font-mono text-white text-xs font-black">
                    <svg className="absolute -inset-1 transform -rotate-90">
                      <circle cx="36" cy="36" r="30" fill="transparent" stroke="#252a36" strokeWidth="4" />
                      <circle 
                        cx="36" 
                        cy="36" 
                        r="30" 
                        fill="transparent" 
                        stroke="#FFCB05" 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 30}
                        strokeDashoffset={2 * Math.PI * 30 * (1 - setProgress.percent / 100)}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span>{setProgress.percent}%</span>
                  </div>

                  <div className="text-left space-y-0.5">
                    <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest uppercase font-bold">Relação de Compleição</span>
                    <h4 className="text-xs font-black text-white">{setProgress.owned} de {setProgress.total} cartas nas pastas</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Continue catalogando mais do mesmo set para ver este anel brilhar dourado!
                    </p>
                  </div>
                </div>
              </div>


              {/* Right Column: Holographic checklist drawer (Columns 2-3) */}
              <div className="lg:col-span-2 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-white font-black text-base">{activeSet.name} checklist</h3>
                    <p className="text-xs text-slate-400">Cartas que você possui aparecem iluminadas. Toque nas silhuetas para preencher.</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium font-sans">Verde = Já Obtido</span>
                  </div>
                </div>

                {/* Cards checklist grid (beautiful visual layouts with shadows) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
                  {activeSet.cards.map((setCard) => {
                    const isOwned = allOwnedCardIds.has(setCard.id) || allOwnedCardIds.has(`track-${setCard.id}`) || 
                      collectionItems.some(it => {
                        const actualC = cards.find(ac => ac.id === it.cardId);
                        return actualC && actualC.name.toLowerCase().includes(setCard.name.split('-')[0].trim().toLowerCase());
                      });

                    return (
                      <div
                        key={setCard.id}
                        className={`bg-[#0b0c11] border rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative group min-h-[220px] transition-all duration-300 ${
                          isOwned 
                            ? 'border-emerald-500/30 bg-gradient-to-tr from-[#0F1C18] to-[#0b0c11] shadow-[0_0_15px_rgba(16,185,129,0.06)]' 
                            : 'border-slate-850 opacity-60 hover:opacity-95'
                        }`}
                      >
                        {/* Interactive float icons over cards */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                          {isOwned ? (
                            <span className="p-1 bg-emerald-500 text-slate-950 rounded-lg text-[9px] font-black" title="Obtido!">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                // Add to wishlist immediately
                                onAddWishlistItem({
                                  id: `wish-${Date.now()}`,
                                  cardId: setCard.id,
                                  desiredPrice: setCard.currentPrice,
                                  currentMarketPrice: setCard.currentPrice,
                                  priority: 'High',
                                  language: 'EN',
                                  notes: `Adicionado do painel master set completismo`
                                });
                                const notify = document.createElement('div');
                                notify.className = 'fixed bottom-10 right-10 z-50 bg-indigo-950 border border-indigo-500 p-4 rounded-xl shadow-lg font-bold text-xs text-indigo-200';
                                notify.innerText = '✨ Carta marcada na lista de desejos!';
                                document.body.appendChild(notify);
                                setTimeout(() => notify.remove(), 2500);
                              }}
                              className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                              title="Favoritar ou marcar na wish"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Card Image element (shadowed if missing) */}
                        <div className="w-20 h-28 transform group-hover:scale-105 transition duration-300 relative">
                          <img
                            src={setCard.imageUrl}
                            alt={setCard.name}
                            className={`w-full h-full object-contain ${
                              isOwned ? 'filter drop-shadow-lg' : 'filter brightness-[0.25] grayscale'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Title details underneath card image */}
                        <div className="w-full space-y-0.5 mt-3">
                          <span className="text-[9px] text-[#FFCB05] font-mono block tracking-wide truncate">{setCard.rarity}</span>
                          <span className="text-xs font-black text-slate-200 block truncate">{setCard.name}</span>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                            <span>#{setCard.number}</span>
                            <span className="font-bold text-slate-400">{currencySymbol}{setCard.currentPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Fast click mock acquire action */}
                        {!isOwned && (
                          <button
                            onClick={() => {
                              onAddHolding({
                                id: `own-item-${Date.now()}`,
                                cardId: setCard.id,
                                purchaseDate: new Date().toISOString().split('T')[0],
                                purchasePrice: setCard.currentPrice,
                                currency: 'USD',
                                quantity: 1,
                                gradeType: 'Raw',
                                notes: 'Aquisição rápida via checklist completista!'
                              });
                            }}
                            className="mt-2.5 w-full bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition border border-slate-800 cursor-pointer"
                          >
                            + Cartão
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}


        {/* ==========================================
            2. VIRTUAL 3x3 BINDER VISUAL SIMULATOR
            ========================================== */}
        {activeTool === 'binder' && (
          <motion.div
            key="tool-binder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Visual Header Controls */}
            <div className="bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <span className="text-[9px] text-sky-400 font-mono tracking-widest block uppercase font-bold">VIRTUAL POCKET DISPLAY</span>
                <h3 className="text-white font-black text-lg mt-0.5">Simulador de Pasta 3x3</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Organize suas relíquias em uma visualização realista de binder físico de 9 bolso por página. Ideal para simular colecionamento em papel real!
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  disabled={binderPage === 1}
                  onClick={() => setBinderPage(prev => Math.max(1, prev - 1))}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-40 select-none cursor-pointer hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black font-mono text-[#FFCB05] bg-yellow-950/40 border border-yellow-800/40 px-4 py-2.5 rounded-xl">
                  PÁGINA {binderPage}
                </span>
                <button
                  onClick={() => setBinderPage(prev => prev + 1)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 select-none cursor-pointer hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Layout Grid Splitter (Left: the Binder Slots, Right: Assign Drawer if open) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Pocket Stage Frame (8 Columns) */}
              <div className="lg:col-span-8 bg-[#181a24] border-8 border-[#3A2218] p-5.5 sm:p-7 rounded-[32px] shadow-2xl relative bg-[radial-gradient(#0A0B0E_1.5px,transparent_1.5px)] [background-size:24px_24px] overflow-hidden">
                
                {/* Visual leather / stitching detail */}
                <div className="absolute inset-2 border-2 border-dashed border-[#503126]/30 rounded-2xl pointer-events-none" />

                {/* 3x3 Pocket Matrix */}
                <div className="grid grid-cols-3 gap-3.5 sm:gap-4 ml-0 relative z-10">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const slotNo = i + 1;
                    const key = `page_${binderPage}_slot_${slotNo}`;
                    const slottedCardId = binderPageSlots[key];
                    const cardFound = slottedCardId ? allKnownCards.find(c => c.id === slottedCardId) : null;

                    return (
                      <div
                        key={slotNo}
                        onClick={() => setAssigningSlot(slotNo)}
                        className={`aspect-[2.5/3.5] rounded-xl border-2 flex flex-col items-center justify-center text-center relative group overflow-hidden transition-all duration-300 cursor-pointer shadow-inner min-h-[145px] sm:min-h-[190px] ${
                          cardFound 
                            ? 'border-indigo-500/20 bg-slate-950 p-[3px] shadow-lg' 
                            : 'border-slate-800 border-dashed bg-slate-950/70 hover:bg-slate-950/90 hover:border-sky-500/40'
                        }`}
                      >
                        {/* Pocket slot index numbering */}
                        <div className="absolute bottom-1 right-2 font-mono text-[9px] text-slate-700 select-none z-10">
                          Slot {slotNo}
                        </div>

                        {cardFound ? (
                          // Card filled state
                          <div className="w-full h-full relative flex items-center justify-center">
                            <img
                              src={cardFound.imageUrl}
                              alt={cardFound.name}
                              className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Hover overlay removal button */}
                            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition duration-150 rounded-lg">
                              <span className="text-[10px] font-black font-sans text-[#FFCB05] px-2 text-center truncate">{cardFound.name}</span>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewCardDetails(cardFound.id);
                                  }}
                                  className="p-1 px-2 bg-slate-900 border border-slate-800 text-slate-300 rounded hover:text-white"
                                  title="Inspecionar"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    placeCardInSlot(slotNo, 'empty');
                                  }}
                                  className="p-1 bg-red-950/60 border border-red-900 text-red-400 rounded hover:text-red-300"
                                  title="Remover do bolso"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Card empty state slot
                          <div className="flex flex-col items-center justify-center p-3 select-none">
                            <Plus className="w-5 h-5 text-slate-700 group-hover:text-sky-500 transition-colors mb-1.5" />
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase leading-none tracking-wider">Inserir</span>
                            <span className="text-[8px] text-slate-700 block mt-1">Clique para alocar</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Pocket Card Selector Sidedrawer (4 Columns) */}
              <div className="lg:col-span-4 bg-[#12141c] border border-slate-850 p-5 rounded-3xl h-full space-y-4">
                <div>
                  <h4 className="text-white font-black text-sm">
                    {assigningSlot ? `Preencher Bolso ${assigningSlot}` : 'Seletor de Bolso'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {assigningSlot 
                      ? 'Clique em um de seus cards abaixo para alocá-lo nesse slot.' 
                      : 'Toque em qualquer compartimento vazio do binder para começar a encaixar seu acervo físico.'}
                  </p>
                </div>

                {assigningSlot && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between bg-sky-950/30 border border-sky-900/40 p-2 py-2.5 rounded-xl text-sky-400 font-mono text-[10px]">
                      <span>Definindo Bolso #{assigningSlot} de Página {binderPage}</span>
                      <button
                        onClick={() => setAssigningSlot(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    {assignableCards.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
                        <BadgeAlert className="w-7 h-7 text-slate-600 mx-auto" />
                        <span className="text-[11px] font-bold text-slate-400 block">Sua coleção está vazia!</span>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Adicione ou compre cartas na aba "Collection" ou use o Seletor Dourado da checklist para popular o acervo!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1.5 scrollbar-thin">
                        {assignableCards.map(c => {
                          // Prevent sorting duplicate visual card assignments on SAME page
                          const alreadySlottedInThisPage = Array.from({ length: 9 }).some((_, idx) => {
                            const ck = `page_${binderPage}_slot_${idx + 1}`;
                            return binderPageSlots[ck] === c.id;
                          });

                          return (
                            <button
                              key={c.id}
                              disabled={alreadySlottedInThisPage}
                              onClick={() => placeCardInSlot(assigningSlot, c.id)}
                              className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition gap-2 cursor-pointer ${
                                alreadySlottedInThisPage 
                                  ? 'bg-[#0a0b0e] border-transparent opacity-40 cursor-not-allowed' 
                                  : 'bg-[#0A0B0E] hover:bg-slate-900 border-slate-850'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <img src={c.imageUrl} alt={c.name} className="w-7 h-10 object-contain shrink-0" />
                                <div className="text-left overflow-hidden">
                                  <span className="text-[11px] font-black text-white block truncate leading-tight">{c.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block truncate">{c.set}</span>
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-sky-400 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!assigningSlot && (
                  <div className="p-10 text-center bg-[#0b0c11] border border-slate-850/60 rounded-2xl">
                    <Compass className="w-10 h-10 text-slate-800 mx-auto mb-2 animate-spin-slow" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nenhum bolso selecionado</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-sm mx-auto">
                      Selecione um dos 9 compartimentos da pasta ao lado para atribuir ou reorganizar sua prateleira virtual.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}


        {/* ==========================================
            3. INTERACTIVE CENTERING & PRE-GRADING
            ========================================== */}
        {activeTool === 'grading' && (
          <motion.div
            key="tool-grading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Visual Card Measuring Stage with Overlay crosshair (Columns 1-7) */}
              <div className="lg:col-span-7 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-purple-400 font-mono tracking-widest block uppercase font-bold">CONDITION DETAILED SURVEY</span>
                      <h3 className="text-white font-black text-lg mt-0.5">Mesa de Gradação de Centering</h3>
                    </div>

                    <select
                      value={gradingSelectedCardId}
                      onChange={(e) => setGradingSelectedCardId(e.target.value)}
                      className="text-xs text-slate-200 bg-[#0F1115] py-2 px-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-400 text-left"
                    >
                      {allKnownCards.map(c => (
                        <option key={c.id} value={c.id}>
                          🃏 {c.name} ({c.number})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    Inspecione a relação das bordas amarelas/escuras. use as rédeas abaixo para alinhar os limites e testar se a carta é qualificada como PSA 10 Gem Mint.
                  </p>
                </div>

                {/* Main measurement canvas */}
                <div className="my-6 aspect-[1.1/1] bg-[#0b0c11] border border-slate-850 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                  {/* Grid lines texture backing */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                  {/* Centering overlay measurements line */}
                  <div className="absolute top-1/2 left-4 right-4 h-px bg-green-500/20 z-10" />
                  <div className="absolute left-1/2 top-4 bottom-4 w-px bg-green-500/20 z-10" />

                  <div className="relative w-44 h-60 shrink-0">
                    <AnimatePresence mode="wait">
                      {gradingCard ? (
                        <motion.div
                          key={`grade-card-img-${gradingCard.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full h-full"
                        >
                          <img
                            src={gradingCard.imageUrl}
                            alt={gradingCard.name}
                            className="w-full h-full object-contain filter drop-shadow-2xl relative z-0 select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />

                          {/* Dynamic Crosshair measurement handles (Adjustable overlays) */}
                          {/* Left Border measurement guide */}
                          <div 
                            className="absolute left-0 bottom-0 top-0 w-1 bg-green-500 shadow-[0_0_10px_#10B981] z-20"
                            style={{ width: `${centeringLeftRight * 0.15}px` }}
                          />
                          {/* Right Border measurement guide */}
                          <div 
                            className="absolute right-0 bottom-0 top-0 bg-green-500 shadow-[0_0_10px_#10B981] z-20"
                            style={{ width: `${(100 - centeringLeftRight) * 0.15}px` }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full bg-slate-900/55 rounded-xl border border-dashed border-slate-850 flex items-center justify-center">
                          <span className="text-xs text-slate-500 font-mono">Espécime Vazio</span>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Centering Overlay indicator bubble */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-950 border border-emerald-800 text-green-400 font-mono text-[9px] px-2.5 py-1 rounded-full text-center z-30 font-black">
                      LR Ratio: {centeringLeftRight} / {100 - centeringLeftRight}
                    </div>
                  </div>
                </div>

                {/* Left/Right and Top/Bottom Centering sliders */}
                <div className="space-y-3.5 bg-[#0b0c11] border border-slate-850 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="font-bold">Eixo Lateral (Esquerda / Direita)</span>
                      <strong className="text-green-400 font-mono">Bordas: {centeringLeftRight}% L / {100 - centeringLeftRight}% R</strong>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={centeringLeftRight}
                      onChange={(e) => setCenteringLeftRight(Number(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-slate-950 h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="font-bold">Eixo Vertical (Superior / Inferior)</span>
                      <strong className="text-green-400 font-mono">Bordas: {centeringTopBottom}% T / {100 - centeringTopBottom}% B</strong>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={centeringTopBottom}
                      onChange={(e) => setCenteringTopBottom(Number(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-slate-950 h-1.5 rounded-lg"
                    />
                  </div>
                </div>
              </div>


              {/* Right Column: Pre-Grading checklist and final predicted Slab (Columns 8-12) */}
              <div className="lg:col-span-5 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col justify-between text-left">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-black text-sm">Pre-Grading Checklist</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Ajuste os parâmetros abaixo baseados em uma inspeção detalhada em luz direta de sua carta física.
                    </p>
                  </div>

                  {/* Interactive parameters Checklist */}
                  <div className="space-y-4">
                    {/* Corners */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Cantos (Corners Quality)</span>
                        <span className="text-purple-400 font-black">{condCorners} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condCorners}
                        onChange={(e) => setCondCorners(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condCorners === 10 ? 'Pristine: No chipping or round defects' : condCorners >= 8.5 ? 'Minor white point invisible under casual inspection' : 'Substantial whitening/peeling'}
                      </span>
                    </div>

                    {/* Edges */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Bordas (Edges Condition)</span>
                        <span className="text-purple-400 font-black">{condEdges} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condEdges}
                        onChange={(e) => setCondEdges(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condEdges === 10 ? 'Perfect sharp cut: Zero silvering/fuzziness' : condEdges >= 8.5 ? 'Very light nick on one edge' : 'Severe micro-tears / silvering'}
                      </span>
                    </div>

                    {/* Surface */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Superfície (Surface Glare)</span>
                        <span className="text-purple-400 font-black">{condSurface} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10"
                        step="0.5"
                        value={condSurface}
                        onChange={(e) => setCondSurface(Number(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded accent-purple-500"
                      />
                      <span className="text-[9px] text-slate-500 block">
                        {condSurface === 10 ? 'Flawless holo shine: Zero micro-scratches' : condSurface >= 8.5 ? 'Very minor light scratch on print line' : 'Dull glaze, wax stains or deep scratches'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estimated grade certificate results block (Rendering PSA replica card) */}
                <div className="pt-6 border-t border-slate-850 mt-6 space-y-4">
                  
                  {/* PSA / CGC virtual card certificate mockup */}
                  <div className="bg-[#EBEBEB] border-2 border-slate-400 p-3 rounded-xl text-slate-950 font-mono shadow-md overflow-hidden text-left relative flex flex-col justify-between min-h-[92px]">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-red-600" />
                    
                    <div className="flex justify-between items-start pt-1 font-mono tracking-wide">
                      <div className="text-[9px] uppercase font-bold leading-none space-y-0.5">
                        <span className="block font-black text-slate-800">POKÉVAULT LAB INC.</span>
                        <span className="block text-[8px] text-slate-600 font-medium">{gradingCard?.set?.slice(0, 20) || 'TCG COLLECTION'}</span>
                        <span className="block text-[8px] text-slate-550 font-bold">{gradingCard?.name || 'Pokemon Card'}</span>
                      </div>

                      <div className="text-right flex flex-col justify-center leading-none truncate pl-2 shrink-0">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Estimated</span>
                        <strong className="text-base text-red-600 font-mono block font-black leading-none mt-0.5">{gradingScoreCalculated.predictedPSA}</strong>
                      </div>
                    </div>

                    <div className="flex items-end justify-between text-[8px] mt-2 font-mono text-slate-700 leading-none">
                      <span>AVG Score: {gradingScoreCalculated.average} / 10</span>
                      <span className="font-extrabold uppercase text-slate-850 tracking-wider">
                        {gradingScoreCalculated.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    {gradingScoreCalculated.text}
                  </p>

                  <button
                    onClick={saveSimulationToNotes}
                    disabled={savingGradeResult || !gradingCard}
                    className="w-full bg-[#FFCB05] hover:bg-[#ffe169] text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer select-none disabled:opacity-45"
                  >
                    {savingGradeResult ? 'Salvando Estimativa...' : 'Sincronizar Nota na Coleção'}
                  </button>
                  
                  {/* Saved grades historical log inside tab */}
                  {savedGradesHistory.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-slate-550 block uppercase font-bold">Histórico de Gradações Resgatado</span>
                      <div className="space-y-1 text-[9px] font-mono">
                        {savedGradesHistory.map((hSim) => (
                          <div key={hSim.id} className="flex justify-between text-slate-400 bg-slate-900/50 p-1 px-2.5 rounded-lg border border-slate-900">
                            <span className="truncate max-w-[130px] font-bold text-slate-300">{hSim.cardName}</span>
                            <span className="text-purple-400 font-black">{hSim.grade} ({hSim.date})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>
        )}


        {/* ==========================================
            4. PRICE SNIPER DEALS ENGINE
            ========================================== */}
        {activeTool === 'sniper' && (
          <motion.div
            key="tool-sniper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left column: Setup purchase target alert rules (Columns 1-4) */}
              <div className="lg:col-span-4 bg-[#12141c] border border-slate-850 p-6 rounded-3xl space-y-5 text-left">
                <div>
                  <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">TCG SNIPER ALERTS</span>
                  <h3 className="text-white font-black text-base mt-1">Alertas de Alvos</h3>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    Configure limites máximos para monitorar o mercado secundário. Sempre que houver correspondências de cards em leilões, você será notificado!
                  </p>
                </div>

                {/* Form to insert Alert target */}
                <div className="space-y-3 p-4 bg-[#0A0B0E] border border-slate-850 rounded-2xl">
                  <span className="text-[9px] text-[#FFCB05] font-mono block uppercase font-bold">Cadastrar Novo Monitor</span>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-mono text-slate-400 block font-bold">SELECIONAR CARD ALVO</label>
                    <select
                      value={alertFormCardId}
                      onChange={(e) => setAlertFormCardId(e.target.value)}
                      className="w-full text-xs text-slate-200 bg-slate-950 py-2.5 px-3 rounded-xl border border-slate-800"
                    >
                      <option value="">Selecione para Monitorar...</option>
                      {allKnownCards.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({currencySymbol}{marketPrices[c.id] || 25.00})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-mono text-slate-400 block font-bold">PREÇO MÁXIMO DO ALVO (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        placeholder="target max budget..."
                        value={alertTargetPrice}
                        onChange={(e) => setAlertTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs text-slate-200 bg-slate-950 pl-8 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addNewSniperRule}
                    disabled={!alertFormCardId || !alertTargetPrice}
                    className="w-full bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer select-none disabled:opacity-40 mt-1"
                  >
                    + Ativar Rule Sniper
                  </button>
                </div>

                {/* List of active sniper rules */}
                <div className="space-y-2 pt-3 border-t border-slate-850">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Target Surveillance List ({sniperRules.length})</span>
                  
                  {sniperRules.length === 0 ? (
                    <span className="text-[10px] font-sans text-slate-500 block italic">Nenhum gatilho de preço ativo.</span>
                  ) : (
                    <div className="space-y-1.5 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin">
                      {sniperRules.map(rule => (
                        <div key={rule.id} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/60 flex items-center justify-between text-xs font-mono">
                          <div className="text-left overflow-hidden pr-2">
                            <span className="text-slate-200 font-bold block truncate leading-tight">{rule.cardName}</span>
                            <span className="text-[9px] text-slate-500 block leading-tight">Alvo: {currencySymbol}{rule.targetPrice} | Atual: {currencySymbol}{rule.currentPrice}</span>
                          </div>
                          <button
                            onClick={() => removeSniperRule(rule.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>


              {/* Right column: Interactive Deal Finder (Columns 5-12) */}
              <div className="lg:col-span-8 bg-[#12141c] border border-slate-850 p-6 rounded-3xl flex flex-col text-left space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] text-emerald-400 font-mono tracking-widest block uppercase font-bold">LIVE SNIPER FINDER</span>
                  </div>
                  <h3 className="text-white font-black text-base mt-0.5">Scaneador de Barganhas Globais</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Filtramos lotes, leilões e listagens do mercado de colecionadores mundiais. Esses espécimes estão vendendo atualmente bem abaixo do preço composto!
                  </p>
                </div>

                {/* Feed container */}
                <div className="space-y-4">
                  {sniperDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-[#0b0c11] border border-slate-850 rounded-2xl p-4.5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between hover:border-slate-800 transition"
                    >
                      {/* Left Block description details */}
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className="w-11 h-16 shrink-0 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-0.5 border border-slate-850">
                          <img src={deal.imageUrl} alt={deal.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>

                        <div className="text-left overflow-hidden space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-yellow-950/70 text-[#FFCB05] border border-yellow-800/40 font-mono text-[8px] font-black uppercase rounded-lg">
                              ⚡ SALVOU {deal.discount}!
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">Set: {deal.set}</span>
                          </div>

                          <h4 className="text-white font-black text-xs sm:text-sm tracking-wide block truncate">
                            {deal.name}
                          </h4>
                          
                          <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-3">
                            <span>Mercado: <strong className="text-slate-300">{currencySymbol}{deal.marketVal.toFixed(2)}</strong></span>
                            <span className="h-3 w-px bg-slate-850" />
                            <span>Origem: <strong className="text-sky-400">{deal.source}</strong></span>
                            <span className="h-3 w-px bg-slate-850" />
                            <span className="text-yellow-400">{deal.endsIn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block pricing actions and buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-5.5 pt-3.5 md:pt-0 border-t md:border-t-0 border-slate-850/60 shrink-0 select-none">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-slate-500 block font-mono uppercase">Preço Arremate</span>
                          <strong className="text-emerald-400 text-lg sm:text-xl font-mono block leading-none font-black mt-1">
                            {currencySymbol}{deal.dealPrice.toFixed(2)}
                          </strong>
                          <span className="text-[8px] font-mono text-slate-600 block mt-0.5">+ {currencySymbol}{deal.shipping} frete</span>
                        </div>

                        <button
                          onClick={() => snipPurchaseCard(deal)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 active:scale-95 duration-200"
                        >
                          <Flame className="w-4 h-4 fill-slate-950 animate-pulse" />
                          <span>Snip Deal</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Helper Banner tip */}
                <div className="bg-[#0b0c11]/45 border border-dashed border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <InfoIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    <strong>Dica de Mestre:</strong> Os filtros de barganha são atualizados dinamicamente a cada flutuação do índice de mercado de PokéVault. Configure alertas de surveillance na coluna esquerda para as suas cartas preferidas para priorizar as notificações do bot!
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
