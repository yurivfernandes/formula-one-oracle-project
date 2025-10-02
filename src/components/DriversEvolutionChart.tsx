import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Driver = { driverId: string; givenName: string; familyName: string; nationality: string };
type Constructor = { constructorId: string; name: string };
type Result = { position: string; points: string; Driver: Driver; Constructor: Constructor };
type Race = {
  season: string;
  round: string;
  raceName: string;
  Circuit: { circuitName: string; Location: { country: string; locality: string } };
  date: string;
};
type StandingsList = { 
  season: string; 
  round: string; 
  DriverStandings: { 
    position: string; 
    points: string; 
    wins: string; 
    Driver: Driver; 
    Constructors: Constructor[] 
  }[] 
};

// Mapa de bandeiras por país
const countryFlags: { [key: string]: string } = {
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
  "UAE": "🇦🇪"
};

// Cores das equipes de F1
const teamColors: { [key: string]: string } = {
  "Ferrari": "#DC0000",           // Vermelho Ferrari
  "McLaren": "#FF8700",           // Laranja McLaren
  "Red Bull": "#1E41FF",          // Azul Red Bull
  "Mercedes": "#00D2BE",          // Ciano Mercedes
  "Aston Martin": "#006F62",      // Verde Aston Martin
  "Alpine F1 Team": "#0090FF",    // Azul Alpine
  "Williams": "#005AFF",          // Azul Williams
  "RB F1 Team": "#6692FF",        // Azul claro RB (Alpha Tauri)
  "Haas F1 Team": "#B6BABD",      // Cinza Haas
  "Sauber": "#00E701"             // Verde Sauber/Kick Sauber
};

// Função para obter a cor do piloto baseada na equipe
const getDriverColor = (constructorName: string): string => {
  return teamColors[constructorName] || "#999999"; // Cinza padrão se não encontrar
};

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



