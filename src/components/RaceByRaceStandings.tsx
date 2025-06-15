
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
    Location: {
      country: string;
      locality: string;
    };
  };
  Results?: Result[];
  date: string;
}

interface RaceResponse {
  MRData: {
    RaceTable: {
      Races: Race[];
    };
  };
}

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

const getCountryFlag = (country: string) => {
  const flags: { [key: string]: string } = {
    "Australia": "🇦🇺",
    "China": "🇨🇳",
    "Japan": "🇯🇵",
    "Bahrain": "🇧🇭",
    "Saudi Arabia": "🇸🇦",
    "USA": "🇺🇸",
    "Italy": "🇮🇹",
    "Monaco": "🇲🇨",
    "Spain": "🇪🇸",
    "Canada": "🇨🇦",
    "Austria": "🇦🇹",
    "UK": "🇬🇧",
    "Hungary": "🇭🇺",
    "Belgium": "🇧🇪",
    "Netherlands": "🇳🇱",
    "Azerbaijan": "🇦🇿",
    "Singapore": "🇸🇬",
    "Mexico": "🇲🇽",
    "Brazil": "🇧🇷",
    "Qatar": "🇶🇦",
    "United Arab Emirates": "🇦🇪"
  };
  return flags[country] || "🏁";
};

// --- Funções de Fetch ---
const fetchRaces = async (): Promise<Race[]> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
  if (!response.ok) {
    throw new Error('Erro ao buscar calendário de corridas');
  }
  const data: RaceResponse = await response.json();
  return data.MRData.RaceTable.Races;
};

const fetchRaceResults = async (): Promise<Race[]> => {
  const allRaces: Race[] = [];
  
  // Buscar todas as páginas (6 páginas conforme mencionado)
  for (let page = 1; page <= 6; page++) {
    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/results/?offset=${(page - 1) * 30}&limit=30`);
      if (!response.ok) {
        console.warn(`Erro ao buscar página ${page} dos resultados`);
        continue;
      }
      const data: RaceResponse = await response.json();
      const pageRaces = data.MRData.RaceTable.Races;
      
      if (pageRaces.length === 0) {
        break;
      }
      
      allRaces.push(...pageRaces);
    } catch (error) {
      console.warn(`Erro ao processar página ${page}:`, error);
    }
  }
  
  console.log(`Total de corridas carregadas: ${allRaces.length}`);
  return allRaces;
};

const fetchSprintResults = async (): Promise<Race[]> => {
  const allSprints: Race[] = [];
  
  // Buscar todas as páginas de Sprint
  for (let page = 1; page <= 6; page++) {
    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/sprint/?offset=${(page - 1) * 30}&limit=30`);
      if (!response.ok) {
        console.warn(`Erro ao buscar página ${page} dos resultados de Sprint`);
        continue;
      }
      const data: RaceResponse = await response.json();
      const pageSprints = data.MRData.RaceTable.Races;
      
      if (pageSprints.length === 0) {
        break;
      }
      
      allSprints.push(...pageSprints);
    } catch (error) {
      console.warn(`Erro ao processar página ${page} de Sprint:`, error);
    }
  }
  
  console.log(`Total de corridas Sprint carregadas: ${allSprints.length}`);
  return allSprints;
};

