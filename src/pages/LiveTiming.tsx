
import { useState } from "react";
import { Clock, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Dados mockados de exemplo
const MOCKED_LAPS = [
  {
    number: "1",
    Timings: [
      { driverId: "VER", time: "1:21.432" },
      { driverId: "HAM", time: "1:21.801" },
      { driverId: "LEC", time: "1:22.072" },
    ],
  },
  {
    number: "2",
    Timings: [
      { driverId: "VER", time: "1:20.901" },
      { driverId: "HAM", time: "1:21.225" },
      { driverId: "LEC", time: "1:21.540" },
    ],
  },
  {
    number: "3",
    Timings: [
      { driverId: "VER", time: "1:20.420" },
      { driverId: "HAM", time: "1:21.112" },
      { driverId: "LEC", time: "1:21.400" },
    ],
  },
  {
    number: "4",
    Timings: [
      { driverId: "VER", time: "1:20.302" },
      { driverId: "HAM", time: "1:21.040" },
      { driverId: "LEC", time: "1:21.310" },
    ],
  },
];

const GP_INFO = {
  round: "9",
  name: "GP da Áustria",
  dateTime: "2025-06-29T13:00:00Z",
};

const LiveTimingPage = () => {
  // Ignora data, mostra always live e usando dados mockados
  const { name } = GP_INFO;
  const [laps, setLaps] = useState(MOCKED_LAPS);
  const [isLoading, setIsLoading] = useState(false);

  // Botão atualizar apenas faz o loading voltar e muda nada (mocked)
  const refetch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Poderia embaralhar aqui se quiser, mantemos igual para exemplo visual estável
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
            <Zap className="w-7 h-7" /> Live Timing — {name}
          </h1>
          <div className="p-3 mb-4 rounded bg-yellow-100 text-yellow-900 font-medium shadow flex items-center gap-2 text-sm">
            <span className="font-bold">Exemplo ilustrativo:</span>
            Dados fictícios, apenas para visualização do layout.
          </div>
          <div className="text-gray-400 text-sm mb-4">
            Atualização automática a cada 10 minutos durante a corrida.
            <Button
              size="sm"
              className="ml-2"
              onClick={refetch}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar agora
            </Button>
          </div>
          {isLoading ? (
            <div className="h-32 w-full bg-black/20 rounded-lg mb-8 animate-pulse" />
          ) : (
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
                  {laps.map((lap: any) =>
                    lap.Timings.map((timing: any, i: number) => (
                      <tr key={`${lap.number}-${timing.driverId}`}>
                        {i === 0 && (
                          <td
                            className="p-2 font-bold text-yellow-300 align-top"
                            rowSpan={lap.Timings.length}
                          >
                            {lap.number}
                          </td>
                        )}
                        <td className="p-2 text-black">{timing.driverId}</td>
                        <td className="p-2 text-red-700 font-mono">{timing.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LiveTimingPage;

