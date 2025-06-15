
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Wifi, ArrowUp, ArrowDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TeamLogo from "@/components/TeamLogo";
import LapNavigation from "@/components/LapNavigation";

// --- Constantes para o GP alvo deste live timing (Australian GP, round 1 de 2025) ---

// Infos do GP alvo (você poderia obter pelo endpoint de /races/1?year=2025 também)
const GP_ROUND = "1";
const GP_SEASON = "2025";
const GP_NAME = "GP da Austrália";

// Australian GP de 2025 começa em 16/03/2025 04:00 UTC (para simulacao)
const RACE_START_UTC = new Date("2025-03-16T04:00:00Z");
const RACE_END_UTC = new Date("2025-03-16T06:00:00Z"); // Corrida simulada de 2h
const LOCAL_START_TIME = RACE_START_UTC.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const useIsTimingAvailable = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  // Disponibiliza o live timing quando faltar 1h ou menos para a largada
  return now >= new Date(RACE_START_UTC.getTime() - 60 * 60 * 1000);
};

// Busca dados de qualifying
const fetchQualifying = async () => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${GP_ROUND}/qualifying.json`);
  const data = await res.json();
  // O qualifying.results está no RaceTable.Races[0].QualifyingResults
  return data?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || [];
};

// Busca dados das voltas
const fetchLaps = async () => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${GP_ROUND}/laps.json?limit=9999`);
  const data = await res.json();
  return data?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
};

function getRaceStatus() {
  const now = new Date();
  if (now < RACE_START_UTC) return "before";
  if (now >= RACE_START_UTC && now <= RACE_END_UTC) return "live";
  return "after";
}

