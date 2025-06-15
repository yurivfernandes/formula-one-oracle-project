
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface LapNavigationProps {
  totalLaps: number;
  visibleLapRange: [number, number]; // [start, end]
  onNavigate: (newRange: [number, number]) => void;
  canShowLess: boolean;
  canShowMore: boolean;
}

const LapNavigation: React.FC<LapNavigationProps> = ({
  totalLaps,
  visibleLapRange,
  onNavigate,
  canShowLess,
  canShowMore,
}) => {
  const [start, end] = visibleLapRange;
  
  const handlePrev = () => {
    if (start > 0) {
      onNavigate([Math.max(0, start - 5), Math.max(5, end - 5)]);
    }
  };
  const handleNext = () => {
    if (end < totalLaps) {
      onNavigate([Math.min(totalLaps - 5, start + 5), Math.min(totalLaps, end + 5)]);
    }
  };
  const handleShowAll = () => {
    onNavigate([0, totalLaps]);
  };
  const handleShowLast = () => {
    onNavigate([Math.max(0, totalLaps - 5), totalLaps]);
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        type="button"
        onClick={handlePrev}
        disabled={start === 0 || end - start >= totalLaps}
        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
        aria-label="Mostrar voltas anteriores"
      >
        <ArrowLeft />
      </button>
      {end - start < totalLaps ? (
        <button
          type="button"
          onClick={handleShowAll}
          className="px-2 py-1 text-xs rounded hover:bg-gray-100 border border-gray-200"
          aria-label="Mostrar todas as voltas"
        >
          Ver todas ({totalLaps})
        </button>
      ) : (
        <button
          type="button"
          onClick={handleShowLast}
          className="px-2 py-1 text-xs rounded hover:bg-gray-100 border border-gray-200"
          aria-label="Mostrar últimas 5 voltas"
        >
          Últimas 5
        </button>
      )}
      <button
        type="button"
        onClick={handleNext}
        disabled={end >= totalLaps || end - start >= totalLaps}
        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
        aria-label="Mostrar voltas seguintes"
      >
        <ArrowRight />
      </button>
      <span className="text-xs text-gray-500">
        Exibindo voltas {start + 1}-{end} de {totalLaps}
      </span>
    </div>
  );
};

export default LapNavigation;
