import React from 'react';
import {
  Activity,
  Award,
  Calendar,
  History,
  MessageSquare,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { SparklinePoint, SparklinePointWithEvents } from './cardDetailsTypes';
import { formatJournalDate } from './formatJournalDate';

interface CardDetailsPriceChartStoryboardProps {
  hoveredPointIndex: number | null;
  sparklinePoints: SparklinePoint[];
  pointsWithEvents: SparklinePointWithEvents[];
  currencySymbol: string;
}

export const CardDetailsPriceChartStoryboard: React.FC<CardDetailsPriceChartStoryboardProps> = ({
  hoveredPointIndex,
  sparklinePoints,
  pointsWithEvents,
  currencySymbol
}) => (
  <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 min-h-[90px] transition-all duration-300">
    {hoveredPointIndex !== null ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#FFCB05] text-slate-950 font-extrabold px-2 py-0.5 rounded font-mono uppercase">
              Snapshot Date
            </span>
            <span className="text-xs font-black text-slate-200">
              {formatJournalDate(sparklinePoints[hoveredPointIndex].date)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Standard Quote</span>
            <span className="text-sm font-black text-yellow-400 font-mono">
              {currencySymbol}{sparklinePoints[hoveredPointIndex].price}
            </span>
          </div>
        </div>

        {pointsWithEvents[hoveredPointIndex]?.events.length > 0 ? (
          <div className="space-y-2 pt-1">
            {pointsWithEvents[hoveredPointIndex].events.map((event, eventIndex) => {
              let eventIcon = <Activity className="w-3.5 h-3.5" />;
              let eventColorClasses = 'text-slate-400 bg-slate-900 border-slate-800';

              if (event.type === 'purchased' || event.type === 'additional_copy') {
                eventIcon = <Sparkles className="w-3.5 h-3.5" />;
                eventColorClasses = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
              } else if (event.type === 'sent_grading') {
                eventIcon = <Calendar className="w-3.5 h-3.5" />;
                eventColorClasses = 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20';
              } else if (event.type === 'grade_received') {
                eventIcon = <Award className="w-3.5 h-3.5" />;
                eventColorClasses = 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20';
              } else if (event.type === 'price_milestone') {
                eventIcon = <TrendingUp className="w-3.5 h-3.5" />;
                eventColorClasses = 'text-yellow-400 bg-yellow-950/40 border-yellow-500/20';
              } else if (event.type === 'notes') {
                eventIcon = <MessageSquare className="w-3.5 h-3.5" />;
                eventColorClasses = 'text-pink-400 bg-pink-950/40 border-pink-500/20';
              }

              return (
                <div key={eventIndex} className={`flex items-start gap-2.5 p-2 rounded-lg border ${eventColorClasses}`}>
                  <div className="mt-0.5 shrink-0">
                    {eventIcon}
                  </div>
                  <div className="space-y-0.5 text-left leading-tight">
                    <p className="text-[10px] font-black tracking-wide uppercase font-mono text-slate-350">{event.badge}</p>
                    <p className="text-xs font-bold text-slate-200">{event.title}</p>
                    <p className="text-[11px] text-slate-400">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1 leading-relaxed font-sans">
            <Activity className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="text-left text-slate-400">
              <p className="font-bold text-slate-300">Standard market value activity.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Undergoing standard marketplace updates. No additions, grading cycles, or collector updates recorded on this specific timeline.
              </p>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-[#FFCB05]" />
          </div>
          <div className="text-left leading-normal">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest font-mono">
              Timeline Chronicle Sync
            </h4>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed font-medium">
              Scrub with your cursor or finger over the timeline chart to display personal acquisition events, graded certifying cycles, and notable market quote metrics aligned with each date marker.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-900 pt-3 text-[10px] font-mono font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Acquisition</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            <span>PSA/CGC Cert</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
            <span>Valuation Shift</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ED64A6]" />
            <span>Private Log</span>
          </span>
        </div>
      </div>
    )}
  </div>
);