const LiveTimingPage = () => {
  // --- Quando podemos mostrar o Live Timing? ---
  const timingAvailable = useIsTimingAvailable();
  const raceStatus = getRaceStatus();

  // Query para obter grid do qualifying, só faz sentido se antes da corrida!
  const { data: qualifying, isLoading: loadingQuali } = useQuery({
    queryKey: ["qualifying", GP_ROUND],
    queryFn: fetchQualifying,
    enabled: timingAvailable,
  });

  // Query para buscar voltas (live timing), só faz sentido se durante a corrida
  const { data: laps, isLoading: loadingLaps, refetch } = useQuery({
    queryKey: ["liveLaps", GP_ROUND],
    queryFn: fetchLaps,
    enabled: raceStatus === "live",
    refetchInterval: raceStatus === "live" ? 12000 : false, // Atualiza só quando ao vivo
  });

  // --- Navegação de laps ---
  // Descobrindo quantas voltas a corrida tem de fato
  const totalLaps = laps?.length || 0;
  // Mostrar últimas 5 se for corrida, ou todas no qualifying
  const [visibleLapRange, setVisibleLapRange] = useState<[number, number]>([0, 5]);
  useEffect(() => {
    // Ajustar a navegação quando laps mudam
    if (raceStatus === "live" && totalLaps > 5) {
      setVisibleLapRange([Math.max(0, totalLaps - 5), totalLaps]);
    } else if (raceStatus === "live") {
      setVisibleLapRange([0, totalLaps]);
    } else if (raceStatus === "before") {
      setVisibleLapRange([0, 1]); // Qualy: só grid, sem voltas
    }
  }, [raceStatus, totalLaps]);

  // --- Estrutura dos dados de voltas para tabela ---
  // Laps API: cada lap tem número e array Timings [{driverId, position, time}]
  // Precisamos transformar em: { [driverId]: [timeLap1, timeLap2, ...] }
  const lapTimes: Record<string, string[]> = {};
  if (laps && laps.length > 0) {
    laps.forEach((lap, idx) => {
      lap.Timings.forEach(t => {
        if (!lapTimes[t.driverId]) lapTimes[t.driverId] = [];
        lapTimes[t.driverId][parseInt(lap.number)-1] = t.time;
      });
    });
  }

  // --- Montagem da lista de pilotos em ordem adequada ---
  let drivers: any[] = [];
  if (raceStatus === "before") {
    // Antes da corrida: grid da qualificação
    drivers = (qualifying || []).map((q: any, ix: number) => ({
      id: q.Driver.code,
      name: `${q.Driver.givenName} ${q.Driver.familyName}`,
      team: q.Constructor.name,
      position: Number(q.position),
      country: countryFlag(q.Driver.nationality),
      qualyRow: q,
    }));
    // Garantir ordem pela posição do qualy
    drivers.sort((a, b) => a.position - b.position);
  } else if (raceStatus === "live" && laps && laps.length > 0) {
    // Live: ordem da última volta
    const lastLap = laps[laps.length-1];
    drivers = [...lastLap.Timings]
      .sort((a: any, b: any) => Number(a.position) - Number(b.position))
      .map((timing: any) => ({
        id: timing.driverId,
        position: Number(timing.position),
        name: driverNameFromId(timing.driverId, laps), // We'll extract from laps/qualifying
        team: driverTeamFromId(timing.driverId, qualifying),
        country: driverCountryFromId(timing.driverId, qualifying),
        qualyRow: (qualifying || []).find((q: any) => q.Driver.code === timing.driverId)
      }));
  }

  // Utilitários (poderiam ir para arquivo, manter aqui pois o arquivo será refatorado!)
  function countryFlag(nationality: string): string {
    // Corrigir nacionalidade para emoji nacional mais comum
    // Fonte: https://gist.github.com/ICoderReloaded/b5903bfa6fc8cb0a776be694972a11b6
    const natFlags: Record<string, string> = {
      Dutch: "🇳🇱", British: "🇬🇧", Monegasque: "🇲🇨", Spanish: "🇪🇸",
      Australian: "🇦🇺", French: "🇫🇷", Thai: "🇹🇭", Japanese: "🇯🇵",
      Finnish: "🇫🇮", Chinese: "🇨🇳", Danish: "🇩🇰", German: "🇩🇪",
      Mexican: "🇲🇽", Canadian: "🇨🇦", Italian: "🇮🇹", Brazilian: "🇧🇷",
      American: "🇺🇸", Portuguese: "🇵🇹", NewZealander: "🇳🇿", Indian: "🇮🇳",
    };
    return natFlags[nationality] || "🏁";
  }
  function driverNameFromId(driverId: string, lapsOrQualy: any[]) {
    const qualy = (qualifying || []).find((q: any) => q.Driver.code === driverId);
    return qualy
      ? `${qualy.Driver.givenName} ${qualy.Driver.familyName}`
      : driverId;
  }
  function driverTeamFromId(driverId: string, qualy: any[]) {
    const q = (qualy || []).find((qr: any) => qr.Driver.code === driverId);
    return q ? q.Constructor.name : "";
  }
  function driverCountryFromId(driverId: string, qualy: any[]) {
    const q = (qualy || []).find((qr: any) => qr.Driver.code === driverId);
    return q ? countryFlag(q.Driver.nationality) : "";
  }

  // Erro/data indisponível
  if (!timingAvailable)
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

  // Estado loading
  if (raceStatus === "before" && loadingQuali)
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
  if (raceStatus === "live" && loadingLaps)
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

  // Cabeçalho e informações
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 w-full">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 animate-pulse" /> 
              Live Timing — {GP_NAME}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <Wifi className="w-4 h-4 text-green-500 inline" />{" "}
                <span className="text-green-700">Conectado à API Ergast</span>
              </span>
              <span>
                {raceStatus === "before" && (
                  <>Corrida começa às <b>{LOCAL_START_TIME}</b></>
                )}
                {raceStatus === "live" && (
                  <>Corrida em andamento · Atualizando automaticamente</>
                )}
              </span>
            </div>
          </div>

          {/* Aviso contextual */}
          {raceStatus === "before" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800 text-sm">
              <b>Importante:</b> A corrida do {GP_NAME} começa às <b>{LOCAL_START_TIME}</b> (horário local da página).<br />
              O Live Timing exibirá a ordem do grid de largada (qualifying) até a largada.
              <br />
              O acompanhamento em tempo real será ativado a partir do início da corrida.
            </div>
          )}
          {raceStatus === "live" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800 text-sm">
              Dados sendo atualizados automaticamente · Última atualização: {new Date().toLocaleTimeString("pt-BR")}
            </div>
          )}

          {/* Navegação de voltas */}
          {raceStatus === "live" && totalLaps > 0 && (
            <LapNavigation
              totalLaps={totalLaps}
              visibleLapRange={visibleLapRange}
              onNavigate={setVisibleLapRange}
              canShowLess={visibleLapRange[0] > 0}
              canShowMore={visibleLapRange[1] < totalLaps}
            />
          )}

          {/* Tabela principal */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold w-16">Pos</th>
                    <th className={`px-2 py-2 font-semibold w-28 text-left`}>Piloto</th>
                    <th className={`px-1 py-2 font-semibold w-24 text-left`}>Equipe</th>
                    {/* Cabeçalho das voltas */}
                    {raceStatus === "live" && totalLaps > 0 &&
                      Array.from({ length: visibleLapRange[1] - visibleLapRange[0] }, (_, i) => (
                        <th
                          key={visibleLapRange[0] + i + 1}
                          className="px-2 py-2 text-center font-semibold w-20 text-xs"
                        >
                          {`L${visibleLapRange[0] + i + 1}`}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Antes da corrida: grid do qualifying */}
                  {raceStatus === "before" && drivers.map((driver, index) => (
                    <tr
                      key={driver.id}
                      className={`border-b ${index < 10 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50`}
                    >
                      <td className="px-3 py-2 font-bold text-gray-900">{driver.position}</td>
                      <td className="px-2 py-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{driver.country}</span>
                          <span className="font-mono font-semibold text-red-700 text-base">{driver.id}</span>
                        </div>
                        <span className="block text-xs text-gray-600">{driver.name}</span>
                      </td>
                      <td className="py-2 w-24 text-left">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={driver.team} className="w-7 h-5" />
                          <span className="font-semibold">{driver.team}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Durante a corrida: posição atual + tempos de volta */}
                  {raceStatus === "live" && drivers.map((driver, index) => (
                    <tr
                      key={driver.id}
                      className={`border-b ${index < 10 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50`}
                    >
                      <td className="px-3 py-2 font-bold text-gray-900">{driver.position}</td>
                      <td className="px-2 py-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{driver.country}</span>
                          <span className="font-mono font-semibold text-red-700 text-base">{driver.id}</span>
                        </div>
                        <span className="block text-xs text-gray-600">{driver.name}</span>
                      </td>
                      <td className="py-2 w-24 text-left">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={driver.team} className="w-7 h-5" />
                          <span className="font-semibold">{driver.team}</span>
                        </div>
                      </td>
                      {/* Tempos de volta */}
                      {lapTimes[driver.id]
                        ?.slice(visibleLapRange[0], visibleLapRange[1])
                        .map((time, lapIndex) => (
                          <td
                            key={lapIndex + visibleLapRange[0]}
                            className="px-2 py-2 text-center font-mono text-xs text-gray-800 whitespace-nowrap"
                          >
                            {time}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legenda */}
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
