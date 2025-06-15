
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

interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

interface StandingsList {
  season: string;
  round: string;
  DriverStandings: DriverStanding[];
}

interface ErgastResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: StandingsList[];
    };
  };
}

// --- Funções Auxiliares ---
const getTeamLogo = (team: string) => {
  const logos: { [key: string]: string } = {
    "McLaren": "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png",
    "Ferrari": "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png",
    "Red Bull": "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png",
    "Mercedes": "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png",
    "Williams": "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png",
    "Aston Martin": "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png",
    "Alpine F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png",
    "Haas F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png.transform/2col/image.png",
    "RB F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png",
    "Sauber": "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png"
  };
  return logos[team] || "";
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
  
  return allRaces;
};

const fetchSprintResults = async (): Promise<Race[]> => {
  const allSprints: Race[] = [];
  
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
  
  return allSprints;
};

const fetchDriverStandings = async (): Promise<StandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverstandings.json');
  if (!response.ok) {
    throw new Error('A resposta da rede não foi bem-sucedida');
  }
  const data: ErgastResponse = await response.json();
  if (!data.MRData.StandingsTable.StandingsLists.length) {
    return { season: "2025", round: "0", DriverStandings: [] };
  }
  return data.MRData.StandingsTable.StandingsLists[0];
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

  const { data: standingsList, isLoading: isLoadingStandings } = useQuery({
    queryKey: ['driverStandings', 2025],
    queryFn: fetchDriverStandings,
  });

  const isLoading = isLoadingRaces || isLoadingResults || isLoadingSprints || isLoadingStandings;

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/30 bg-black/50">
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
      totalPoints: number;
    } 
  } = {};

  // Primeiro, pegar os pontos totais da API de standings
  standingsList?.DriverStandings.forEach(standing => {
    const driverId = standing.Driver.driverId;
    allDrivers.add(driverId);
    
    driverData[driverId] = {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      racePoints: {},
      sprintPoints: {},
      totalPoints: parseInt(standing.points)
    };
  });

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
          sprintPoints: {},
          totalPoints: 0
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
          sprintPoints: {},
          totalPoints: 0
        };
      }
      
      driverData[driverId].sprintPoints[sprint.round] = result.points;
    });
  });

  // Ordenar pilotos pelos pontos totais da API de standings
  const driversWithTotals = Object.entries(driverData)
    .map(([driverId, data]) => ({ driverId, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Filtrar corridas para exibir
  const racesToShow = viewType === "completed" 
    ? allRaces?.filter(race => raceResultsMap[race.round] || sprintResultsMap[race.round]) || []
    : allRaces || [];

  // Encontrar próxima corrida
  const today = new Date();
  const nextRace = allRaces?.find(race => new Date(race.date) > today);

  return (
    <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-red-800/30 bg-black/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Temporada F1 2025 - Corrida a Corrida</h2>
            <p className="text-gray-300">Pontos por corrida e sprint de cada piloto</p>
          </div>
          <div className="flex items-center gap-4">
            {nextRace && (
              <div className="bg-red-600 border border-red-500 rounded-lg px-4 py-2">
                <span className="text-white font-medium text-sm">
                  🏎️ Próxima: {nextRace.raceName} {getCountryFlag(nextRace.Circuit.Location.country)}
                </span>
              </div>
            )}
            <Select value={viewType} onValueChange={(value: "all" | "completed") => setViewType(value)}>
              <SelectTrigger className="w-[200px] bg-black/50 border-red-800/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-red-800/30">
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
            <TableRow className="border-red-800/30 bg-black/50">
              <TableHead className="text-gray-300 font-bold sticky left-0 bg-black/50 min-w-[220px] z-20 border-r border-red-800/30">
                Piloto
              </TableHead>
              <TableHead className="text-gray-300 font-bold sticky left-[220px] bg-black/50 min-w-[100px] z-20 border-r border-red-800/30">
                Equipe
              </TableHead>
              {racesToShow.map((race) => (
                <TableHead 
                  key={race.round} 
                  className="text-gray-300 font-bold text-center min-w-[120px] bg-black/50"
                >
                  <div className="flex flex-col items-center py-2">
                    <span className="text-2xl mb-1">{getCountryFlag(race.Circuit.Location.country)}</span>
                    <span className="text-xs font-medium">{race.Circuit.Location.country}</span>
                    <div className="flex gap-1 mt-2">
                      {sprintResultsMap[race.round] && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">S</span>
                      )}
                      {raceResultsMap[race.round] && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">R</span>
                      )}
                    </div>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-gray-300 font-bold text-center min-w-[100px] sticky right-0 bg-black/50 z-20 border-l border-red-800/30">
                <div className="flex flex-col items-center">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm">Total</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversWithTotals.length > 0 ? driversWithTotals.map(({ driverId, driver, constructor, racePoints, sprintPoints, totalPoints }, index) => (
              <TableRow 
                key={driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="sticky left-0 bg-gray-900 text-white z-10 border-r border-red-800/30 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold min-w-[25px] h-6 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-gray-400 text-black' : 
                        index === 2 ? 'bg-amber-600 text-white' : 
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-xl">{getNationalityFlag(driver.nationality)}</span>
                    </div>
                    <span className="font-semibold whitespace-nowrap text-lg">{`${driver.givenName} ${driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-[220px] bg-gray-900 z-10 border-r border-red-800/30 py-4">
                  <div className="flex items-center justify-center">
                    <img 
                      src={getTeamLogo(constructor.name)} 
                      alt={constructor.name}
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-white text-xs font-medium">${constructor.name}</span>`;
                      }}
                    />
                  </div>
                </TableCell>
                {racesToShow.map((race) => {
                  const racePointsValue = parseInt(racePoints[race.round] || '0');
                  const sprintPointsValue = parseInt(sprintPoints[race.round] || '0');
                  const totalRoundPoints = racePointsValue + sprintPointsValue;
                  const hasRaceResult = raceResultsMap[race.round];
                  const hasSprintResult = sprintResultsMap[race.round];
                  const hasAnyResult = hasRaceResult || hasSprintResult;
                  
                  return (
                    <TableCell 
                      key={race.round} 
                      className={`text-white text-center font-medium py-4 ${
                        !hasAnyResult && viewType === "all" ? 'text-gray-500' : ''
                      }`}
                    >
                      {hasAnyResult ? (
                        <div className="flex flex-col items-center gap-2">
                          {hasSprintResult && (
                            <span className="text-sm bg-yellow-500 text-black px-2 py-1 rounded-lg font-bold min-w-[32px]">
                              {sprintPointsValue}
                            </span>
                          )}
                          {hasRaceResult && (
                            <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-lg font-bold min-w-[32px]">
                              {racePointsValue}
                            </span>
                          )}
                          {(hasRaceResult || hasSprintResult) && totalRoundPoints > 0 && (
                            <span className="text-lg font-bold text-white bg-gray-700 px-2 py-1 rounded-lg min-w-[32px]">
                              {totalRoundPoints}
                            </span>
                          )}
                        </div>
                      ) : viewType === "all" ? (
                        <span className="text-gray-500 text-lg">-</span>
                      ) : ''}
                    </TableCell>
                  );
                })}
                <TableCell className="text-white font-bold text-2xl text-center sticky right-0 bg-gray-900 z-10 border-l border-red-800/30 py-4">
                  <div className="flex flex-col items-center">
                    <span className={`${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      index === 2 ? 'text-amber-500' : 
                      'text-white'
                    }`}>
                      {totalPoints}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">pts</span>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={racesToShow.length + 3} className="text-center text-gray-400 py-12 text-lg">
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
