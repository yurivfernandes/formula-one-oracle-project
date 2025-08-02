import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import TeamLogo from "./TeamLogo";

// Tipos simplificados para garantir compatibilidade
type Driver = { driverId: string; givenName: string; familyName: string; nationality: string };
type Constructor = { constructorId: string; name: string };
type Result = { position: string; points: string; Driver: Driver; Constructor: Constructor };
type Race = {
  season: string;
  round: string;
  raceName: string;
  Circuit: { circuitName: string; Location: { country: string; locality: string } };
  Results?: Result[];
  SprintResults?: Result[];
  date: string;
};
type StandingsList = { season: string; round: string; DriverStandings: { position: string; points: string; wins: string; Driver: Driver; Constructors: Constructor[] }[] };

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
  return flags[nationality] || "❓";
};

// NOVA LISTA DE NOMES PT-BR E FLAGS
const countryPTBR: { [key: string]: { nome: string; flag: string } } = {
  "Australia": { nome: "Austrália", flag: "🇦🇺" },
  "China": { nome: "China", flag: "🇨🇳" },
  "Japan": { nome: "Japão", flag: "🇯🇵" },
  "Bahrain": { nome: "Bahrein", flag: "🇧🇭" },
  "Saudi Arabia": { nome: "Arábia Saudita", flag: "🇸🇦" },
  "USA": { nome: "Estados Unidos", flag: "🇺🇸" },
  "Italy": { nome: "Itália", flag: "🇮🇹" },
  "Monaco": { nome: "Mônaco", flag: "🇲🇨" },
  "Spain": { nome: "Espanha", flag: "🇪🇸" },
  "Canada": { nome: "Canadá", flag: "🇨🇦" },
  "Austria": { nome: "Áustria", flag: "🇦🇹" },
  "UK": { nome: "Reino Unido", flag: "🇬🇧" },
  "Hungary": { nome: "Hungria", flag: "🇭🇺" },
  "Belgium": { nome: "Bélgica", flag: "🇧🇪" },
  "Netherlands": { nome: "Holanda", flag: "🇳🇱" },
  "Azerbaijan": { nome: "Azerbaijão", flag: "🇦🇿" },
  "Singapore": { nome: "Singapura", flag: "🇸🇬" },
  "Mexico": { nome: "México", flag: "🇲🇽" },
  "Brazil": { nome: "Brasil", flag: "🇧🇷" },
  "Qatar": { nome: "Catar", flag: "🇶🇦" },
  "UAE": { nome: "Emirados Árabes Unidos", flag: "🇦🇪" },
};

// Função auxiliar pro nome e flag pt-br
const getCountryPTBR = (country: string) => countryPTBR[country] || { nome: country, flag: "❓" };

// Busca todas as páginas de resultados de corrida
const fetchRaceResults = async (): Promise<{ [round: string]: Result[] }> => {
  let offset = 0;
  const limit = 30;
  let total = 1;
  const raceResultsByRound: { [round: string]: Result[] } = {};
  while (offset < total) {
    const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/results/?offset=${offset}&limit=${limit}`);
    const data = await res.json();
    total = parseInt(data.MRData.total);
    for (const race of data.MRData.RaceTable.Races) {
      if (race.Results) {
        if (!raceResultsByRound[race.round]) raceResultsByRound[race.round] = [];
        raceResultsByRound[race.round] = raceResultsByRound[race.round].concat(race.Results);
      }
    }
    offset += limit;
  }
  return raceResultsByRound;
};

// Busca todas as páginas de resultados de sprint
const fetchSprintResults = async (): Promise<{ [round: string]: Result[] }> => {
  let offset = 0;
  const limit = 30;
  let total = 1;
  const sprintResultsByRound: { [round: string]: Result[] } = {};
  while (offset < total) {
    const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/sprint/?offset=${offset}&limit=${limit}`);
    const data = await res.json();
    total = parseInt(data.MRData.total);
    for (const race of data.MRData.RaceTable.Races) {
      if (race.SprintResults) {
        if (!sprintResultsByRound[race.round]) sprintResultsByRound[race.round] = [];
        sprintResultsByRound[race.round] = sprintResultsByRound[race.round].concat(race.SprintResults);
      }
    }
    offset += limit;
  }
  return sprintResultsByRound;
};

const fetchRaces = async (): Promise<Race[]> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
  const data = await response.json();
  return data.MRData.RaceTable.Races;
};

const fetchDriverStandings = async (): Promise<StandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverstandings.json');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0];
};


// Função utilitária para buscar rounds de sprint de um JSON
import sprintRoundsJson from "../data/sprint-rounds-2025.json";
const sprintRounds2025: string[] = sprintRoundsJson.map((item: { round: number }) => String(item.round));

