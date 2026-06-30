/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Share2, 
  Download, 
  Upload, 
  PieChart, 
  TrendingUp, 
  ShieldAlert, 
  Check, 
  Info,
  HelpCircle,
  FileSpreadsheet,
  Award,
  Flame,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Card, CollectionItem, CollectionGoal } from '../types';
import { LANGUAGE_METADATA } from '../data/pokemonData';
import { GoalsSection } from './GoalsSection';

interface AnalyticsTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  onImportCollection: (importedItems: CollectionItem[], importedCards: Card[]) => void;
  currencySymbol?: string;
  goals: CollectionGoal[];
  onAddGoal: (goal: Omit<CollectionGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  cards,
  collectionItems,
  marketPrices,
  onImportCollection,
  currencySymbol = '$',
  goals,
  onAddGoal,
  onDeleteGoal
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isShowingImportBox, setIsShowingImportBox] = useState(false);
  const [showMilestonesDetail, setShowMilestonesDetail] = useState(false);

  // Financial aggregates
  const totalCost = collectionItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  const totalCurrentValue = collectionItems.reduce((sum, item) => {
    const marketVal = marketPrices[item.cardId] || 0;
    return sum + (marketVal * item.quantity);
  }, 0);

  const profitLoss = totalCurrentValue - totalCost;
  const overallRoi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  // 1. Language Allocations
  const languageAllocations = React.useMemo(() => {
    const map: Record<string, number> = {};
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card) {
        const lang = card.language;
        const value = (marketPrices[card.id] || 0) * item.quantity;
        map[lang] = (map[lang] || 0) + value;
      }
    });

    return Object.entries(map).map(([lang, value]) => {
      const metadata = LANGUAGE_METADATA[lang as keyof typeof LANGUAGE_METADATA] || { flag: '🌐', label: lang };
      const percentage = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
      return { lang, value, percentage, flag: metadata.flag, label: metadata.label };
    }).sort((a,b) => b.value - a.value);
  }, [collectionItems, cards, marketPrices, totalCurrentValue]);

  // 2. Set Allocations
  const setAllocations = React.useMemo(() => {
    const map: Record<string, number> = {};
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card) {
        const set = card.set;
        const value = (marketPrices[card.id] || 0) * item.quantity;
        map[set] = (map[set] || 0) + value;
      }
    });

    return Object.entries(map).map(([set, value]) => {
      const percentage = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
      return { set, value, percentage };
    }).sort((a,b) => b.value - a.value).slice(0, 5); // top 5 sets
  }, [collectionItems, cards, marketPrices, totalCurrentValue]);

  // 3. Rarity Allocations
  const rarityAllocations = React.useMemo(() => {
    const map: Record<string, number> = {};
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card) {
        const rarity = card.rarity;
        const value = (marketPrices[card.id] || 0) * item.quantity;
        map[rarity] = (map[rarity] || 0) + value;
      }
    });

    return Object.entries(map).map(([rarity, value]) => {
      const percentage = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
      return { rarity, value, percentage };
    }).sort((a,b) => b.value - a.value);
  }, [collectionItems, cards, marketPrices, totalCurrentValue]);

  // Collection Diversity rating and description
  const collectionDiversity = React.useMemo(() => {
    if (collectionItems.length === 0) {
      return { rating: 'Standard', setsCount: 0, langsCount: 0, description: 'Add trade cards to compile diversity.' };
    }
    const setSet = new Set<string>();
    const langSet = new Set<string>();
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card) {
        setSet.add(card.set);
        langSet.add(card.language);
      }
    });
    const setsCount = setSet.size;
    const langsCount = langSet.size;
    
    let rating = 'Standard';
    let description = 'Focusing on a few select cards.';
    if (setsCount >= 4 && langsCount >= 2) {
      rating = 'Master Curator';
      description = 'Splendid variety across expansion series and languages!';
    } else if (setsCount >= 2 || langsCount >= 2) {
      rating = 'Varied Binder';
      description = 'Healthy mix of collections and visual varieties.';
    } else if (setsCount > 0) {
      rating = 'Dedicated Collector';
      description = 'Laser-focused on specific card sets.';
    }
    return { rating, setsCount, langsCount, description };
  }, [collectionItems, cards]);

  // Most Valuable Pokémon (Species) representation
  const mostValuablePokemon = React.useMemo(() => {
    if (collectionItems.length === 0) return null;
    const pokemonValTable: Record<string, number> = {};
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card) {
        const baseName = card.name.split(' ')[0].split('-')[0].split('(')[0].trim();
        const valIndex = (marketPrices[card.id] || 0) * item.quantity;
        pokemonValTable[baseName] = (pokemonValTable[baseName] || 0) + valIndex;
      }
    });
    
    const sorted = Object.entries(pokemonValTable).sort((a,b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const [name, val] = sorted[0];
    return { name, val };
  }, [collectionItems, cards, marketPrices]);

  // Most Valuable Set representation
  const mostValuableSet = React.useMemo(() => {
    if (setAllocations.length === 0) return null;
    return setAllocations[0];
  }, [setAllocations]);

  // Most Valuable Language representation
  const mostValuableLanguage = React.useMemo(() => {
    if (languageAllocations.length === 0) return null;
    return languageAllocations[0];
  }, [languageAllocations]);

  // Fastest Growing Card calculation based on ROI
  const fastestGrowingCard = React.useMemo((): { card: Card; percent: number; isFallback: boolean } | null => {
    if (collectionItems.length === 0) return null;
    let bestItem: CollectionItem | null = null;
    let bestCard: Card | null = null;
    let bestPercent = -Infinity;
    
    collectionItems.forEach(item => {
      const card = cards.find(c => c.id === item.cardId);
      if (card && item.purchasePrice > 0) {
        const current = marketPrices[item.cardId] || 0;
        const percent = ((current - item.purchasePrice) / item.purchasePrice) * 100;
        if (percent > bestPercent) {
          bestPercent = percent;
          bestItem = item;
          bestCard = card;
        }
      }
    });

    if (!bestCard) {
      let highestPrice = -1;
      collectionItems.forEach(item => {
        const card = cards.find(c => c.id === item.cardId);
        if (card) {
          const current = marketPrices[item.cardId] || 0;
          if (current > highestPrice) {
            highestPrice = current;
            bestCard = card;
          }
        }
      });
      if (bestCard) {
        return { card: bestCard, percent: 0, isFallback: true };
      }
    }
    
    return bestCard ? { card: bestCard, percent: bestPercent, isFallback: false } : null;
  }, [collectionItems, cards, marketPrices]);

  // Collection Milestones check values
  const collectionMilestones = React.useMemo(() => {
    const hasCard = collectionItems.length > 0;
    const setSet = new Set(collectionItems.map(item => cards.find(c => c.id === item.cardId)?.set).filter(Boolean));
    const multiSet = setSet.size >= 2;
    const hasSpecial = collectionItems.some(item => {
      const card = cards.find(c => c.id === item.cardId);
      return card && (card.rarity.includes('Special') || card.rarity.includes('Illustration') || card.rarity.includes('Secret') || card.rarity.includes('Shiny') || card.rarity.includes('Ultra'));
    });
    const hasGraded = collectionItems.some(item => item.gradeType !== 'Raw');
    const valueMilestone = totalCurrentValue >= 1000;

    const checklist = [
      { id: 'm1', label: 'First Card Slipped In', description: 'Add your first TCG Vault trade card', achieved: hasCard },
      { id: 'm2', label: 'Expansion Binder Explorer', description: 'Collect cards from 2 or more sets', achieved: multiSet },
      { id: 'm3', label: 'Pristine Grader Badge', description: 'Acquire at least one graded slab', achieved: hasGraded },
      { id: 'm4', label: 'Chasing Secret Rarities', description: 'Own at least 1 Special Illustration or Secret', achieved: hasSpecial },
      { id: 'm5', label: 'Legendary Valuation Master', description: 'Total portfolio reaches over $1,000 threshold', achieved: valueMilestone },
    ];

    const completedCount = checklist.filter(m => m.achieved).length;
    const percent = Math.min(100, Math.round((completedCount / checklist.length) * 100));

    return { checklist, completedCount, totalCount: checklist.length, percent };
  }, [collectionItems, cards, totalCurrentValue]);

  // Handle building dynamic client-side CSV Exporter file downloads
  const handleCSVExport = () => {
    if (collectionItems.length === 0) {
      return;
    }

    // Define CSV header records
    const headers = ['CardID', 'CardName', 'ExpansionSet', 'CardNumber', 'Rarity', 'Language', 'PurchaseDate', 'PurchasePriceUSD', 'Quantity', 'GradeType', 'GradeScore', 'Notes'];
    
    const rows = collectionItems.map(item => {
      const card = cards.find(c => c.id === item.cardId)!;
      return [
        item.cardId,
        `"${card.name.replace(/"/g, '""')}"`,
        `"${card.set.replace(/"/g, '""')}"`,
        card.supertype === 'Trainer' ? 'Trainer' : card.number,
        `"${card.rarity.replace(/"/g, '""')}"`,
        card.language,
        item.purchaseDate,
        item.purchasePrice,
        item.quantity,
        item.gradeType,
        item.gradeValue || 'Raw',
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TCGVault_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Drag controls
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Paste / upload manual parsing
  const handleManualCSVImport = (textToParse: string) => {
    try {
      const cleanString = textToParse.trim();
      if (!cleanString) return;

      const lines = cleanString.split('\n');
      if (lines.length < 2) throw new Error('CSV must contain header row and content records!');

      const items: CollectionItem[] = [];
      const newCards: Card[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple regex parser that splits on comma but respects quotes
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const fields = match.map(f => f.replace(/^"|"$/g, '').trim());

        if (fields.length < 9) continue; // skip incomplete records

        // Map column layouts
        const cardId = fields[0] || `csv-item-${Date.now()}-${i}`;
        const cardName = fields[1] || 'Unknown Card';
        const set = fields[2] || 'Custom expansion Set';
        const number = fields[3] || '000/000';
        const rarity = fields[4] || 'Rare Holo';
        const language = (fields[5] || 'EN') as any;
        const purchaseDate = fields[6] || new Date().toISOString().split('T')[0];
        const purchasePrice = Number(fields[7]) || 1;
        const quantity = Number(fields[8]) || 1;
        const gradeType = (fields[9] || 'Raw') as any;
        const gradeVal = fields[10] || 'Raw';
        const notes = fields[11] || '';

        // Form templates
        const mockUrl = `https://placehold.co/400x560/1a1d24/ffffff?text=${encodeURIComponent(cardName)}`;

        const cardObject: Card = {
          id: cardId,
          name: cardName,
          set,
          number,
          rarity,
          language,
          imageUrl: mockUrl
        };

        const itemObject: CollectionItem = {
          id: `csv-row-${Date.now()}-${i}`,
          cardId: cardObject.id,
          purchaseDate,
          purchasePrice,
          currency: 'USD',
          quantity,
          gradeType,
          gradeValue: gradeType === 'Raw' ? 'Raw' : gradeVal,
          notes: notes || undefined
        };

        newCards.push(cardObject);
        items.push(itemObject);
      }

      if (items.length === 0) throw new Error('No valid collectible records found.');

      onImportCollection(items, newCards);
      setImportStatus('SUCCESS');
      setCsvText('');
      setTimeout(() => setImportStatus('IDLE'), 4000);
    } catch (err: any) {
      console.error(err);
      setImportStatus('ERROR');
      setTimeout(() => setImportStatus('IDLE'), 4000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleManualCSVImport(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Collector Overview stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Cost vs Market visual tracker */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-amber-500 font-mono tracking-wider uppercase font-black block">Valuation Allocation Overview</span>
            <p className="text-xs text-slate-400 mt-1">Acquisition cost versus current collector group market value.</p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <span className="text-slate-400">Estimated Worth</span>
              <span className="text-yellow-500 font-bold">{currencySymbol}{totalCurrentValue.toLocaleString()}</span>
            </div>
            
            {/* Visual allocation progression track bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 flex">
              <div 
                className="bg-[#3B4CCA] h-full" 
                style={{ width: `${totalCurrentValue > 0 ? (totalCost / totalCurrentValue) * 100 : 50}%` }}
                title="Acquisition Cost"
              />
              <div 
                className="bg-green-500 flex-grow h-full" 
                title="Collection Appreciation"
              />
            </div>

            <div className="flex justify-between items-baseline text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#3B4CCA] rounded-full inline-block" />
                <span>Acquisition ({totalCurrentValue > 0 ? Math.round((totalCost/totalCurrentValue)*100) : 0}%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                <span>Appreciation ({totalCurrentValue > 0 ? Math.round((profitLoss/totalCurrentValue)*100) : 0}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Collection Diversity Widget */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-black block">Collection Diversity</span>
              <span className="font-mono text-[9px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-indigo-300 font-bold">Diversity Metric</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Evaluates expansion variety and language distribution of collected card copies.</p>
          </div>

          <div className="mt-4 flex flex-col justify-end">
            <span className={`font-mono text-xl sm:text-2xl font-black ${
              collectionDiversity.rating === 'Master Curator' ? 'text-yellow-400 animate-pulse' : 'text-indigo-400'
            }`}>
              {collectionDiversity.rating}
            </span>
            <div className="flex justify-between items-center mt-1 text-[10px] font-semibold text-slate-500 font-mono">
              <span>{collectionDiversity.description}</span>
              <span className="text-slate-400 font-bold shrink-0">
                Sets: {collectionDiversity.setsCount} | Langs: {collectionDiversity.langsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Collection Milestones checklist trigger widget */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-black block">Collection Milestones</span>
              <button
                onClick={() => setShowMilestonesDetail(!showMilestonesDetail)}
                className="text-[9px] font-mono text-emerald-400 hover:text-white bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded-lg font-bold uppercase cursor-pointer"
              >
                {showMilestonesDetail ? 'Collapse' : 'Inspect'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Active Milestones tracking standard collector achievements.</p>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-500 uppercase font-black">UNLOCKED ITEMS</span>
              <span className="font-extrabold text-emerald-400">{collectionMilestones.completedCount} / {collectionMilestones.totalCount} Achieved</span>
            </div>
            
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 flex">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${collectionMilestones.percent}%` }}
              />
            </div>
            
            <div className="text-[9px] text-slate-500 font-mono text-right font-bold uppercase">{collectionMilestones.percent}% Complete</div>
          </div>
        </div>
      </div>

      {/* Expanded Collection Milestones Detail Checklist Drawer */}
      {showMilestonesDetail && (
        <div className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-3.5 animate-fadeIn">
          <div className="pb-2 border-b border-slate-800 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>TCG Vault Collector Achievements Checklist</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-500 font-bold">{collectionMilestones.completedCount} Reached</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {collectionMilestones.checklist.map(milestone => (
              <div 
                key={milestone.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  milestone.achieved 
                    ? 'bg-[#15231F] border-emerald-500/30' 
                    : 'bg-[#14161E]/40 border-slate-900 opacity-60'
                }`}
              >
                <div className={`p-1.5 rounded-lg border ${
                  milestone.achieved 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  <Check className={`w-3.5 h-3.5 ${milestone.achieved ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${milestone.achieved ? 'text-emerald-400' : 'text-slate-400'}`}>{milestone.label}</p>
                  <p className="text-[9px] text-slate-500 truncate">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New collector highlights: Most Valuable Pokemon, Set, Language and Fastest Grow Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Most Valuable Pokémon Card */}
        <div className="bg-[#1A1D24] p-4 border border-slate-800 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-wider">Most Valuable Pokémon</p>
            <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 truncate uppercase">
              {mostValuablePokemon ? mostValuablePokemon.name : 'None Logged'}
            </h4>
            <p className="font-mono text-[10px] text-yellow-500 font-bold mt-0.5">
              {mostValuablePokemon ? `${currencySymbol}${mostValuablePokemon.val.toLocaleString()}` : '--'} value
            </p>
          </div>
        </div>

        {/* Most Valuable Set Card */}
        <div className="bg-[#1A1D24] p-4 border border-slate-800 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
            <Award className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-wider">Most Valuable Set</p>
            <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 truncate uppercase">
              {mostValuableSet ? mostValuableSet.set : 'None Logged'}
            </h4>
            <p className="font-mono text-[10px] text-emerald-400 font-bold mt-0.5">
              {mostValuableSet ? `${mostValuableSet.percentage.toFixed(0)}% allocation` : '--'}
            </p>
          </div>
        </div>

        {/* Most Valuable Language Card */}
        <div className="bg-[#1A1D24] p-4 border border-slate-800 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-wider">Most Valuable Language</p>
            <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 truncate uppercase flex items-center gap-1">
              {mostValuableLanguage ? (
                <>
                  <span>{mostValuableLanguage.flag}</span>
                  <span>{mostValuableLanguage.label}</span>
                </>
              ) : (
                <span>None Logged</span>
              )}
            </h4>
            <p className="font-mono text-[10px] text-blue-400 font-bold mt-0.5">
              {mostValuableLanguage ? `${currencySymbol}${mostValuableLanguage.value.toLocaleString()}` : '--'}
            </p>
          </div>
        </div>

        {/* Fastest Growing Card copies */}
        <div className="bg-[#1A1D24] p-4 border border-slate-800 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 shrink-0">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-wider">Fastest Growing Card</p>
            <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 truncate uppercase">
              {fastestGrowingCard ? fastestGrowingCard.card.name : 'None Logged'}
            </h4>
            <p className="font-mono text-[10px] text-rose-400 font-extrabold mt-0.5 flex items-center gap-1">
              {fastestGrowingCard ? (
                fastestGrowingCard.isFallback ? (
                  <span>Highest Value</span>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 text-rose-400 shrink-0 inline" />
                    <span>+{fastestGrowingCard.percent.toFixed(0)}% growth</span>
                  </>
                )
              ) : (
                <span>Requires purchase price</span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Diversification Panels: Language, Set, and Rarity custom bar graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Language Allocations */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <PieChart className="w-4 h-4 text-[#FFCB05]" />
              <span>Language Weights</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-bold">COLLECTION %</span>
          </div>

          {collectionItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No card distribution weights logged.</p>
          ) : (
            <div className="space-y-3">
              {languageAllocations.map(alloc => (
                <div key={alloc.lang} className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-baseline">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span>{alloc.flag}</span>
                      <span>{alloc.label}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-400">{alloc.percentage.toFixed(0)}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${alloc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Top Sets Allocation */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Expansion Set Weight</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-bold">COLLECTION %</span>
          </div>

          {collectionItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No card distribution weights logged.</p>
          ) : (
            <div className="space-y-3">
              {setAllocations.map(alloc => (
                <div key={alloc.set} className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold truncate max-w-[170px]">{alloc.set}</span>
                    <span className="font-mono font-bold text-slate-400 shrink-0">{alloc.percentage.toFixed(0)}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${alloc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Rarity Weights */}
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4 text-purple-450" />
              <span>Rarity Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-bold">COLLECTION %</span>
          </div>

          {collectionItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No card distribution weights logged.</p>
          ) : (
            <div className="space-y-3">
              {rarityAllocations.map(alloc => (
                <div key={alloc.rarity} className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold truncate max-w-[150px]">{alloc.rarity.replace('Illustration', 'Illust')}</span>
                    <span className="font-mono font-bold text-slate-400 shrink-0">{alloc.percentage.toFixed(0)}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full" 
                      style={{ width: `${alloc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Interactive Collection Goals Section */}
      <GoalsSection
        cards={cards}
        collectionItems={collectionItems}
        marketPrices={marketPrices}
        goals={goals}
        onAddGoal={onAddGoal}
        onDeleteGoal={onDeleteGoal}
        currencySymbol={currencySymbol}
      />

      {/* CSV Import / Export Console block */}
      <section id="csv-console-panel" className="bg-[#1E222B] border border-indigo-950 p-5 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-center">
        
        {/* Left explanation */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
            <h3 className="font-black text-sm uppercase text-slate-200 tracking-wider">CSV Data Portability</h3>
          </div>
          <p className="text-xs text-slate-300">
            Export card transaction rosters into Excel-ready spreadsheets, or upload physical `.csv` indexes to instantly bootstrap your collection.
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span>Automatic offline parses</span>
            <span>•</span>
            <span>Excel / Sheets compatible</span>
          </div>
        </div>

        {/* Right buttons array */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto text-xs font-bold">
          <button
            id="analytics-csv-export-btn"
            onClick={handleCSVExport}
            disabled={collectionItems.length === 0}
            className={`flex items-center justify-center gap-2 font-bold py-3 px-5 rounded-xl border transition-all scale-100 ${
              collectionItems.length === 0
                ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700 hover:scale-102 active:scale-98'
            }`}
            title={collectionItems.length === 0 ? "Add cards to your collection to enable CSV downloads" : "Export collection data as CSV"}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>EXPORT COLLECTION CSV</span>
          </button>

          <button
            id="analytics-csv-import-toggle-btn"
            onClick={() => setIsShowingImportBox(!isShowingImportBox)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-600 text-white font-bold py-3 px-5 rounded-xl text-center shadow-lg transition-all scale-100 hover:scale-102 active:scale-98"
          >
            <Upload className="w-4 h-4 text-yellow-300" />
            <span>IMPORT COLLECTION CSV</span>
          </button>
        </div>
      </section>

      {/* CSV Drag and Paste Modal Box */}
      {isShowingImportBox && (
        <div 
          id="csv-import-box-container"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-slate-950 p-5 rounded-2xl border ${
            dragActive ? 'border-yellow-500 bg-yellow-950/5' : 'border-slate-800'
          } space-y-4 animate-fadeIn`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
              <span>CSV Drag & Upload Station</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-[#FFCB05] font-normal tracking-normal uppercase">Beta</span>
            </h4>
            <button 
              onClick={() => setIsShowingImportBox(false)}
              className="text-slate-500 hover:text-white text-xs font-bold font-mono"
            >
              Close x
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-4">
            Drag any TCG Vault-format CSV spreadsheet drop-square, or copy-paste CSV content rows directly inside the console text field below.
          </p>

          <div className="space-y-2">
            <textarea
              id="csv-manual-paste-area"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="CardID,CardName,ExpansionSet,CardNumber,Rarity,Language,PurchaseDate,PurchasePriceUSD,Quantity,GradeType,GradeScore,Notes&#10;char-en-obf-223,Charizard ex,Obsidian Flames,223/197,Special Illustration Rare,EN,2025-08-12,120,1,Raw,Raw,Local raw deal"
              className="w-full bg-slate-900 border border-slate-850 text-slate-100 font-mono text-[10px] rounded-xl p-3 min-h-[110px] focus:outline-none"
            />
          </div>

          {/* Import diagnostic logs */}
          {importStatus === 'SUCCESS' && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2.5 rounded-xl text-[11px] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Roster index synchronisation complete! Card items parsed and loaded to local collection storage.</span>
            </div>
          )}

          {importStatus === 'ERROR' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Failed to parse CSV lines. Make sure columns match requested sequence schema header.</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-[9px] text-slate-500 italic block font-mono">HEADER REQUIREMENT MATCHES: CardID,CardName,ExpansionSet,CardNumber,Rarity,Language...</span>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCsvText('')}
                className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 font-bold"
              >
                Clear text
              </button>
              
              <button
                id="submit-csv-records-btn"
                onClick={() => handleManualCSVImport(csvText)}
                disabled={!csvText.trim()}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-45 text-slate-950 font-black px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
              >
                Load CSV Entries
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
