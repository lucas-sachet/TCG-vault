import { useState, useMemo } from 'react';
import type { PriceSnapshot } from '../../types';
import type { JourneyTimelineEvent, SparklinePoint, SparklinePointWithEvents } from './cardDetailsTypes';

const CHART_HEIGHT = 150;
const CHART_WIDTH = 500;
const CHART_PADDING = 24;

interface UseCardPriceChartParams {
  historySeries: PriceSnapshot[];
  currentPrice: number;
  journeyTimeline: JourneyTimelineEvent[];
}

export function useCardPriceChart({ historySeries, currentPrice, journeyTimeline }: UseCardPriceChartParams) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const maxPriceInHistory = historySeries.length > 0
    ? Math.max(...historySeries.map((snapshot) => snapshot.marketPrice))
    : currentPrice;
  const minPriceInHistory = historySeries.length > 0
    ? Math.min(...historySeries.map((snapshot) => snapshot.marketPrice))
    : currentPrice;

  const sparklinePoints = useMemo((): SparklinePoint[] => {
    return historySeries.map((historyPoint, index) => {
      const denominator = historySeries.length > 1 ? (historySeries.length - 1) : 1;
      const x = CHART_PADDING + (index / denominator) * (CHART_WIDTH - CHART_PADDING * 2);
      const range = maxPriceInHistory - minPriceInHistory;
      const y = CHART_HEIGHT - CHART_PADDING
        - ((historyPoint.marketPrice - minPriceInHistory) / (range || 1)) * (CHART_HEIGHT - CHART_PADDING * 2);
      return { x, y, price: historyPoint.marketPrice, date: historyPoint.capturedAt };
    });
  }, [historySeries, maxPriceInHistory, minPriceInHistory]);

  const sparklineD = sparklinePoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  const areaD = sparklinePoints.length > 0
    ? `${sparklineD} L ${sparklinePoints[sparklinePoints.length - 1].x} ${CHART_HEIGHT - CHART_PADDING} L ${sparklinePoints[0].x} ${CHART_HEIGHT - CHART_PADDING} Z`
    : '';

  const pointsWithEvents = useMemo((): SparklinePointWithEvents[] => {
    if (sparklinePoints.length === 0) return [];
    return sparklinePoints.map((point) => {
      const matchedEvents = journeyTimeline.filter((event) => {
        let bestPoint = sparklinePoints[0];
        let minDiff = Infinity;
        sparklinePoints.forEach((sparkPoint) => {
          const diff = Math.abs(new Date(sparkPoint.date).getTime() - new Date(event.date).getTime());
          if (diff < minDiff) {
            minDiff = diff;
            bestPoint = sparkPoint;
          }
        });
        return bestPoint.date === point.date;
      });
      return { ...point, events: matchedEvents };
    });
  }, [sparklinePoints, journeyTimeline]);

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (sparklinePoints.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const svgX = (x / rect.width) * CHART_WIDTH;

    let closestIndex = 0;
    let minDistance = Math.abs(sparklinePoints[0].x - svgX);

    sparklinePoints.forEach((point, index) => {
      const distance = Math.abs(point.x - svgX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setHoveredPointIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  return {
    chartHeight: CHART_HEIGHT,
    chartWidth: CHART_WIDTH,
    chartPadding: CHART_PADDING,
    maxPriceInHistory,
    minPriceInHistory,
    sparklinePoints,
    sparklineD,
    areaD,
    pointsWithEvents,
    hoveredPointIndex,
    handleMouseMove,
    handleMouseLeave
  };
}