const RaceByRaceStandings = () => {
  const [viewType, setViewType] = useState<"all" | "completed">("completed");
  
  const { data: allRaces, isLoading: isLoadingRaces } = useQuery({
    queryKey: ['races', 2025],
    queryFn: fetchRaces,
  });

  const { data: raceResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['raceResults', 2025],
    queryFn: fetchRaceResults,
  });

  const { data: sprintResults, isLoading: isLoadingSprints } = useQuery({
    queryKey: ['sprintResults', 2025],
    queryFn: fetchSprintResults,
  });

  const isLoading = isLoadingRaces || isLoadingResults || isLoadingSprints;

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

  // Criar mapas de resultados das corridas e sprints
  const raceResultsMap: { [round: string]: Race } = {};
  const sprintResultsMap: { [round: string]: Race } = {};

  raceResults?.forEach(race => {
    raceResultsMap[race.round] = race;
  });

  sprintResults?.forEach(sprint => {
    sprintResultsMap[sprint.round] = sprint;
  });

  // Coletar todos os pilotos únicos
  const allDrivers = new Set<string>();
  const driverData: { 
    [key: string]: { 
      driver: Driver; 
      constructor: Constructor; 
      racePoints: { [round: string]: string };
      sprintPoints: { [round: string]: string };
    } 
  } = {};

  // Processar resultados das corridas
  raceResults?.forEach(race => {
    race.Results?.forEach(result => {
      const driverId = result.Driver.driverId;
      allDrivers.add(driverId);
      
      if (!driverData[driverId]) {
        driverData[driverId] = {
          driver: result.Driver,
          constructor: result.Constructor,
          racePoints: {},
          sprintPoints: {}
        };
      }
      
      driverData[driverId].racePoints[race.round] = result.points;
    });
  });

  // Processar resultados dos sprints
  sprintResults?.forEach(sprint => {
    sprint.Results?.forEach(result => {
      const driverId = result.Driver.driverId;
      allDrivers.add(driverId);
      
      if (!driverData[driverId]) {
        driverData[driverId] = {
          driver: result.Driver,
          constructor: result.Constructor,
          racePoints: {},
          sprintPoints: {}
        };
      }
      
      driverData[driverId].sprintPoints[sprint.round] = result.points;
    });
  });

  // Calcular pontos totais para ordenação
  const driversWithTotals = Object.entries(driverData).map(([driverId, data]) => {
    const totalRacePoints = Object.values(data.racePoints).reduce((sum, points) => sum + parseInt(points || '0'), 0);
    const totalSprintPoints = Object.values(data.sprintPoints).reduce((sum, points) => sum + parseInt(points || '0'), 0);
    const totalPoints = totalRacePoints + totalSprintPoints;
    return { driverId, ...data, totalPoints };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Filtrar corridas para exibir
  const racesToShow = viewType === "completed" 
    ? allRaces?.filter(race => raceResultsMap[race.round] || sprintResultsMap[race.round]) || []
    : allRaces || [];

  // Encontrar próxima corrida
  const today = new Date();
  const nextRace = allRaces?.find(race => new Date(race.date) > today);

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Temporada F1 2025 - Corrida a Corrida</h2>
            <p className="text-gray-300">Pontos por corrida e sprint de cada piloto</p>
          </div>
          <div className="flex items-center gap-4">
            {nextRace && (
              <div className="bg-red-600/20 border border-red-500 rounded-lg px-3 py-2">
                <span className="text-red-400 font-medium text-sm">
                  🏎️ Próxima: {nextRace.raceName} {getCountryFlag(nextRace.Circuit.Location.country)}
                </span>
              </div>
            )}
            <Select value={viewType} onValueChange={(value: "all" | "completed") => setViewType(value)}>
              <SelectTrigger className="w-[200px] bg-black/90 border-red-800/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-red-800/50 z-50">
                <SelectItem value="completed" className="text-white hover:bg-red-900/30 focus:bg-red-900/30">
                  Apenas Realizadas
                </SelectItem>
                <SelectItem value="all" className="text-white hover:bg-red-900/30 focus:bg-red-900/30">
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
              <TableHead className="text-red-400 font-bold sticky left-0 bg-black/95 backdrop-blur-sm min-w-[200px] z-20 border-r border-red-800/30">
                Piloto
              </TableHead>
              <TableHead className="text-red-400 font-bold sticky left-[200px] bg-black/95 backdrop-blur-sm min-w-[150px] z-20 border-r border-red-800/30">
                Equipe
              </TableHead>
              {racesToShow.map((race) => (
                <TableHead 
                  key={race.round} 
                  className="text-red-400 font-bold text-center min-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">{getCountryFlag(race.Circuit.Location.country)}</span>
                    <span className="text-xs">{race.Circuit.Location.country}</span>
                    <span className="text-xs text-gray-400">R{race.round}</span>
                    <div className="flex gap-1 mt-1">
                      {sprintResultsMap[race.round] && (
                        <span className="text-xs bg-yellow-600 text-white px-1 rounded">S</span>
                      )}
                      {raceResultsMap[race.round] && (
                        <span className="text-xs bg-red-600 text-white px-1 rounded">R</span>
                      )}
                    </div>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-red-400 font-bold text-center min-w-[80px] sticky right-0 bg-black/95 backdrop-blur-sm z-20 border-l border-red-800/30">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversWithTotals.length > 0 ? driversWithTotals.map(({ driverId, driver, constructor, racePoints, sprintPoints, totalPoints }, index) => (
              <TableRow 
                key={driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="sticky left-0 bg-black/95 backdrop-blur-sm text-white z-10 border-r border-red-800/30">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-red-400 min-w-[20px]">#{index + 1}</span>
                    <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
                    <span className="font-semibold whitespace-nowrap">{`${driver.givenName} ${driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-[200px] bg-black/95 backdrop-blur-sm z-10 border-r border-red-800/30">
                  <Badge className={`${getTeamColor(constructor.name)} text-white text-xs whitespace-nowrap`}>
                    {constructor.name}
                  </Badge>
                </TableCell>
                {racesToShow.map((race) => {
                  const racePointsValue = racePoints[race.round] || '0';
                  const sprintPointsValue = sprintPoints[race.round] || '0';
                  const hasRaceResult = raceResultsMap[race.round];
                  const hasSprintResult = sprintResultsMap[race.round];
                  const hasAnyResult = hasRaceResult || hasSprintResult;
                  
                  return (
                    <TableCell 
                      key={race.round} 
                      className={`text-white text-center font-medium ${
                        !hasAnyResult && viewType === "all" ? 'text-gray-500' : ''
                      }`}
                    >
                      {hasAnyResult ? (
                        <div className="flex flex-col items-center gap-1">
                          {hasSprintResult && (
                            <span className="text-xs bg-yellow-600 text-white px-1 rounded">
                              S: {sprintPointsValue}
                            </span>
                          )}
                          {hasRaceResult && (
                            <span className="text-xs bg-red-600 text-white px-1 rounded">
                              R: {racePointsValue}
                            </span>
                          )}
                        </div>
                      ) : viewType === "all" ? '-' : ''}
                    </TableCell>
                  );
                })}
                <TableCell className="text-white font-bold text-lg text-center bg-red-900/30 sticky right-0 z-10 border-l border-red-800/30">
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
