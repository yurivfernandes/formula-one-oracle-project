
import { Flag, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Hook para verificar se estamos no horário da corrida do Canadá (round 10)
function useLiveTimingAvailable() {
  // GP Canadá 2025: 15/jun/2025 15:00 Brasil — UTC "2025-06-15T18:00:00Z"
  const raceDate = new Date("2025-06-15T18:00:00Z");
  const raceEnd = new Date("2025-06-15T20:00:00Z");
  const now = new Date();
  return now >= raceDate && now <= raceEnd;
}

const NAV_LINKS = [
  { to: "/championship", label: "Campeonato" },
  { to: "/prediction", label: "Predição" },
  { to: "/race-weekend", label: "GP do Canadá" }
];

export default function SiteHeader() {
  const location = useLocation();
  const liveTiming = useLiveTimingAvailable();

  return (
    <nav className="bg-white border-b border-red-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group" aria-label="Home">
            <Flag className="h-8 w-8 text-red-600 group-hover:scale-110 transition-all" />
            <span className="text-2xl font-bold text-red-700 group-hover:text-red-500 transition-colors">
              F1 Analytics
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {NAV_LINKS.map(nav => (
              <Link
                key={nav.to}
                to={nav.to}
                className={`px-2 py-1 rounded text-base ${
                  location.pathname.startsWith(nav.to)
                    ? "text-red-600 font-semibold bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                } transition-colors`}
              >
                {nav.label}
              </Link>
            ))}
            {liveTiming && (
              <Link
                to="/race-weekend/live"
                className="flex items-center gap-1 px-2 py-1 rounded text-base text-green-700 bg-green-100 hover:bg-green-200 font-semibold border border-green-300 transition-colors"
              >
                <Zap className="h-4 w-4 text-green-600 animate-pulse" /> Live Timing
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
