import React from 'react';
import {
  Award,
  Calendar,
  Grid,
  History,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { Card } from '../../types';
import type { JourneyTimelineEvent } from './cardDetailsTypes';
import { formatJournalDate } from './formatJournalDate';

interface CardDetailsJourneyPanelProps {
  card: Card;
  journeyTimeline: JourneyTimelineEvent[];
  imageError: boolean;
}

export const CardDetailsJourneyPanel: React.FC<CardDetailsJourneyPanelProps> = ({
  card,
  journeyTimeline,
  imageError
}) => {
  if (journeyTimeline.length === 0) return null;

  return (
    <div className="border-t border-slate-800/60 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm uppercase text-slate-100 tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-[#FFCB05]" />
          <span>Collection Journey Journal</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
          {journeyTimeline.length} memorable events
        </span>
      </div>

      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        A chronicle of physical acquisitions, certifications, market quote benchmarks, and curators observations registered for this rare print edition.
      </p>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-550/80 before:via-blue-500/60 before:to-purple-500/25 before:rounded">
        {journeyTimeline.map((item, index) => {
          let iconElement = <History className="w-3 h-3" />;
          let colorClasses = 'bg-slate-900 text-slate-400 border-slate-800';
          let badgeColors = 'bg-slate-950/40 text-slate-400 border-slate-850';

          if (item.type === 'purchased') {
            iconElement = <Sparkles className="w-3.5 h-3.5" />;
            colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            badgeColors = 'bg-emerald-950/40 text-emerald-400 border-emerald-850/50';
          } else if (item.type === 'additional_copy') {
            iconElement = <Plus className="w-3.5 h-3.5" />;
            colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            badgeColors = 'bg-blue-950/40 text-blue-400 border-blue-850/50';
          } else if (item.type === 'sent_grading') {
            iconElement = <Calendar className="w-3.5 h-3.5" />;
            colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            badgeColors = 'bg-amber-950/40 text-amber-400 border-amber-850/50';
          } else if (item.type === 'grade_received') {
            iconElement = <Award className="w-3.5 h-3.5" />;
            colorClasses = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
            badgeColors = 'bg-indigo-950/40 text-indigo-400 border-indigo-850/50';
          } else if (item.type === 'price_milestone') {
            iconElement = <TrendingUp className="w-3.5 h-3.5" />;
            colorClasses = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
            badgeColors = 'bg-yellow-950/40 text-yellow-500 border-yellow-850/50';
          } else if (item.type === 'portfolio_milestone') {
            iconElement = <Grid className="w-3.5 h-3.5" />;
            colorClasses = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
            badgeColors = 'bg-purple-950/40 text-purple-400 border-purple-850/50';
          } else if (item.type === 'notes') {
            iconElement = <MessageSquare className="w-3.5 h-3.5" />;
            colorClasses = 'bg-pink-500/15 text-pink-400 border-pink-500/30';
            badgeColors = 'bg-pink-950/40 text-pink-400 border-pink-850/50';
          }

          return (
            <div key={index} className="relative group/timeline-item transition-all duration-300">
              <div className={`absolute -left-[23px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 group-hover/timeline-item:scale-110 shadow ${colorClasses}`}>
                {iconElement}
              </div>

              <div className="bg-[#171921] border border-slate-800/80 rounded-2xl p-4 space-y-2.5 transition-all duration-300 hover:border-slate-700/85">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md border ${badgeColors}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium block">
                    {formatJournalDate(item.date)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-200 tracking-tight font-sans">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">
                    {item.description}
                  </p>
                </div>

                {(item.type === 'purchased' || item.type === 'additional_copy' || item.type === 'grade_received') && (
                  <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/80 max-w-sm mt-1">
                    <div className="w-8 h-11 relative overflow-hidden bg-slate-900 border border-slate-800 rounded shrink-0 leading-3">
                      {!imageError ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-yellow-500">
                          PKM
                        </div>
                      )}
                    </div>
                    <div className="text-left leading-3">
                      <p className="text-[10px] text-slate-350 font-extrabold line-clamp-1">{card.name}</p>
                      <span className="text-[9px] text-[#FFCB05] font-mono mt-0.5 block">{card.set} • #{card.number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
