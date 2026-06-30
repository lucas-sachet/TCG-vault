import React from 'react';
import type { PriceSnapshot } from '../../types';
import type { SparklinePoint, SparklinePointWithEvents } from './cardDetailsTypes';
import { CardDetailsPriceChartSvg } from './CardDetailsPriceChartSvg';
import { CardDetailsPriceChartStoryboard } from './CardDetailsPriceChartStoryboard';

interface CardDetailsPriceChartProps {
  historySeries: PriceSnapshot[];
  currencySymbol: string;
  chartWidth: number;
  chartHeight: number;
  chartPadding: number;
  minPriceInHistory: number;
  maxPriceInHistory: number;
  sparklinePoints: SparklinePoint[];
  sparklineD: string;
  areaD: string;
  pointsWithEvents: SparklinePointWithEvents[];
  hoveredPointIndex: number | null;
  onMouseMove: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;
  onMouseLeave: () => void;
}

export const CardDetailsPriceChart: React.FC<CardDetailsPriceChartProps> = ({
  historySeries,
  currencySymbol,
  chartWidth,
  chartHeight,
  chartPadding,
  minPriceInHistory,
  maxPriceInHistory,
  sparklinePoints,
  sparklineD,
  areaD,
  pointsWithEvents,
  hoveredPointIndex,
  onMouseMove,
  onMouseLeave
}) => (
  <div className="bg-[#131520] p-5 border border-slate-800/80 rounded-2xl space-y-4">
    <div className="flex justify-between items-center text-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="font-extrabold text-slate-100 tracking-tight">Interactive Card Value History</span>
      </div>
      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md">
        Range: {currencySymbol}{minPriceInHistory} &mdash; {currencySymbol}{maxPriceInHistory}
      </span>
    </div>

    {historySeries.length === 0 ? (
      <div className="py-8 text-center text-xs text-slate-500 font-sans italic">Historical market data points caching...</div>
    ) : (
      <div className="space-y-4">
        <CardDetailsPriceChartSvg
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          chartPadding={chartPadding}
          areaD={areaD}
          sparklineD={sparklineD}
          sparklinePoints={sparklinePoints}
          pointsWithEvents={pointsWithEvents}
          hoveredPointIndex={hoveredPointIndex}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />

        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold uppercase mt-2 px-3">
          <span>{historySeries[0]?.capturedAt}</span>
          <span className="text-[8px] tracking-widest text-[#FFCB05]/40 font-sans">← SCRUB TIMELINE FOR STORY DETAILS &rarr;</span>
          <span>{historySeries[historySeries.length - 1]?.capturedAt}</span>
        </div>

        <CardDetailsPriceChartStoryboard
          hoveredPointIndex={hoveredPointIndex}
          sparklinePoints={sparklinePoints}
          pointsWithEvents={pointsWithEvents}
          currencySymbol={currencySymbol}
        />
      </div>
    )}
  </div>
);