const RaceByRaceStandings = () => {
  const [viewType, setViewType] = useState<"all" | "completed">("completed");
  const { data: allRaces, isLoading: isLoadingRaces } = useQuery({ queryKey: ['races', 2025], queryFn: fetchRaces });
  const { data: raceResults, isLoading: isLoadingResults } = useQuery({ queryKey: ['raceResults', 2025], queryFn: fetchRaceResults });
  const { data: sprintResults, isLoading: isLoadingSprints } = useQuery({ queryKey: ['sprintResults', 2025], queryFn: fetchSprintResults });
  const { data: standingsList, isLoading: isLoadingStandings } = useQuery({ queryKey: ['driverStandings', 2025], queryFn: fetchDriverStandings });

  const isLoading = isLoadingRaces || isLoadingResults || isLoadingSprints || isLoadingStandings;
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

  // Merge dos dados: para cada round, juntar resultados de corrida e sprint
  const rounds = allRaces?.map(r => r.round) || [];
  // Map de pilotos: driverId -> dados
  const driverMap: Record<string, {
    driver: Driver;
    constructor: Constructor;
    racePoints: { [round: string]: number };
    sprintPoints: { [round: string]: number };
    totalPoints: number;
  }> = {};

  // Inicializar com standings oficiais
  standingsList?.DriverStandings.forEach(ds => {
    driverMap[ds.Driver.driverId] = {
      driver: ds.Driver,
      constructor: ds.Constructors[0],
      racePoints: {},
      sprintPoints: {},
      totalPoints: parseFloat(ds.points)
    };
  });

  // Preencher pontos de corrida
  if (raceResults) {
    for (const round of Object.keys(raceResults)) {
      const race = raceResults[round];
      race.forEach(result => {
        const id = result.Driver.driverId;
        if (!driverMap[id]) {
          driverMap[id] = {
            driver: result.Driver,
            constructor: result.Constructor,
            racePoints: {},
            sprintPoints: {},
            totalPoints: 0
          };
        }
        driverMap[id].racePoints[round] = parseFloat(result.points);
      });
    }
  }

  // Preencher pontos de sprint
  if (sprintResults) {
    for (const round of Object.keys(sprintResults)) {
      for (const result of sprintResults[round]) {
        const id = result.Driver.driverId;
        if (!driverMap[id]) {
          driverMap[id] = {
            driver: result.Driver,
            constructor: result.Constructor,
            racePoints: {},
            sprintPoints: {},
            totalPoints: 0
          };
        }
        driverMap[id].sprintPoints[round] = parseFloat(result.points);
      }
    }
  }

  // Ordenar pilotos pelo total oficial
  const drivers = Object.values(driverMap).sort((a, b) => b.totalPoints - a.totalPoints);

  // Filtrar rounds a exibir
  const roundsToShow = viewType === "completed"
    ? rounds.filter(round => (raceResults && raceResults[round]) || (sprintResults && sprintResults[round]))
    : rounds;

  // Próxima corrida
  const today = new Date();
  const nextRace = allRaces?.find(race => new Date(race.date) > today);

  return (
    <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-red-800/50 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-red-700 mb-1 sm:mb-2">
              Temporada F1 2025 - Corrida a Corrida
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Pontos por corrida e sprint de cada piloto</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {nextRace && (
              <div className="bg-red-600 border border-red-500 rounded-lg px-2 sm:px-4 py-1 sm:py-2">
                <span className="text-white font-medium text-xs sm:text-sm">
                  🏎️ Próxima: {nextRace.raceName} {getCountryPTBR(nextRace.Circuit.Location.country).flag}
                </span>
              </div>
            )}
            <Select
              value={viewType}
              onValueChange={(value: "all" | "completed") => setViewType(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-white border-red-800/50 text-red-800 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-red-800/30 text-red-800">
                <SelectItem
                  value="completed"
                  className="text-red-800 hover:bg-red-900/5 focus:bg-red-900/5 text-xs sm:text-sm"
                >
                  Apenas Realizadas
                </SelectItem>
                <SelectItem
                  value="all"
                  className="text-red-800 hover:bg-red-900/5 focus:bg-red-900/5 text-xs sm:text-sm"
                >
                  Calendário Completo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-red-800/60 bg-white">
              <TableHead className="text-red-700 font-bold sticky left-0 bg-white min-w-[80px] sm:min-w-[220px] z-20 border-r border-red-800/30 text-xs sm:text-sm">
                Piloto
              </TableHead>
              <TableHead className="text-red-700 font-bold sticky left-[80px] sm:left-[220px] bg-white min-w-[40px] sm:min-w-[100px] z-20 border-r border-red-800/30 text-xs sm:text-sm">
                Equipe
              </TableHead>
              {roundsToShow.map((round) => {
                const race = allRaces?.find(r => r.round === round);
                const country = race.Circuit.Location.country;
                const countryInfo = getCountryPTBR(country);
                // Abreviações dos países em português
                const countryAbbr: { [key: string]: string } = {
                  "Australia": "AUS",
                  "China": "CHN", 
                  "Japan": "JAP",
                  "Bahrain": "BAH",
                  "Saudi Arabia": "ARS",
                  "USA": "EUA",
                  "Italy": "ITA",
                  "Monaco": "MON",
                  "Spain": "ESP",
                  "Canada": "CAN",
                  "Austria": "AUT",
                  "UK": "GBR",
                  "Hungary": "HUN",
                  "Belgium": "BEL",
                  "Netherlands": "HOL",
                  "Azerbaijan": "AZE",
                  "Singapore": "SIN",
                  "Mexico": "MEX",
                  "Brazil": "BRA",
                  "Qatar": "CAT",
                  "UAE": "EAU"
                };
                const abbr = countryAbbr[country] || country.slice(0, 3).toUpperCase();
                const isSprint = sprintRounds2025.includes(round);
                return (
                  <TableHead
                    key={round}
                    className="text-red-700 font-bold text-center min-w-[40px] sm:min-w-[120px] bg-white text-xs sm:text-sm"
                  >
                  <div className="flex flex-col items-center py-1">
                    <span className="text-sm sm:text-2xl mb-0 sm:mb-1">{countryInfo.flag}</span>
                    <span className="text-xs font-medium text-gray-500">
                      {abbr}
                    </span>
                    <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-2">
                      {isSprint && (
                        <span className="text-xs bg-yellow-500 text-black px-1 py-0.5 rounded-full font-bold">S</span>
                      )}
                      {raceResults && raceResults[round] && (
                        <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">R</span>
                      )}
                    </div>
                  </div>
                  </TableHead>
                );
              })}
              <TableHead className="text-red-700 font-bold text-center min-w-[50px] sm:min-w-[100px] sticky right-0 bg-white z-20 border-l border-red-800/30 text-xs sm:text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-base sm:text-lg">🏆</span>
                  <span className="text-xs sm:text-sm">Total</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length > 0 ? drivers.map((driverData, index) => {
              const { driver, constructor } = driverData;
              return (
                <TableRow
                  key={driver.driverId}
                  className="border-red-800/30 hover:bg-red-900/5 transition-colors"
                >
                  <TableCell className="sticky left-0 bg-white text-red-900 z-10 border-r border-red-800/30 py-1 sm:py-4">
                    <div className="flex items-center space-x-1 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-bold min-w-[16px] sm:min-w-[25px] h-4 sm:h-6 flex items-center justify-center rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' : 
                          index === 2 ? 'bg-amber-700 text-white' : 
                          'bg-gray-200 text-gray-900'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-xs sm:text-xl hidden sm:inline">{getNationalityFlag(driver.nationality)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold whitespace-nowrap text-xs sm:text-lg leading-tight">{driver.givenName}</span>
                        <span className="font-semibold whitespace-nowrap text-xs sm:text-lg leading-tight">{driver.familyName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="sticky left-[80px] sm:left-[220px] bg-white z-10 border-r border-red-800/30 py-1 sm:py-4">
                    <TeamLogo teamName={constructor.name} className="w-4 h-3 sm:w-12 sm:h-8" />
                  </TableCell>
                  {roundsToShow.map(round => {
                    const racePoints = driverData.racePoints[round] || 0;
                    // Só considerar pontos de sprint se o round está em sprintRounds2025
                    const sprintPoints = sprintRounds2025.includes(round) ? (driverData.sprintPoints[round] || 0) : 0;
                    const hasRace = racePoints > 0;
                    const hasSprint = sprintPoints > 0;
                    return (
                      <TableCell key={round} className="text-center bg-white">
                        <div className="flex flex-col gap-0.5 items-center">
                          {hasSprint && (
                            <span className="text-xs bg-yellow-500 text-black px-1 py-0.5 rounded font-bold min-w-[18px] sm:min-w-[32px]">
                              {sprintPoints}
                            </span>
                          )}
                          {hasRace && (
                            <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-bold min-w-[18px] sm:min-w-[32px]">
                              {racePoints}
                            </span>
                          )}
                          {!hasRace && !hasSprint && (
                            <span className="text-gray-400 text-xs sm:text-lg">-</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-red-900 font-bold text-sm sm:text-2xl text-center sticky right-0 bg-white z-10 border-l border-red-800/30 py-1 sm:py-4">
                    <div className="flex flex-col items-center">
                      <span className={`${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-400' : 
                        index === 2 ? 'text-amber-500' : 
                        'text-red-900'
                      }`}>
                        {driverData.totalPoints}
                      </span>
                      <span className="text-xs text-gray-500 font-normal hidden sm:inline">pts</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={roundsToShow.length + 3} className="text-center text-gray-400 py-12 text-lg bg-white">
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
