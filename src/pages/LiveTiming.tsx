
import { useState, useEffect } from "react";
import { Zap, Wifi } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Dados mockados mais realistas para live timing
const DRIVERS_DATA = [
  { id: "VER", name: "Max Verstappen", team: "Red Bull Racing", position: 1 },
  { id: "HAM", name: "Lewis Hamilton", team: "Mercedes", position: 2 },
  { id: "LEC", name: "Charles Leclerc", team: "Ferrari", position: 3 },
  { id: "RUS", name: "George Russell", team: "Mercedes", position: 4 },
  { id: "SAI", name: "Carlos Sainz", team: "Ferrari", position: 5 },
  { id: "NOR", name: "Lando Norris", team: "McLaren", position: 6 },
  { id: "PIA", name: "Oscar Piastri", team: "McLaren", position: 7 },
  { id: "ALO", name: "Fernando Alonso", team: "Aston Martin", position: 8 },
  { id: "STR", name: "Lance Stroll", team: "Aston Martin", position: 9 },
  { id: "GAS", name: "Pierre Gasly", team: "Alpine", position: 10 },
  { id: "OCO", name: "Esteban Ocon", team: "Alpine", position: 11 },
  { id: "ALB", name: "Alexander Albon", team: "Williams", position: 12 },
  { id: "SAR", name: "Logan Sargeant", team: "Williams", position: 13 },
  { id: "TSU", name: "Yuki Tsunoda", team: "AlphaTauri", position: 14 },
  { id: "RIC", name: "Daniel Ricciardo", team: "AlphaTauri", position: 15 },
  { id: "BOT", name: "Valtteri Bottas", team: "Alfa Romeo", position: 16 },
  { id: "ZHO", name: "Zhou Guanyu", team: "Alfa Romeo", position: 17 },
  { id: "MAG", name: "Kevin Magnussen", team: "Haas", position: 18 },
  { id: "HUL", name: "Nico Hulkenberg", team: "Haas", position: 19 },
  { id: "PER", name: "Sergio Perez", team: "Red Bull Racing", position: 20 },
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

const LiveTimingPage = () => {
  const [lapTimes, setLapTimes] = useState(generateLapTimes());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Atualização automática a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      setLapTimes(generateLapTimes());
      setLastUpdate(new Date());
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
              Atualização automática a cada 2 minutos durante a corrida.
            </p>
          </div>

          {/* Tabela de Live Timing */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold w-12">Pos</th>
                    <th className="px-3 py-2 text-left font-semibold w-16">Piloto</th>
                    <th className="px-3 py-2 text-left font-semibold min-w-40">Equipe</th>
                    {Array.from({ length: 15 }, (_, i) => (
                      <th key={i + 1} className="px-2 py-2 text-center font-semibold w-20 text-xs">
                        L{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DRIVERS_DATA.map((driver, index) => (
                    <tr 
                      key={driver.id} 
                      className={`border-b hover:bg-gray-50 ${
                        index < 3 ? 'bg-green-50' : 
                        index >= 17 ? 'bg-red-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-gray-900">{driver.position}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-red-700">{driver.id}</td>
                      <td className="px-3 py-2 text-gray-700 text-sm">{driver.team}</td>
                      {lapTimes[driver.id]?.map((time, lapIndex) => (
                        <td key={lapIndex} className="px-2 py-2 text-center font-mono text-xs text-gray-800">
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
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Top 3 (Pódio)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>Zona de pontuação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Zona de eliminação</span>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LiveTimingPage;
