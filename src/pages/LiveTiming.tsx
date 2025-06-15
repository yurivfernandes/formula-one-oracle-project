
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LapNavigation from "@/components/LapNavigation";
import LiveTimingHeader from "@/components/LiveTimingHeader";
import LiveTimingTable from "@/components/LiveTimingTable";
import LiveTimingContextNotice from "@/components/LiveTimingContextNotice";

// --- Utilitário para identificar o GP atual ---
function getCurrentRace(races: any[]): any | null {
  const now = new Date();
  for (const race of races) {
    const start = new Date(`${race.date}T${race.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    if (now >= new Date(start.getTime() - 60 * 60 * 1000) && now <= end) {
      return { ...race, start, end };
    }
  }
  // Se nenhuma está rolando, pega a próxima futura
  const next = races.find(race => new Date(`${race.date}T${race.time}`) > now);
  if (next) {
    const start = new Date(`${next.date}T${next.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return { ...next, start, end };
  }
  // Senão, retorna última do ano
  const last = races[races.length - 1];
  if (last) {
    const start = new Date(`${last.date}T${last.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return { ...last, start, end };
  }
  return null;
}

function countryFlag(nationality: string): string {
  const natFlags: Record<string, string> = {
    Dutch: "🇳🇱", British: "🇬🇧", Monegasque: "🇲🇨", Spanish: "🇪🇸",
    Australian: "🇦🇺", French: "🇫🇷", Thai: "🇹🇭", Japanese: "🇯🇵",
    Finnish: "🇫🇮", Chinese: "🇨🇳", Danish: "🇩🇰", German: "🇩🇪",
    Mexican: "🇲🇽", Canadian: "🇨🇦", Italian: "🇮🇹", Brazilian: "🇧🇷",
    American: "🇺🇸", Portuguese: "🇵🇹", NewZealander: "🇳🇿", Indian: "🇮🇳",
  };
  return natFlags[nationality] || "🏁";
}
function driverNameFromId(driverId: string, qualifying: any[]) {
  const qualy = (qualifying || []).find((q: any) => q.Driver.code === driverId);
  return qualy
    ? `${qualy.Driver.givenName} ${qualy.Driver.familyName}`
    : driverId;
}
function driverTeamFromId(driverId: string, qualifying: any[]) {
  const q = (qualifying || []).find((qr: any) => qr.Driver.code === driverId);
  return q ? q.Constructor.name : "";
}
function driverCountryFromId(driverId: string, qualifying: any[]) {
  const q = (qualifying || []).find((qr: any) => qr.Driver.code === driverId);
  return q ? countryFlag(q.Driver.nationality) : "";
}

const fetchRaces = async () => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/races`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races || [];
};

const fetchQualifying = async (season: string, round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/${round}/qualifying.json`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || [];
};

const fetchLaps = async (season: string, round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/${round}/laps.json?limit=9999`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
};

const LiveTimingPage = () => {
  // 1. Always run all queries/hooks in the same order to avoid the hook order bug.
  const { data: races = [], isLoading: loadingRaces } = useQuery({
    queryKey: ["seasonRaces", "2025"],
    queryFn: fetchRaces,
  });

  // GP variables depend on races
  const [currentRace, setCurrentRace] = useState<any | null>(null);

  useEffect(() => {
    if (!races.length) return;
    const updateRace = () => setCurrentRace(getCurrentRace(races));
    updateRace();
    const timer = setInterval(updateRace, 30000);
    return () => clearInterval(timer);
  }, [races]);

  // Defaults if not available
  const GP_ROUND = currentRace?.round || "";
  const GP_SEASON = currentRace?.season || "";
  const GP_NAME = currentRace?.raceName || currentRace?.name || "GP";
  const RACE_START_UTC = currentRace?.start
    ? currentRace.start
    : new Date();
  const RACE_END_UTC = currentRace?.end
    ? currentRace.end
    : new Date();
  const LOCAL_START_TIME = currentRace?.start
    ? currentRace.start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  // time-based logic, but always run useState/useEffect
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const timingAvailable = currentRace
    ? now >= new Date(RACE_START_UTC.getTime() - 60 * 60 * 1000) && now <= RACE_END_UTC
    : false;

  let raceStatus: "before" | "live" | "after" = "before";
  if (currentRace) {
    if (now < RACE_START_UTC) raceStatus = "before";
    else if (now >= RACE_START_UTC && now <= RACE_END_UTC) raceStatus = "live";
    else raceStatus = "after";
  }

  // Always call these queries/hooks, but use `enabled` to prevent firing if races aren't ready/allowed.
  const { data: qualifying = [], isLoading: loadingQuali } = useQuery({
    queryKey: ["qualifying", GP_SEASON, GP_ROUND],
    queryFn: () => fetchQualifying(GP_SEASON, GP_ROUND),
    enabled: Boolean(GP_SEASON && GP_ROUND && timingAvailable),
  });

  const { data: laps = [], isLoading: loadingLaps } = useQuery({
    queryKey: ["liveLaps", GP_SEASON, GP_ROUND],
    queryFn: () => fetchLaps(GP_SEASON, GP_ROUND),
    enabled: Boolean(raceStatus === "live" && timingAvailable && GP_SEASON && GP_ROUND),
    refetchInterval: raceStatus === "live" ? 12000 : false,
  });

  const totalLaps = laps?.length || 0;

  // Lap range is driven by raceStatus/totalLaps
  const [visibleLapRange, setVisibleLapRange] = useState<[number, number]>([0, 5]);
  useEffect(() => {
    if (raceStatus === "live" && totalLaps > 5) {
      setVisibleLapRange([Math.max(0, totalLaps - 5), totalLaps]);
    } else if (raceStatus === "live") {
      setVisibleLapRange([0, totalLaps]);
    } else if (raceStatus === "before") {
      setVisibleLapRange([0, 1]);
    }
  }, [raceStatus, totalLaps]);

  // Lap times collation
  const lapTimes: Record<string, string[]> = {};
  if (laps && laps.length > 0) {
    laps.forEach((lap, idx) => {
      lap.Timings.forEach(t => {
        if (!lapTimes[t.driverId]) lapTimes[t.driverId] = [];
        lapTimes[t.driverId][parseInt(lap.number) - 1] = t.time;
      });
    });
  }

  // Driver rendering logic
  let drivers: any[] = [];
  if (raceStatus === "before" && qualifying && qualifying.length > 0) {
    drivers = qualifying
      .slice()
      .sort((a: any, b: any) => Number(a.position) - Number(b.position))
      .map((q: any) => ({
        id: q.Driver.code,
        name: `${q.Driver.givenName} ${q.Driver.familyName}`,
        team: q.Constructor.name,
        position: Number(q.position),
        country: countryFlag(q.Driver.nationality),
        qualyRow: q,
      }));
  } else if (raceStatus === "live" && laps && laps.length > 0) {
    const lastLap = laps[laps.length - 1];
    drivers = [...lastLap.Timings]
      .sort((a: any, b: any) => Number(a.position) - Number(b.position))
      .map((timing: any) => ({
        id: timing.driverId,
        position: Number(timing.position),
        name: driverNameFromId(timing.driverId, qualifying),
        team: driverTeamFromId(timing.driverId, qualifying),
        country: driverCountryFromId(timing.driverId, qualifying),
        qualyRow: (qualifying || []).find((q: any) => q.Driver.code === timing.driverId)
      }));
  }

  // ---- ALL HOOKS must be at top; only now do we do any early UI returns! ----

  // Loading state: races or currentRace not set
  if (loadingRaces || !currentRace) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="flex flex-col flex-1 items-center justify-center">
          <div className="bg-white rounded-xl border p-8 shadow-lg text-center max-w-md">
            <span className="text-lg font-bold text-red-700">Carregando...</span>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Live timing locked (before 1h window)
  if (!timingAvailable) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="flex flex-col flex-1 items-center justify-center">
          <div className="bg-white rounded-xl border border-red-100 p-8 shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Live Timing indisponível
            </h2>
            <p className="mb-2">
              O Live Timing estará disponível 1 hora antes do início da corrida.
            </p>
            <p>
              Corrida do {GP_NAME} começa às <b>{LOCAL_START_TIME}</b> (horário local da página).
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Loading qualifying grid
  if (raceStatus === "before" && loadingQuali) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="bg-white rounded-lg shadow border-red-100 border p-10 max-w-md text-center">
            <span className="text-red-700 font-bold text-lg">Carregando grid de largada...</span>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Live, but laps loading
  if (raceStatus === "live" && loadingLaps) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="bg-white rounded-lg shadow border-red-100 border p-10 max-w-md text-center">
            <span className="text-red-700 font-bold text-lg">Carregando dados em tempo real...</span>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Normal render:
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          <LiveTimingHeader gpName={GP_NAME} raceStatus={raceStatus} localStartTime={LOCAL_START_TIME} />
          <LiveTimingContextNotice raceStatus={raceStatus} gpName={GP_NAME} localStartTime={LOCAL_START_TIME} />
          {raceStatus === "live" && totalLaps > 0 && (
            <LapNavigation
              totalLaps={totalLaps}
              visibleLapRange={visibleLapRange}
              onNavigate={setVisibleLapRange}
              canShowLess={visibleLapRange[0] > 0}
              canShowMore={visibleLapRange[1] < totalLaps}
            />
          )}
          <LiveTimingTable
            raceStatus={raceStatus}
            drivers={drivers}
            lapTimes={lapTimes}
            visibleLapRange={visibleLapRange}
            totalLaps={totalLaps}
          />
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>Zona de pontuação (até o 10º)</span>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LiveTimingPage;
