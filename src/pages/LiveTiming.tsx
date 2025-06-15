import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, RefreshCw, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const fetchLiveLaps = async (round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/laps.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.Laps || [];
};

const getNextGPInfo = () => {
  // Corrida 10 Canadá -- por padrão
  return {
    round: "10",
    name: "GP do Canadá",
    dateTime: "2025-06-15T18:00:00Z"
  };
};

const LiveTimingPage = () => {
  // Permite alternar a prova por query param ?round=10 (default: 10 - Canadá)
  const [params] = useSearchParams();
  const round = params.get("round") || "10";
  const { name, dateTime } = getNextGPInfo();

  const [enabled, setEnabled] = useState(true);
  const { data: laps, isLoading, refetch } = useQuery({
    queryKey: ["liveTiming", round],
    queryFn: () => fetchLiveLaps(round),
    refetchInterval: enabled ? 10 * 60 * 1000 : false, // 10 minutos
    enabled: enabled,
  });

  // Checa se corrida já começou
  const now = new Date();
  const raceDate = new Date(dateTime);
  const showLive = now >= raceDate;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
            <Zap className="w-7 h-7" /> Live Timing — {name}
          </h1>
          {!showLive ? (
            <div className="bg-black/60 border border-red-600/30 rounded-xl px-6 py-8 text-center text-white font-semibold mb-6">
              <Clock className="inline-block h-12 w-12 mb-2 text-red-400" />
              A corrida ainda não começou.
              <div className="mt-3 text-red-300 font-bold">
                {raceDate.toLocaleString("pt-BR", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                O live timing ficará disponível no dia e horário da corrida.
              </p>
            </div>
          ) : (
            <>
              <div className="text-gray-400 text-sm mb-4">
                Atualização automática a cada 10 minutos enquanto a corrida estiver acontecendo.
                <Button
                  size="sm"
                  className="ml-2"
                  onClick={() => refetch()}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar agora
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-32 w-full bg-black/30 rounded-lg mb-8" />
              ) : laps && laps.length > 0 ? (
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-red-400 border-b border-red-900/50 text-xs">
                        <th className="p-2">Volta</th>
                        <th className="p-2">Piloto</th>
                        <th className="p-2">Tempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laps.map((lap: any) => (
                        lap.Timings.map((timing: any, i: number) => (
                          <tr key={`${lap.number}-${timing.driverId}`}>
                            {i === 0 && (
                              <td className="p-2 font-bold text-yellow-300 align-top" rowSpan={lap.Timings.length}>{lap.number}</td>
                            )}
                            <td className="p-2 text-white">{timing.driverId}</td>
                            <td className="p-2 text-red-200 font-mono">{timing.time}</td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-400 bg-black/30 rounded-lg py-5 text-center">
                  Nenhum dado disponível ainda para esta corrida.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LiveTimingPage;
