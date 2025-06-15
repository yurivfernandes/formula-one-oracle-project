
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// --- Tipos de dados da API ---
interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

interface Constructor {
  constructorId: string;
  name: string;
}

interface Result {
  position: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
}

interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  Results: Result[];
}

interface RaceResponse {
  MRData: {
    RaceTable: {
      Races: Race[];
    };
  };
}

// Calendário completo 2025 com sprints
const FULL_CALENDAR_2025 = [
  { round: "1", country: "🇦🇺", name: "Austrália", city: "Melbourne", type: "race" },
  { round: "2", country: "🇨🇳", name: "China", city: "Xangai", type: "race" },
  { round: "3", country: "🇯🇵", name: "Japão", city: "Suzuka", type: "race" },
  { round: "4", country: "🇧🇭", name: "Bahrein", city: "Sakhir", type: "sprint" },
  { round: "4s", country: "🇧🇭", name: "Bahrein Sprint", city: "Sakhir", type: "sprint-race" },
  { round: "5", country: "🇸🇦", name: "Arábia Saudita", city: "Jeddah", type: "race" },
  { round: "6", country: "🇺🇸", name: "Miami", city: "Miami", type: "sprint" },
  { round: "6s", country: "🇺🇸", name: "Miami Sprint", city: "Miami", type: "sprint-race" },
  { round: "7", country: "🇮🇹", name: "Emilia-Romagna", city: "Ímola", type: "race" },
  { round: "8", country: "🇲🇨", name: "Mônaco", city: "Monte Carlo", type: "race" },
  { round: "9", country: "🇪🇸", name: "Espanha", city: "Barcelona", type: "race" },
  { round: "10", country: "🇨🇦", name: "Canadá", city: "Montreal", type: "race", current: true },
  { round: "11", country: "🇦🇹", name: "Áustria", city: "Spielberg", type: "sprint" },
  { round: "11s", country: "🇦🇹", name: "Áustria Sprint", city: "Spielberg", type: "sprint-race" },
  { round: "12", country: "🇬🇧", name: "Reino Unido", city: "Silverstone", type: "race" },
  { round: "13", country: "🇭🇺", name: "Hungria", city: "Budapeste", type: "race" },
  { round: "14", country: "🇧🇪", name: "Bélgica", city: "Spa-Francorchamps", type: "race" },
  { round: "15", country: "🇳🇱", name: "Holanda", city: "Zandvoort", type: "race" },
  { round: "16", country: "🇮🇹", name: "Itália", city: "Monza", type: "race" },
  { round: "17", country: "🇦🇿", name: "Azerbaijão", city: "Baku", type: "race" },
  { round: "18", country: "🇸🇬", name: "Singapura", city: "Marina Bay", type: "race" },
  { round: "19", country: "🇺🇸", name: "EUA", city: "Austin", type: "sprint" },
  { round: "19s", country: "🇺🇸", name: "EUA Sprint", city: "Austin", type: "sprint-race" },
  { round: "20", country: "🇲🇽", name: "México", city: "Cidade do México", type: "race" },
  { round: "21", country: "🇧🇷", name: "Brasil", city: "São Paulo", type: "sprint" },
  { round: "21s", country: "🇧🇷", name: "Brasil Sprint", city: "São Paulo", type: "sprint-race" },
  { round: "22", country: "🇺🇸", name: "Las Vegas", city: "Las Vegas", type: "race" },
  { round: "23", country: "🇶🇦", name: "Catar", city: "Lusail", type: "race" },
  { round: "24", country: "🇦🇪", name: "Abu Dhabi", city: "Yas Marina", type: "race" }
];

// --- Funções Auxiliares ---
const getTeamColor = (team: string) => {
  const colors: { [key: string]: string } = {
    "McLaren": "bg-orange-500",
    "Ferrari": "bg-red-600",
    "Red Bull": "bg-blue-600",
    "Mercedes": "bg-gray-600",
    "Williams": "bg-cyan-600",
    "Aston Martin": "bg-green-600",
    "Alpine F1 Team": "bg-pink-500",
    "Haas F1 Team": "bg-gray-400",
    "RB F1 Team": "bg-blue-400",
    "Sauber": "bg-green-400"
  };
  return colors[team] || "bg-gray-500";
};

const getNationalityFlag = (nationality: string) => {
  const flags: { [key: string]: string } = {
    "Dutch": "🇳🇱",
    "British": "🇬🇧",
    "Monegasque": "🇲🇨",
    "Australian": "🇦🇺",
    "Mexican": "🇲🇽",
    "Spanish": "🇪🇸",
    "Thai": "🇹🇭",
    "Canadian": "🇨🇦",
    "German": "🇩🇪",
    "Japanese": "🇯🇵",
    "Italian": "🇮🇹",
    "French": "🇫🇷",
    "Danish": "🇩🇰",
    "Finnish": "🇫🇮",
    "Chinese": "🇨🇳",
    "American": "🇺🇸",
    "New Zealander": "🇳🇿",
    "Brazilian": "🇧🇷",
    "Argentine": "🇦🇷"
  };
  return flags[nationality] || "🏁";
};

// --- Função de Fetch ---
const fetchRaceResults = async (): Promise<Race[]> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/results.json?limit=200');
  if (!response.ok) {
    throw new Error('A resposta da rede não foi bem-sucedida');
  }
  const data: RaceResponse = await response.json();
  return data.MRData.RaceTable.Races;
};

