/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

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
