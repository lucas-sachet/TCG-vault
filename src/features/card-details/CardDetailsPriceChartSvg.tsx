import React from 'react';
import type { SparklinePoint, SparklinePointWithEvents } from './cardDetailsTypes';

interface CardDetailsPriceChartSvgProps {
  chartWidth: number;
  chartHeight: number;
  chartPadding: number;
  areaD: string;
  sparklineD: string;
  sparklinePoints: SparklinePoint[];
  pointsWithEvents: SparklinePointWithEvents[];
  hoveredPointIndex: number | null;
  onMouseMove: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;
  onMouseLeave: () => void;
}

export const CardDetailsPriceChartSvg: React.FC<CardDetailsPriceChartSvgProps> = ({
  chartWidth,
  chartHeight,
  chartPadding,
  areaD,
  sparklineD,
  sparklinePoints,
  pointsWithEvents,
  hoveredPointIndex,
  onMouseMove,
  onMouseLeave
}) => (
  <div className="relative overflow-hidden bg-slate-950/35 rounded-xl border border-slate-900 p-2 select-none">
    <svg className="w-full h-auto min-w-[300px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCB05" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFCB05" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="#334155" strokeOpacity="0.25" strokeDasharray="4 4" />
      <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="#334155" strokeOpacity="0.15" strokeDasharray="2 2" />
      <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#334155" strokeOpacity="0.15" strokeDasharray="2 2" />

      {areaD && <path d={areaD} fill="url(#chartGradient)" />}

      <path
        d={sparklineD}
        fill="none"
        stroke="#FFCB05"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {hoveredPointIndex !== null && (
        <line
          x1={sparklinePoints[hoveredPointIndex].x}
          y1={chartPadding}
          x2={sparklinePoints[hoveredPointIndex].x}
          y2={chartHeight - chartPadding}
          stroke="#FFCB05"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.8"
        />
      )}

      {pointsWithEvents.map((point, index) => {
        const hasEvents = point.events.length > 0;
        const isHovered = hoveredPointIndex === index;

        let nodeColor = '#94a3b8';
        if (hasEvents) {
          const types = point.events.map((event) => event.type);
          if (types.includes('purchased') || types.includes('additional_copy')) {
            nodeColor = '#10B981';
          } else if (types.includes('grade_received') || types.includes('sent_grading')) {
            nodeColor = '#6366F1';
          } else if (types.includes('price_milestone') || types.includes('portfolio_milestone')) {
            nodeColor = '#EAB308';
          } else {
            nodeColor = '#ED64A6';
          }
        }

        return (
          <g key={index}>
            {hasEvents && (
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 9 : 6.5}
                fill={nodeColor}
                fillOpacity="0.15"
                stroke={nodeColor}
                strokeOpacity="0.3"
              />
            )}
            <circle
              cx={point.x}
              cy={point.y}
              r={isHovered ? 5 : hasEvents ? 4 : 2.5}
              fill={isHovered ? '#FFFFFF' : hasEvents ? nodeColor : '#0F172A'}
              stroke={isHovered ? nodeColor : hasEvents ? '#FFFFFF' : '#FFCB05'}
              strokeWidth={isHovered ? 2.5 : hasEvents ? 1 : 1}
            />
          </g>
        );
      })}

      <rect
        width={chartWidth}
        height={chartHeight}
        fill="transparent"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="cursor-crosshair"
      />
    </svg>
  </div>
);