const RaceByRaceStandings = () => {
  const [viewType, setViewType] = useState<"all" | "completed">("completed");
  
  const { data: races, isLoading, isError, error } = useQuery({
    queryKey: ['raceResults', 2025],
    queryFn: fetchRaceResults,
  });

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
        <div className="p-6 border-b border-red-800/30">
          <h2 className="text-2xl font-bold text-white mb-2">Resultados Corrida a Corrida 2025</h2>
          <p className="text-gray-300">A carregar dados das corridas...</p>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
        <p className="text-gray-300 mb-4">Não foi possível buscar os resultados das corridas.</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
      </div>
    );
  }

  // Criar mapa de resultados das corridas realizadas
  const raceResultsMap: { [round: string]: Race } = {};
  races?.forEach(race => {
    raceResultsMap[race.round] = race;
  });

  // Coletar todos os pilotos únicos das corridas realizadas
  const allDrivers = new Set<string>();
  const driverData: { [key: string]: { driver: Driver; constructor: Constructor; racePoints: { [round: string]: string } } } = {};

  races?.forEach(race => {
    race.Results.forEach(result => {
      const driverId = result.Driver.driverId;
      allDrivers.add(driverId);
      
      if (!driverData[driverId]) {
        driverData[driverId] = {
          driver: result.Driver,
          constructor: result.Constructor,
          racePoints: {}
        };
      }
      
      driverData[driverId].racePoints[race.round] = result.points;
    });
  });

  // Calcular pontos totais para ordenação
  const driversWithTotals = Object.entries(driverData).map(([driverId, data]) => {
    const totalPoints = Object.values(data.racePoints).reduce((sum, points) => sum + parseInt(points || '0'), 0);
    return { driverId, ...data, totalPoints };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Filtrar corridas para exibir
  const racesToShow = viewType === "completed" 
    ? FULL_CALENDAR_2025.filter(round => raceResultsMap[round.round] || round.type === "sprint-race")
    : FULL_CALENDAR_2025;

  const currentRaceIndex = FULL_CALENDAR_2025.findIndex(race => race.current);

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Temporada F1 2025 - Corrida a Corrida</h2>
            <p className="text-gray-300">Pontos por corrida de cada piloto</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-600/20 border border-red-500 rounded-lg px-3 py-2">
              <span className="text-red-400 font-medium text-sm">🏎️ Próxima: Canadá 🇨🇦</span>
            </div>
            <Select value={viewType} onValueChange={(value: "all" | "completed") => setViewType(value)}>
              <SelectTrigger className="w-[200px] bg-black/60 border-red-800/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-red-800/50">
                <SelectItem value="completed" className="text-white hover:bg-red-900/20">
                  Apenas Realizadas
                </SelectItem>
                <SelectItem value="all" className="text-white hover:bg-red-900/20">
                  Calendário Completo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold sticky left-0 bg-black/40 min-w-[200px] z-10">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-[200px] bg-black/40 min-w-[150px] z-10">Equipe</TableHead>
              {racesToShow.map((raceInfo) => (
                <TableHead 
                  key={`${raceInfo.round}-${raceInfo.type}`} 
                  className={`text-red-400 font-bold text-center min-w-[70px] ${
                    raceInfo.current ? 'bg-red-600/20 border-x border-red-500' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">{raceInfo.country}</span>
                    <span className="text-xs">{raceInfo.name}</span>
                    {raceInfo.type === "sprint" && <span className="text-xs text-yellow-400">Sprint</span>}
                    {raceInfo.type === "sprint-race" && <span className="text-xs text-yellow-400">Sprint Race</span>}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-red-400 font-bold text-center min-w-[80px] sticky right-0 bg-black/40 z-10">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversWithTotals.length > 0 ? driversWithTotals.map(({ driverId, driver, constructor, racePoints, totalPoints }, index) => (
              <TableRow 
                key={driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="sticky left-0 bg-black/40 text-white z-10">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-red-400 min-w-[20px]">#{index + 1}</span>
                    <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
                    <span className="font-semibold whitespace-nowrap">{`${driver.givenName} ${driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-[200px] bg-black/40 z-10">
                  <Badge className={`${getTeamColor(constructor.name)} text-white text-xs whitespace-nowrap`}>
                    {constructor.name}
                  </Badge>
                </TableCell>
                {racesToShow.map((raceInfo) => {
                  const points = racePoints[raceInfo.round] || '0';
                  const hasResult = raceResultsMap[raceInfo.round];
                  
                  return (
                    <TableCell 
                      key={`${raceInfo.round}-${raceInfo.type}`} 
                      className={`text-white text-center font-medium ${
                        raceInfo.current ? 'bg-red-600/10' : ''
                      } ${
                        !hasResult && viewType === "all" ? 'text-gray-500' : ''
                      }`}
                    >
                      {hasResult ? points : viewType === "all" ? '-' : ''}
                    </TableCell>
                  );
                })}
                <TableCell className="text-white font-bold text-lg text-center bg-red-900/20 sticky right-0 z-10">
                  {totalPoints}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={racesToShow.length + 3} className="text-center text-gray-400 py-8">
                  Ainda não há resultados de corridas para exibir.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RaceByRaceStandings;
