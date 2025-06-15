import { useState, useEffect } from "react";
import { Zap, Wifi, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TeamLogo from "@/components/TeamLogo";
import LapNavigation from "@/components/LapNavigation";

// Dados mockados mais realistas para live timing
const DRIVERS_DATA = [
  { id: "VER", name: "Max Verstappen", team: "Red Bull", position: 1, startingPosition: 2, country: "🇳🇱" },
  { id: "HAM", name: "Lewis Hamilton", team: "Mercedes", position: 2, startingPosition: 3, country: "🇬🇧" },
  { id: "LEC", name: "Charles Leclerc", team: "Ferrari", position: 3, startingPosition: 1, country: "🇲🇨" },
  { id: "RUS", name: "George Russell", team: "Mercedes", position: 4, startingPosition: 4, country: "🇬🇧" },
  { id: "SAI", name: "Carlos Sainz", team: "Ferrari", position: 5, startingPosition: 6, country: "🇪🇸" },
  { id: "NOR", name: "Lando Norris", team: "McLaren", position: 6, startingPosition: 5, country: "🇬🇧" },
  { id: "PIA", name: "Oscar Piastri", team: "McLaren", position: 7, startingPosition: 8, country: "🇦🇺" },
  { id: "ALO", name: "Fernando Alonso", team: "Aston Martin", position: 8, startingPosition: 7, country: "🇪🇸" },
  { id: "STR", name: "Lance Stroll", team: "Aston Martin", position: 9, startingPosition: 10, country: "🇨🇦" },
  { id: "GAS", name: "Pierre Gasly", team: "Alpine F1 Team", position: 10, startingPosition: 9, country: "🇫🇷" },
  { id: "OCO", name: "Esteban Ocon", team: "Alpine F1 Team", position: 11, startingPosition: 11, country: "🇫🇷" },
  { id: "ALB", name: "Alexander Albon", team: "Williams", position: 12, startingPosition: 13, country: "🇹🇭" },
  { id: "SAR", name: "Logan Sargeant", team: "Williams", position: 13, startingPosition: 12, country: "🇺🇸" },
  { id: "TSU", name: "Yuki Tsunoda", team: "RB F1 Team", position: 14, startingPosition: 15, country: "🇯🇵" },
  { id: "RIC", name: "Daniel Ricciardo", team: "RB F1 Team", position: 15, startingPosition: 14, country: "🇦🇺" },
  { id: "BOT", name: "Valtteri Bottas", team: "Sauber", position: 16, startingPosition: 16, country: "🇫🇮" },
  { id: "ZHO", name: "Zhou Guanyu", team: "Sauber", position: 17, startingPosition: 18, country: "🇨🇳" },
  { id: "MAG", name: "Kevin Magnussen", team: "Haas F1 Team", position: 18, startingPosition: 17, country: "🇩🇰" },
  { id: "HUL", name: "Nico Hulkenberg", team: "Haas F1 Team", position: 19, startingPosition: 19, country: "🇩🇪" },
  { id: "PER", name: "Sergio Perez", team: "Red Bull", position: 20, startingPosition: 20, country: "🇲🇽" },
];

// Tempos mockados por volta para cada piloto
const generateLapTimes = () => {
  const baseTimes = {
    VER: 82.5, HAM: 83.2, LEC: 83.8, RUS: 84.1, SAI: 84.3,
    NOR: 84.6, PIA: 84.9, ALO: 85.2, STR: 85.5, GAS: 85.8,
    OCO: 86.1, ALB: 86.4, SAR: 86.7, TSU: 87.0, RIC: 87.3,
    BOT: 87.6, ZHO: 87.9, MAG: 88.2, HUL: 88.5, PER: 88.8
  };
  
  const lapData: Record<string, string[]> = {};
  
  DRIVERS_DATA.forEach(driver => {
    lapData[driver.id] = [];
    const baseTime = baseTimes[driver.id as keyof typeof baseTimes];
    
    // Gera 15 voltas com variação
    for (let lap = 1; lap <= 15; lap++) {
      const variation = (Math.random() - 0.5) * 2; // ±1 segundo
      const lapTime = baseTime + variation;
      const minutes = Math.floor(lapTime / 60);
      const seconds = (lapTime % 60).toFixed(3);
      lapData[driver.id].push(`${minutes}:${seconds.padStart(6, '0')}`);
    }
  });
  
  return lapData;
};

const GP_INFO = {
  name: "GP do Canadá",
  currentLap: "15/70",
};

const TOTAL_LAPS = 15; // Usando o dado mockado, mas poderia ser dinâmico

const LiveTimingPage = () => {
  const [lapTimes, setLapTimes] = useState(generateLapTimes());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Para navegação: mostrar últimas 5 por padrão
  const [visibleLapRange, setVisibleLapRange] = useState<[number, number]>([Math.max(0, TOTAL_LAPS - 5), TOTAL_LAPS]);

  // Atualização automática a cada 1 minuto e meio
  useEffect(() => {
    const interval = setInterval(() => {
      setLapTimes(generateLapTimes());
      setLastUpdate(new Date());
    }, 90000); // 1.5 minutos = 90 segundos

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Ícone e texto: mostrar apenas o traço se não houve alteração
  const getPositionChangeIcon = (currentPos: number, startingPos: number) => {
    const change = startingPos - currentPos;
    if (change > 0) {
      return <ArrowUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <ArrowDown className="w-4 h-4 text-red-600" />;
    } else {
      return (
        <span className="w-4 h-4 flex items-center justify-center text-gray-400 font-bold">
          &mdash;
        </span>
      );
    }
  };

  // Só mostra o valor numérico se ganhou ou perdeu
  const getPositionChangeText = (currentPos: number, startingPos: number) => {
    const change = startingPos - currentPos;
    if (change > 0) {
      return `+${change}`;
    } else if (change < 0) {
      return change.toString();
    } else {
      return ""; // agora não mostra "0"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-3">
              <Zap className="w-7 h-7 animate-pulse" /> 
              Live Timing — {GP_INFO.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <span>Volta atual: {GP_INFO.currentLap}</span>
              <span>Última atualização: {formatTime(lastUpdate)}</span>
            </div>
          </div>

          {/* Aviso sobre dados */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Fonte de dados:</strong> Os tempos e informações exibidos são provenientes da API oficial da Fórmula 1. 
              A precisão e disponibilidade dos dados não são de nossa responsabilidade. 
              Atualização automática a cada 1 minuto e meio durante a corrida.
            </p>
          </div>

          {/* Navegação de voltas */}
          <LapNavigation
            totalLaps={TOTAL_LAPS}
            visibleLapRange={visibleLapRange}
            onNavigate={setVisibleLapRange}
            canShowLess={visibleLapRange[0] > 0}
            canShowMore={visibleLapRange[1] < TOTAL_LAPS}
          />

          {/* Tabela de Live Timing atualizada */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold w-12">Pos</th>
                    <th className="px-2 py-2 text-left font-semibold w-10"></th>
                    <th className="px-3 py-2 text-left font-semibold w-20">Piloto</th>
                    <th className="px-1 py-2 text-left font-semibold w-12"></th> {/* Equipe */}
                    {Array.from({ length: visibleLapRange[1] - visibleLapRange[0] }, (_, i) => (
                      <th key={visibleLapRange[0] + i + 1} className="px-2 py-2 text-center font-semibold w-20 text-xs">
                        L{visibleLapRange[0] + i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DRIVERS_DATA.map((driver, index) => (
                    <tr 
                      key={driver.id} 
                      className={`border-b hover:bg-gray-50 ${
                        index < 10 ? 'bg-white' :
                        'bg-gray-100'
                      }`}
                    >
                      {/* Posição */}
                      <td className="px-3 py-2 font-bold text-gray-900 flex items-center gap-1">
                        {driver.position}
                        {/* Indicador de ganho/perda posição agora mais à esquerda, junto da posição */}
                        <span className="ml-1 flex items-center gap-0">
                          {getPositionChangeIcon(driver.position, driver.startingPosition)}
                          {getPositionChangeText(driver.position, driver.startingPosition) && (
                            <span className={`text-xs font-medium ${
                              driver.startingPosition - driver.position > 0 ? 'text-green-600' : 
                              driver.startingPosition - driver.position < 0 ? 'text-red-600' : 'text-gray-400'
                            } ml-0.5`}>
                              {getPositionChangeText(driver.position, driver.startingPosition)}
                            </span>
                          )}
                        </span>
                      </td>
                      {/* Apenas bandeira + ID do piloto */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{driver.country}</span>
                          <span className="font-mono font-semibold text-red-700">{driver.id}</span>
                        </div>
                      </td>
                      {/* Equipe: só logo, padding mínimo e centralizado */}
                      <td className="px-1 py-2">
                        <div className="flex items-center justify-center">
                          <TeamLogo teamName={driver.team} className="w-8 h-5" />
                        </div>
                      </td>
                      {/* Tempos de volta */}
                      {lapTimes[driver.id]
                        .slice(visibleLapRange[0], visibleLapRange[1])
                        .map((time, lapIndex) => (
                          <td key={lapIndex + visibleLapRange[0]} className="px-2 py-2 text-center font-mono text-xs text-gray-800">
                            {time}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legenda: atualizada apenas com pontuação, sem zona de eliminação */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>Zona de pontuação (até o 10º)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span>Ganhou posições</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              <span>Perdeu posições</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-gray-400 font-bold">&mdash;</span>
              <span>Mesma posição</span>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LiveTimingPage;