const DriversEvolutionChart = () => {
  const { data: allRaces, isLoading: isLoadingRaces } = useQuery({ 
    queryKey: ['races', 2025], 
    queryFn: fetchRaces 
  });
  
  const { data: raceResults, isLoading: isLoadingResults } = useQuery({ 
    queryKey: ['raceResults', 2025], 
    queryFn: fetchRaceResults 
  });
  
  const { data: sprintResults, isLoading: isLoadingSprints } = useQuery({ 
    queryKey: ['sprintResults', 2025], 
    queryFn: fetchSprintResults 
  });
  
  const { data: standingsList, isLoading: isLoadingStandings } = useQuery({ 
    queryKey: ['driverStandings', 2025], 
    queryFn: fetchDriverStandings 
  });

  const isLoading = isLoadingRaces || isLoadingResults || isLoadingSprints || isLoadingStandings;

  // Calcular dados do gráfico
  const { chartData, drivers } = useMemo(() => {
    if (!allRaces || !raceResults || !sprintResults || !standingsList) {
      return { chartData: [], drivers: [] };
    }

    // Pegar apenas corridas completadas
    const completedRounds = Object.keys(raceResults).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Mapa de pilotos
    const driverMap: Record<string, {
      driver: Driver;
      constructor: Constructor;
      pointsByRound: { [round: string]: number };
      cumulativePoints: { [round: string]: number };
    }> = {};

    // Obter equipe mais recente de cada piloto dos resultados de corrida
    const latestConstructors: { [driverId: string]: Constructor } = {};
    const sortedRounds = completedRounds.sort((a, b) => parseInt(b) - parseInt(a));
    
    // Iterar pelas corridas mais recentes primeiro
    for (const round of sortedRounds) {
      const race = raceResults[round];
      race.forEach(result => {
        const driverId = result.Driver.driverId;
        if (!latestConstructors[driverId]) {
          latestConstructors[driverId] = result.Constructor;
        }
      });
    }

    // Inicializar com os pilotos do standings usando equipes mais recentes
    standingsList.DriverStandings.forEach(ds => {
      const currentConstructor = latestConstructors[ds.Driver.driverId] || ds.Constructors[0];
      driverMap[ds.Driver.driverId] = {
        driver: ds.Driver,
        constructor: currentConstructor,
        pointsByRound: {},
        cumulativePoints: {}
      };
    });

    // Preencher pontos de corrida
    for (const round of Object.keys(raceResults)) {
      const race = raceResults[round];
      race.forEach(result => {
        const id = result.Driver.driverId;
        if (driverMap[id]) {
          driverMap[id].pointsByRound[round] = 
            (driverMap[id].pointsByRound[round] || 0) + parseFloat(result.points);
        }
      });
    }

    // Preencher pontos de sprint
    for (const round of Object.keys(sprintResults)) {
      for (const result of sprintResults[round]) {
        const id = result.Driver.driverId;
        if (driverMap[id]) {
          driverMap[id].pointsByRound[round] = 
            (driverMap[id].pointsByRound[round] || 0) + parseFloat(result.points);
        }
      }
    }

    // Ordenar rounds pela data da corrida para garantir sequência correta
    const orderedRounds = completedRounds
      .map(round => ({
        round,
        race: allRaces.find(r => r.round === round),
        roundNum: parseInt(round)
      }))
      .filter(item => item.race)
      .sort((a, b) => {
        // Primeiro tenta ordenar por data
        if (a.race?.date && b.race?.date) {
          return new Date(a.race.date).getTime() - new Date(b.race.date).getTime();
        }
        // Fallback: ordenar por número do round
        return a.roundNum - b.roundNum;
      });

    // Calcular pontos cumulativos na ordem cronológica correta
    Object.values(driverMap).forEach(driverData => {
      let cumulative = 0;
      orderedRounds.forEach(({ round }) => {
        cumulative += driverData.pointsByRound[round] || 0;
        driverData.cumulativePoints[round] = cumulative;
      });
    });

    // Criar dados do gráfico
    const data = orderedRounds.map((item, index) => {
      const { round, race } = item;
      const country = race?.Circuit.Location.country || "";
      const flag = countryFlags[country] || "🏁";
      
      const dataPoint: any = {
        round: index + 1,
        country: flag,
        raceName: race?.raceName || `R${round}`,
        originalRound: round
      };

      Object.entries(driverMap).forEach(([driverId, driverData]) => {
        dataPoint[driverData.driver.familyName] = driverData.cumulativePoints[round] || 0;
      });

      return dataPoint;
    });

    // Ordenar pilotos por pontos totais (usar último round ordenado)
    const lastRound = orderedRounds.length > 0 ? orderedRounds[orderedRounds.length - 1].round : completedRounds[completedRounds.length - 1];
    const sortedDrivers = Object.values(driverMap)
      .sort((a, b) => {
        const aTotal = a.cumulativePoints[lastRound] || 0;
        const bTotal = b.cumulativePoints[lastRound] || 0;
        return bTotal - aTotal;
      });

    return { chartData: data, drivers: sortedDrivers };
  }, [allRaces, raceResults, sprintResults, standingsList]);

  // Estado para pilotos selecionados (inicialmente os 4 primeiros)
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(() => 
    drivers.slice(0, 4).map(d => d.driver.familyName)
  );

  // Atualizar seleção inicial quando os dados carregarem
  useMemo(() => {
    if (drivers.length > 0 && selectedDrivers.length === 0) {
      setSelectedDrivers(drivers.slice(0, 4).map(d => d.driver.familyName));
    }
  }, [drivers]);

  const toggleDriver = (familyName: string) => {
    setSelectedDrivers(prev => {
      if (prev.includes(familyName)) {
        return prev.filter(name => name !== familyName);
      } else {
        if (prev.length < 4) {
          return [...prev, familyName];
        }
        return prev;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Evolução dos Pilotos</h2>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Evolução dos Pilotos</h2>
        <p className="text-gray-600">Ainda não há dados suficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-red-800/50">
        <h2 className="text-xl sm:text-3xl font-bold text-red-700 mb-2">
          Evolução dos Pilotos - Temporada 2025
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Acompanhe a evolução de pontos dos pilotos ao longo da temporada (selecione até 4 pilotos)
        </p>

        {/* Select e Pilotos selecionados lado a lado */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
          {/* Select para adicionar pilotos */}
          <div className="flex-shrink-0">
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedDrivers.includes(value)) {
                  toggleDriver(value);
                }
              }}
              disabled={selectedDrivers.length >= 4}
            >
              <SelectTrigger className="w-full sm:w-[300px] bg-white border-red-800/50 text-red-800">
                <SelectValue placeholder={
                  selectedDrivers.length >= 4 
                    ? "Limite de 4 pilotos atingido" 
                    : "Adicionar piloto..."
                } />
              </SelectTrigger>
              <SelectContent className="bg-white border-red-800/30">
                {drivers
                  .filter(driverData => !selectedDrivers.includes(driverData.driver.familyName))
                  .map((driverData) => {
                    return (
                      <SelectItem
                        key={driverData.driver.driverId}
                        value={driverData.driver.familyName}
                        className="text-red-800 hover:bg-red-900/5 focus:bg-red-900/5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getDriverColor(driverData.constructor.name) }}
                          />
                          <span>{driverData.driver.givenName} {driverData.driver.familyName}</span>
                          <span className="text-xs text-gray-500">({driverData.constructor.name})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            {selectedDrivers.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2">
                Selecione pelo menos um piloto para visualizar o gráfico
              </p>
            )}
          </div>

          {/* Pilotos selecionados */}
          {selectedDrivers.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedDrivers.map((familyName) => {
                const driverData = drivers.find(d => d.driver.familyName === familyName);
                return (
                  <Badge
                    key={familyName}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: driverData ? getDriverColor(driverData.constructor.name) : '#999999',
                      color: 'white'
                    }}
                  >
                    <span>{driverData?.driver.givenName} {familyName}</span>
                    <button
                      onClick={() => toggleDriver(familyName)}
                      className="hover:opacity-75 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedDrivers.length > 0 && (
        <div className="p-3 sm:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="country"
                tick={{ fontSize: 20 }}
                interval={0}
                height={60}
              />
              <YAxis
                label={{ value: 'Pontos', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #dc2626',
                  borderRadius: '8px'
                }}
                labelFormatter={(label) => {
                  const dataPoint = chartData.find(d => d.country === label);
                  return dataPoint?.raceName || label;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value) => value}
              />
              {selectedDrivers.map((familyName) => {
                const driverData = drivers.find(d => d.driver.familyName === familyName);
                return (
                  <Line
                    key={familyName}
                    type="monotone"
                    dataKey={familyName}
                    stroke={driverData ? getDriverColor(driverData.constructor.name) : '#999999'}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DriversEvolutionChart;
