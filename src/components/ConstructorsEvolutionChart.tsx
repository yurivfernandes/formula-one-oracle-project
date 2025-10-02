import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
type ConstructorStandingsList = { 
  season: string; 
  round: string; 
  ConstructorStandings: { 
    position: string; 
    points: string; 
    wins: string; 
    Constructor: Constructor;
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

// Função para obter a cor da equipe
const getTeamColor = (constructorName: string): string => {
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

const fetchConstructorStandings = async (): Promise<ConstructorStandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0];
};

const ConstructorsEvolutionChart = () => {
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
    queryKey: ['constructorStandings', 2025], 
    queryFn: fetchConstructorStandings 
  });

  const isLoading = isLoadingRaces || isLoadingResults || isLoadingSprints || isLoadingStandings;

  // Calcular dados do gráfico
  const { chartData, constructors } = useMemo(() => {
    if (!allRaces || !raceResults || !sprintResults || !standingsList) {
      return { chartData: [], constructors: [] };
    }

    // Pegar apenas corridas completadas
    const completedRounds = Object.keys(raceResults).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Mapa de construtores
    const constructorMap: Record<string, {
      constructor: Constructor;
      pointsByRound: { [round: string]: number };
      cumulativePoints: { [round: string]: number };
    }> = {};

    // Inicializar com os construtores do standings
    standingsList.ConstructorStandings.forEach(cs => {
      constructorMap[cs.Constructor.constructorId] = {
        constructor: cs.Constructor,
        pointsByRound: {},
        cumulativePoints: {}
      };
    });

    // Preencher pontos de corrida
    for (const round of Object.keys(raceResults)) {
      const race = raceResults[round];
      race.forEach(result => {
        const id = result.Constructor.constructorId;
        if (!constructorMap[id]) {
          constructorMap[id] = {
            constructor: result.Constructor,
            pointsByRound: {},
            cumulativePoints: {}
          };
        }
        constructorMap[id].pointsByRound[round] = 
          (constructorMap[id].pointsByRound[round] || 0) + parseFloat(result.points);
      });
    }

    // Preencher pontos de sprint
    for (const round of Object.keys(sprintResults)) {
      for (const result of sprintResults[round]) {
        const id = result.Constructor.constructorId;
        if (constructorMap[id]) {
          constructorMap[id].pointsByRound[round] = 
            (constructorMap[id].pointsByRound[round] || 0) + parseFloat(result.points);
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
    Object.values(constructorMap).forEach(constructorData => {
      let cumulative = 0;
      orderedRounds.forEach(({ round }) => {
        cumulative += constructorData.pointsByRound[round] || 0;
        constructorData.cumulativePoints[round] = cumulative;
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

      Object.entries(constructorMap).forEach(([constructorId, constructorData]) => {
        dataPoint[constructorData.constructor.name] = constructorData.cumulativePoints[round] || 0;
      });

      return dataPoint;
    });

    // Ordenar construtores por pontos totais (usar último round ordenado)
    const lastRound = orderedRounds.length > 0 ? orderedRounds[orderedRounds.length - 1].round : completedRounds[completedRounds.length - 1];
    const sortedConstructors = Object.values(constructorMap)
      .sort((a, b) => {
        const aTotal = a.cumulativePoints[lastRound] || 0;
        const bTotal = b.cumulativePoints[lastRound] || 0;
        return bTotal - aTotal;
      });

    return { chartData: data, constructors: sortedConstructors };
  }, [allRaces, raceResults, sprintResults, standingsList]);

  // Estado para construtores selecionados (inicialmente os 3 primeiros)
  const [selectedConstructors, setSelectedConstructors] = useState<string[]>(() => 
    constructors.slice(0, 3).map(c => c.constructor.name)
  );

  // Atualizar seleção inicial quando os dados carregarem
  useMemo(() => {
    if (constructors.length > 0 && selectedConstructors.length === 0) {
      setSelectedConstructors(constructors.slice(0, 3).map(c => c.constructor.name));
    }
  }, [constructors]);

  const toggleConstructor = (constructorName: string) => {
    setSelectedConstructors(prev => {
      if (prev.includes(constructorName)) {
        return prev.filter(name => name !== constructorName);
      } else {
        return [...prev, constructorName];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Evolução dos Construtores</h2>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Evolução dos Construtores</h2>
        <p className="text-gray-600">Ainda não há dados suficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-800/70 overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-red-800/50">
        <h2 className="text-xl sm:text-3xl font-bold text-red-700 mb-2">
          Evolução dos Construtores - Temporada 2025
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Acompanhe a evolução de pontos das equipes ao longo da temporada
        </p>

        {/* Select e Construtores selecionados lado a lado */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
          {/* Select para adicionar construtores */}
          <div className="flex-shrink-0">
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedConstructors.includes(value)) {
                  toggleConstructor(value);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[300px] bg-white border-red-800/50 text-red-800">
                <SelectValue placeholder="Adicionar equipe..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-red-800/30">
                {constructors
                  .filter(constructorData => !selectedConstructors.includes(constructorData.constructor.name))
                  .map((constructorData) => {
                    return (
                      <SelectItem
                        key={constructorData.constructor.constructorId}
                        value={constructorData.constructor.name}
                        className="text-red-800 hover:bg-red-900/5 focus:bg-red-900/5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getTeamColor(constructorData.constructor.name) }}
                          />
                          <span>{constructorData.constructor.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            {selectedConstructors.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2">
                Selecione pelo menos uma equipe para visualizar o gráfico
              </p>
            )}
          </div>

          {/* Construtores selecionados */}
          {selectedConstructors.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedConstructors.map((constructorName) => {
                const constructorData = constructors.find(c => c.constructor.name === constructorName);
                return (
                  <Badge
                    key={constructorName}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: constructorData ? getTeamColor(constructorData.constructor.name) : '#999999',
                      color: 'white'
                    }}
                  >
                    <span>{constructorName}</span>
                    <button
                      onClick={() => toggleConstructor(constructorName)}
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

      {selectedConstructors.length > 0 && (
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
              {selectedConstructors.map((constructorName) => {
                const constructorData = constructors.find(c => c.constructor.name === constructorName);
                return (
                  <Line
                    key={constructorName}
                    type="monotone"
                    dataKey={constructorName}
                    stroke={constructorData ? getTeamColor(constructorData.constructor.name) : '#999999'}
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

export default ConstructorsEvolutionChart;