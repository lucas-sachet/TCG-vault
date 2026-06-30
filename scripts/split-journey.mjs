/**
 * Complete split of god components into feature folders (≤300 lines each).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const license = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

`;

const created = [];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(relPath, content) {
  const full = path.join(root, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
  const lines = content.split('\n').length;
  created.push({ path: relPath, lines });
  if (lines > 300) console.warn(`WARN ${lines}L: ${relPath}`);
}

function readLines(name) {
  return fs.readFileSync(path.join(root, 'src/components', `${name}.tsx`), 'utf8').split('\n');
}

function sliceLines(lines, start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function read(name) {
  return fs.readFileSync(path.join(root, 'src/components', `${name}.tsx`), 'utf8');
}

// ========== JOURNEY ==========
const jLines = readLines('JourneyTab');
const jDir = 'src/features/journey';

write(`${jDir}/types.ts`, `${license}import type { LucideIcon } from 'lucide-react';
import type { Card, CollectionItem, Binder, PriceSnapshot } from '../../types';

export interface JourneyTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  priceHistories: Record<string, PriceSnapshot[]>;
  binders: Binder[];
  onViewCardDetails: (cardId: string) => void;
  currencySymbol?: string;
  userEmail?: string;
}

export type JourneyEventType =
  | 'acquired' | 'additional_copy' | 'grading_submitted' | 'grade_received'
  | 'price_milestone' | 'personal_note' | 'photo_added' | 'binder_moved';

export interface JourneyEventMeta {
  notes?: string;
  photoFront?: string;
  photoBack?: string;
  binderName?: string;
  oldPrice?: number;
  newPrice?: number;
  gradeType?: string;
  gradeValue?: string | number;
  certNumber?: string;
}

export interface JourneyEvent {
  id: string;
  holdingId: string;
  cardId: string;
  card: Card;
  date: string;
  type: JourneyEventType;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
  holding: CollectionItem;
  meta?: JourneyEventMeta;
}

export type CinematicSlideType =
  | 'cover' | 'first' | 'high_value' | 'graded_gems' | 'best_note' | 'biggest_gainer' | 'compilation_flow';

export interface CinematicSlideStats {
  trainerName: string;
  trainerAvatar: string;
  cardCount: number;
  bindersCount: number;
  growthPct: number;
  financialGain: number;
  totalWorth: number;
}

export interface CinematicSlide {
  type: CinematicSlideType;
  title: string;
  subtitle: string;
  narrative: string;
  card?: Card;
  holding?: CollectionItem;
  stats?: CinematicSlideStats;
}

export interface ZoomedImageState { url: string; title: string; }
export type JourneyViewMode = 'timeline' | 'cinema';
`);

write(`${jDir}/journey-utils.ts`, `${license}export function addDays(dateStr: string, days: number, maxDateStr: string = '2026-06-15'): string {
  try {
    const dateValue = new Date(dateStr + 'T12:00:00');
    dateValue.setDate(dateValue.getDate() + days);
    const resultStr = dateValue.toISOString().split('T')[0];
    if (resultStr > maxDateStr) return maxDateStr;
    return resultStr;
  } catch {
    return dateStr;
  }
}

export const PRESET_AVATAR_LABELS: Record<string, string> = {
  'avatar-oak': '👴',
  'avatar-ash': '🧢',
  'avatar-misty': '💧',
  'avatar-pikachu': '⚡',
};
`);

const timelineFnBody = sliceLines(jLines, 152, 345);
write(`${jDir}/buildTimelineEvents.ts`, `${license}import {
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

${timelineFnBody}
  return list;
}
`);

write(`${jDir}/filterTimelineEvents.ts`, `${license}import type { JourneyEvent } from './types';

export interface FilterTimelineParams {
  timelineEvents: JourneyEvent[];
  searchQuery: string;
  selectedBinderId: string;
  eventTypeFilter: string;
  sortByRecent: boolean;
}

export function filterTimelineEvents(params: FilterTimelineParams): JourneyEvent[] {
  const { timelineEvents, searchQuery, selectedBinderId, eventTypeFilter, sortByRecent } = params;
  let list = [...timelineEvents];

  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    list = list.filter(event =>
      event.card.name.toLowerCase().includes(query) ||
      event.card.set.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    );
  }
  if (selectedBinderId !== 'ALL') {
    list = list.filter(event => event.holding.binderId === selectedBinderId);
  }
  if (eventTypeFilter !== 'ALL') {
    list = list.filter(event => event.type === eventTypeFilter);
  }
  list.sort((a, b) => {
    if (a.date !== b.date) {
      return sortByRecent ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    }
    return b.id.localeCompare(a.id);
  });
  return list;
}
`);

const cinematicBody = sliceLines(jLines, 404, 545);
write(`${jDir}/buildCinematicSlides.ts`, `${license}import type { Card, CollectionItem, Binder } from '../../types';
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

${cinematicBody.replace(/let slides: Array<\{[\s\S]*?\}> = \[\];/, 'let slides: CinematicSlide[] = [];')}
  return slides;
}
`);

write(`${jDir}/useTrainerProfile.ts`, `${license}'use client';

import { useMemo } from 'react';
import { PRESET_AVATAR_LABELS } from './journey-utils';

export function useTrainerProfile(userEmail: string) {
  const activeEmail = userEmail || (typeof localStorage !== 'undefined' ? localStorage.getItem('pokevault_currentUser') || '' : '');

  const trainerName = useMemo(() => {
    if (activeEmail) {
      const storedDisplay = localStorage.getItem(\`pokevault_displayName_\${activeEmail}\`);
      const storedNick = localStorage.getItem(\`pokevault_nickname_\${activeEmail}\`);
      return (storedNick?.trim() || storedDisplay?.trim() || 'Trainer Ash');
    }
    return 'Trainer Ash';
  }, [activeEmail]);

  const trainerAvatar = useMemo(() => {
    if (activeEmail) {
      const storedPic = localStorage.getItem(\`pokevault_profilePic_\${activeEmail}\`);
      if (storedPic) {
        if (storedPic.startsWith('data:')) return storedPic;
        return PRESET_AVATAR_LABELS[storedPic] || '👴';
      }
    }
    return '👴';
  }, [activeEmail]);

  return { trainerName, trainerAvatar };
}
`);

// JourneyHeader 626-674
write(`${jDir}/JourneyHeader.tsx`, `${license}'use client';

import { Clock, Film, Sparkles } from 'lucide-react';
import type { JourneyViewMode } from './types';

export interface JourneyHeaderProps {
  activeViewMode: JourneyViewMode;
  onViewModeChange: (mode: JourneyViewMode) => void;
}

export function JourneyHeader({ activeViewMode, onViewModeChange }: JourneyHeaderProps) {
  return (
${sliceLines(jLines, 626, 674).replace(/setActiveViewMode/g, 'onViewModeChange')}
  );
}
`);

// ImageZoomModal 1419-1448
write(`${jDir}/ImageZoomModal.tsx`, `${license}'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { ZoomedImageState } from './types';

export interface ImageZoomModalProps {
  zoomedImage: ZoomedImageState | null;
  onClose: () => void;
}

export function ImageZoomModal({ zoomedImage, onClose }: ImageZoomModalProps) {
  return (
    <AnimatePresence>
${sliceLines(jLines, 1421, 1448).replace(/setZoomedImage\(null\)/g, 'onClose()')}
    </AnimatePresence>
  );
}
`);

// JourneyTimelineView - filters 691-745 + events 748-925
write(`${jDir}/JourneyTimelineView.tsx`, `${license}'use client';

import { ArrowUpDown, BookOpen, Eye, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Binder } from '../../types';
import type { JourneyEvent, ZoomedImageState } from './types';

export interface JourneyTimelineViewProps {
  binders: Binder[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedBinderId: string;
  onSelectedBinderIdChange: (value: string) => void;
  eventTypeFilter: string;
  onEventTypeFilterChange: (value: string) => void;
  sortByRecent: boolean;
  onSortByRecentChange: (value: boolean) => void;
  filteredTimelineEvents: JourneyEvent[];
  currencySymbol: string;
  onViewCardDetails: (cardId: string) => void;
  onZoomImage: (image: ZoomedImageState) => void;
}

export function JourneyTimelineView({
  binders,
  searchQuery,
  onSearchQueryChange,
  selectedBinderId,
  onSelectedBinderIdChange,
  eventTypeFilter,
  onEventTypeFilterChange,
  sortByRecent,
  onSortByRecentChange,
  filteredTimelineEvents,
  currencySymbol,
  onViewCardDetails,
  onZoomImage,
}: JourneyTimelineViewProps) {
  return (
    <motion.div
      key="timeline-container-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
${sliceLines(jLines, 691, 745).replace('setSearchQuery', 'onSearchQueryChange').replace('setSelectedBinderId', 'onSelectedBinderIdChange').replace('setEventTypeFilter', 'onEventTypeFilterChange').replace('setSortByRecent(!sortByRecent)', 'onSortByRecentChange(!sortByRecent)')}
      <div className="relative py-4 text-left">
${sliceLines(jLines, 749, 925).replace(/setZoomedImage\(\{ url: event\.meta!\.photoFront!, title: `\$\{event\.card\.name\} \(Fotografia do Espécime - Frente\)` \}\)/g, 'onZoomImage({ url: event.meta!.photoFront!, title: `${event.card.name} (Fotografia do Espécime - Frente)` })').replace(/setZoomedImage\(\{ url: event\.meta!\.photoBack!, title: `\$\{event\.card\.name\} \(Fotografia do Espécime - Verso\)` \}\)/g, 'onZoomImage({ url: event.meta!.photoBack!, title: `${event.card.name} (Fotografia do Espécime - Verso)` })')}
      </div>
    </motion.div>
  );
}
`);

// JourneyCinemaStage - left panel only (col-span-5)
write(`${jDir}/JourneyCinemaStage.tsx`, `${license}'use client';

import { ChevronLeft, ChevronRight, Crown, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card, CollectionItem } from '../../types';
import type { CinematicSlide } from './types';

export interface JourneyCinemaStageProps {
  cinematicSlides: CinematicSlide[];
  currentSlideIdx: number;
  activeSlide: CinematicSlide | null;
  activeCompilationCardIndex: number;
  compilationCards: Array<{ item: CollectionItem; card?: Card }>;
  activeCompObj: { item: CollectionItem; card?: Card } | null;
  tilt: { x: number; y: number };
  glarePosition: { x: number; y: number };
  onViewCardDetails: (cardId: string) => void;
  onCardMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCardMouseLeave: () => void;
  onCompilationIndexChange: (updater: (prev: number) => number) => void;
}

export function JourneyCinemaStage({
  cinematicSlides,
  currentSlideIdx,
  activeSlide,
  activeCompilationCardIndex,
  compilationCards,
  activeCompObj,
  tilt,
  glarePosition,
  onViewCardDetails,
  onCardMouseMove,
  onCardMouseLeave,
  onCompilationIndexChange,
}: JourneyCinemaStageProps) {
  return (
${sliceLines(jLines, 951, 1182)
  .replace(/handleCardMouseMove/g, 'onCardMouseMove')
  .replace(/handleCardMouseLeave/g, 'onCardMouseLeave')
  .replace(/setActiveCompilationCardIndex/g, 'onCompilationIndexChange')}
  );
}
`);

// JourneyCinemaNarrative 1185-1411
write(`${jDir}/JourneyCinemaNarrative.tsx`, `${license}'use client';

import {
  Award, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Crown,
  Film, Pause, Play, ShieldCheck, Tag, Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Card, CollectionItem } from '../../types';
import type { CinematicSlide } from './types';

export interface JourneyCinemaNarrativeProps {
  activeSlide: CinematicSlide | null;
  currentSlideIdx: number;
  cinematicSlides: CinematicSlide[];
  isPlaying: boolean;
  currencySymbol: string;
  marketPrices: Record<string, number>;
  activeCompObj: { item: CollectionItem; card?: Card } | null;
  onTogglePlaying: () => void;
  onSlideIndexChange: (updater: (prev: number) => number) => void;
  onSetSlideIndex: (index: number) => void;
  onStopPlaying: () => void;
}

export function JourneyCinemaNarrative({
  activeSlide,
  currentSlideIdx,
  cinematicSlides,
  isPlaying,
  currencySymbol,
  marketPrices,
  activeCompObj,
  onTogglePlaying,
  onSlideIndexChange,
  onSetSlideIndex,
  onStopPlaying,
}: JourneyCinemaNarrativeProps) {
  return (
${sliceLines(jLines, 1185, 1411)
  .replace(/setIsPlaying\(!isPlaying\)/g, 'onTogglePlaying()')
  .replace(/setIsPlaying\(false\);\s*\n\s*setCurrentSlideIdx/g, 'onStopPlaying();\n                            onSlideIndexChange')
  .replace(/setCurrentSlideIdx\(\(prev\)/g, 'onSlideIndexChange((prev)')
  .replace(/setCurrentSlideIdx\(dotIdx\)/g, 'onSetSlideIndex(dotIdx)')}
  );
}
`);

// JourneyTabContent orchestrator
write(`${jDir}/JourneyTabContent.tsx`, `${license}'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import type { JourneyTabProps, JourneyViewMode, ZoomedImageState } from './types';
import { buildTimelineEvents } from './buildTimelineEvents';
import { buildCinematicSlides } from './buildCinematicSlides';
import { filterTimelineEvents } from './filterTimelineEvents';
import { useTrainerProfile } from './useTrainerProfile';
import { JourneyHeader } from './JourneyHeader';
import { JourneyTimelineView } from './JourneyTimelineView';
import { JourneyCinemaStage } from './JourneyCinemaStage';
import { JourneyCinemaNarrative } from './JourneyCinemaNarrative';
import { Film } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageZoomModal } from './ImageZoomModal';

export function JourneyTabContent({
  cards,
  collectionItems,
  marketPrices,
  priceHistories,
  binders,
  onViewCardDetails,
  currencySymbol = '$',
  userEmail = '',
}: JourneyTabProps) {
  const [activeViewMode, setActiveViewMode] = useState<JourneyViewMode>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBinderId, setSelectedBinderId] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [sortByRecent, setSortByRecent] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<ZoomedImageState | null>(null);

  const { trainerName, trainerAvatar } = useTrainerProfile(userEmail);

  const timelineEvents = useMemo(
    () => buildTimelineEvents({ collectionItems, cards, binders, priceHistories, currencySymbol }),
    [collectionItems, cards, binders, priceHistories, currencySymbol]
  );

  const filteredTimelineEvents = useMemo(
    () => filterTimelineEvents({ timelineEvents, searchQuery, selectedBinderId, eventTypeFilter, sortByRecent }),
    [timelineEvents, searchQuery, selectedBinderId, eventTypeFilter, sortByRecent]
  );

  const cinematicSlides = useMemo(
    () => buildCinematicSlides({ collectionItems, cards, binders, marketPrices, trainerName, trainerAvatar, timelineEvents, currencySymbol }),
    [collectionItems, cards, binders.length, marketPrices, trainerName, trainerAvatar, timelineEvents, currencySymbol]
  );

  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const activeSlide = useMemo(() => {
    if (cinematicSlides.length === 0) return null;
    return cinematicSlides[currentSlideIdx];
  }, [cinematicSlides, currentSlideIdx]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  function handleCardMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x, y });
    const tiltX = (event.clientX - rect.left) / rect.width - 0.5;
    const tiltY = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: tiltX * 24, y: -tiltY * 24 });
  }

  function handleCardMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentSlideIdx((prev) => (prev >= cinematicSlides.length - 1 ? 0 : prev + 1));
      }, 7000);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, cinematicSlides]);

  const [activeCompilationCardIndex, setActiveCompilationCardIndex] = useState(0);
  const compilationCards = useMemo(
    () => collectionItems.map(item => {
      const card = cards.find(c => c.id === item.cardId);
      return { item, card };
    }).filter(c => c.card !== undefined),
    [collectionItems, cards]
  );

  const activeCompObj = useMemo(() => {
    if (compilationCards.length === 0) return null;
    return compilationCards[activeCompilationCardIndex];
  }, [compilationCards, activeCompilationCardIndex]);

  useEffect(() => {
    setTilt({ x: 0, y: 0 });
    setIsPlaying(false);
  }, [activeViewMode]);

  return (
    <div className="space-y-6">
      <JourneyHeader activeViewMode={activeViewMode} onViewModeChange={setActiveViewMode} />
      <AnimatePresence mode="wait">
        {activeViewMode === 'timeline' ? (
          <JourneyTimelineView
            binders={binders}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedBinderId={selectedBinderId}
            onSelectedBinderIdChange={setSelectedBinderId}
            eventTypeFilter={eventTypeFilter}
            onEventTypeFilterChange={setEventTypeFilter}
            sortByRecent={sortByRecent}
            onSortByRecentChange={setSortByRecent}
            filteredTimelineEvents={filteredTimelineEvents}
            currencySymbol={currencySymbol}
            onViewCardDetails={onViewCardDetails}
            onZoomImage={setZoomedImage}
          />
        ) : (
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
                <JourneyCinemaStage
                  cinematicSlides={cinematicSlides}
                  currentSlideIdx={currentSlideIdx}
                  activeSlide={activeSlide}
                  activeCompilationCardIndex={activeCompilationCardIndex}
                  compilationCards={compilationCards}
                  activeCompObj={activeCompObj}
                  tilt={tilt}
                  glarePosition={glarePosition}
                  onViewCardDetails={onViewCardDetails}
                  onCardMouseMove={handleCardMouseMove}
                  onCardMouseLeave={handleCardMouseLeave}
                  onCompilationIndexChange={setActiveCompilationCardIndex}
                />
                <JourneyCinemaNarrative
                  activeSlide={activeSlide}
                  currentSlideIdx={currentSlideIdx}
                  cinematicSlides={cinematicSlides}
                  isPlaying={isPlaying}
                  currencySymbol={currencySymbol}
                  marketPrices={marketPrices}
                  activeCompObj={activeCompObj}
                  onTogglePlaying={() => setIsPlaying(!isPlaying)}
                  onSlideIndexChange={setCurrentSlideIdx}
                  onSetSlideIndex={setCurrentSlideIdx}
                  onStopPlaying={() => setIsPlaying(false)}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <ImageZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />
    </div>
  );
}
`);

write(`${jDir}/index.ts`, `${license}export type { JourneyTabProps } from './types';
export { JourneyTabContent } from './JourneyTabContent';
export { JourneyHeader } from './JourneyHeader';
export { JourneyTimelineView } from './JourneyTimelineView';
export { JourneyCinemaStage } from './JourneyCinemaStage';
export { JourneyCinemaNarrative } from './JourneyCinemaNarrative';
export { ImageZoomModal } from './ImageZoomModal';
export { buildTimelineEvents } from './buildTimelineEvents';
export { buildCinematicSlides } from './buildCinematicSlides';
export { filterTimelineEvents } from './filterTimelineEvents';
export { useTrainerProfile } from './useTrainerProfile';
`);

write('src/components/JourneyTab.tsx', `${license}'use client';

export { JourneyTabContent as JourneyTab } from '../features/journey';
export type { JourneyTabProps } from '../features/journey';
`);

console.log('\\n=== JOURNEY FILES ===');
created.filter(f => f.path.includes('journey')).forEach(f => console.log(`${f.lines}\\t${f.path}`));
