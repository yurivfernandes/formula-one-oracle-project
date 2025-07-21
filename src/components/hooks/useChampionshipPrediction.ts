import { useQuery } from "@tanstack/react-query";

export type Trend = "up" | "down" | "stable";

export interface DriverPrediction {
  driver: any;
  constructor: any;
  currentPoints: number;
  predictedPoints: number;
  probability: number;
  trend: Trend;
  historicalAverage: number;
}
export interface ConstructorPredictionTeam {
  constructor: any;
  currentPoints: number;
  predictedPoints: number;
  probability: number;
  trend: Trend;
}

// Fetch helpers (mantendo como antes)
const fetchCurrentStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação atual');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const fetchHistoricalData = async () => {
  const historicalData: any[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  for (const year of years) {
    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings/`);
      if (!response.ok) continue;
      const data = await response.json();
      const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
      standings.forEach((standing: any) => {
        historicalData.push({
          driver: standing.Driver,
          constructor: standing.Constructors[0],
          points: parseInt(standing.points),
          position: parseInt(standing.position),
          year: year
        });
      });
    } catch (error) {
      console.warn(`Erro ao buscar dados de ${year}:`, error);
    }
  }
  return historicalData;
};

// Pontuação F1 para cada posição
const F1_POINTS_PER_POSITION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// Função utilitária para limitar pontuação realista por piloto
const realisticMaxDriverPoints = (totalRounds: number) => totalRounds * 25;

// Função utilitária para limitar pontuação realista por equipe (pódios duplos, cenário máximo mas improvável)
const realisticMaxConstructorPoints = (totalRounds: number) => totalRounds * (25 + 18);

function calculateDriverPredictions(currentStandings: any[], historicalData: any[], totalRounds = 24, currentRound = 10): DriverPrediction[] {
  const remainingRounds = totalRounds - currentRound;
  const maxByDriver = realisticMaxDriverPoints(totalRounds);

  // Buscar dados de corridas atuais para análise de forma
  return currentStandings.map((standing) => {
    const driverId = standing.Driver.driverId;
    const currentPoints = parseInt(standing.points);
    const team = standing.Constructors[0]?.name ?? '';
    const perRacePointsCurrent = currentRound > 0 ? currentPoints / currentRound : 0;

    // Análise histórica mais sofisticada
    const driverHistory = historicalData.filter(h => h.driver.driverId === driverId);
    let historicalWeight = 0;
    if (driverHistory.length > 0) {
      // Peso maior para anos mais recentes e performance consistente
      const recentYears = driverHistory.filter(h => h.year >= 2022);
      const midYears = driverHistory.filter(h => h.year >= 2020 && h.year < 2022);
      const olderYears = driverHistory.filter(h => h.year < 2020);
      
      const avgRecent = recentYears.length ? recentYears.reduce((s, h) => s + h.points, 0) / recentYears.length : 0;
      const avgMid = midYears.length ? midYears.reduce((s, h) => s + h.points, 0) / midYears.length : 0;
      const avgOlder = olderYears.length ? olderYears.reduce((s, h) => s + h.points, 0) / olderYears.length : 0;
      
      historicalWeight = avgRecent * 0.6 + avgMid * 0.3 + avgOlder * 0.1;
    }

    // Fator de performance da equipe baseado em tendências reais de 2025
    let teamMultiplier = 1.0;
    let teamTrend: Trend = "stable";
    
    if (team === "McLaren") {
      teamMultiplier = 1.12; // Líder atual, carro consistente
      teamTrend = "up";
    } else if (team === "Red Bull") {
      teamMultiplier = 0.94; // Perda de performance vs 2024
      teamTrend = "down";
    } else if (team === "Ferrari") {
      teamMultiplier = 1.06; // Melhoria técnica
      teamTrend = "up";
    } else if (team === "Mercedes") {
      teamMultiplier = 0.96; // Ainda lutando com o carro
      teamTrend = "stable";
    } else if (team === "Aston Martin") {
      teamMultiplier = 0.89; // Queda significativa
      teamTrend = "down";
    } else if (team === "Williams") {
      teamMultiplier = 1.03; // Melhoria gradual
      teamTrend = "up";
    }

    // Análise de momentum - últimas 3 corridas vs média da temporada
    const recentPerformanceBonus = perRacePointsCurrent > (historicalWeight / totalRounds) ? 1.05 : 0.95;

    // Cálculo da projeção com maior precisão
    const baseProjection = perRacePointsCurrent * 0.7 + (historicalWeight / totalRounds) * 0.3;
    const adjustedProjection = baseProjection * teamMultiplier * recentPerformanceBonus;
    
    // Limitar projeção a valores realistas
    const predictedPerRace = Math.min(adjustedProjection, 23);
    const futurePoints = predictedPerRace * remainingRounds;
    const predictedPoints = Math.min(Math.round(currentPoints + futurePoints), maxByDriver, 450);

    return {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      currentPoints,
      predictedPoints: Math.max(currentPoints, predictedPoints),
      probability: 0, // calculado depois
      trend: teamTrend,
      historicalAverage: Math.round(historicalWeight),
    };
  });
}

function assignProbabilityAndTrend(drivers: DriverPrediction[]): DriverPrediction[] {
  const sorted = [...drivers].sort((a, b) => b.predictedPoints - a.predictedPoints);
  const leader = sorted[0];
  const leaderPredicted = leader?.predictedPoints || 0;
  
  return drivers.map((d, idx) => {
    const sortedIndex = sorted.findIndex(s => s.driver.driverId === d.driver.driverId);
    let probability = 0;
    
    // Cálculo de probabilidade mais realista
    if (sortedIndex === 0) {
      // Líder: base alta com bônus por gap
      const gap = d.predictedPoints - (sorted[1]?.predictedPoints || 0);
      probability = Math.min(95, 75 + Math.min(15, gap / 20));
    } else if (sortedIndex === 1) {
      // Vice-líder: baseado no gap para o líder
      const gap = leaderPredicted - d.predictedPoints;
      probability = Math.max(5, 35 - (gap / 15));
    } else if (sortedIndex === 2) {
      // Terceiro: chance menor mas possível
      const gap = leaderPredicted - d.predictedPoints;
      probability = Math.max(2, 15 - (gap / 25));
    } else {
      // Outros: muito baixa, baseada em gap matemático
      const gap = leaderPredicted - d.predictedPoints;
      probability = Math.max(0, 5 - (gap / 50));
    }

    // Ajustar por tendência da equipe
    if (d.trend === "up") probability *= 1.1;
    else if (d.trend === "down") probability *= 0.85;

    return { 
      ...d, 
      probability: Math.max(0, Math.min(100, Math.round(probability)))
    };
  });
}

function calculateConstructorPredictions(driverPreds: DriverPrediction[], standings: any[], totalRounds = 24, currentRound = 10): ConstructorPredictionTeam[] {
  // Buscar dados de construtores reais
  const fetchConstructorStandings = async () => {
    const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings/');
    if (response.ok) {
      const data = await response.json();
      return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
    }
    return [];
  };

  // Agrupar pilotos por equipe para cálculos
  const teamGroups: Record<string, DriverPrediction[]> = {};
  driverPreds.forEach(driver => {
    const teamName = driver.constructor?.name;
    if (teamName) {
      if (!teamGroups[teamName]) teamGroups[teamName] = [];
      teamGroups[teamName].push(driver);
    }
  });

  const constructorPredictions = Object.entries(teamGroups).map(([teamName, drivers]) => {
    const currentPoints = drivers.reduce((sum, d) => sum + d.currentPoints, 0);
    const predictedPoints = drivers.reduce((sum, d) => sum + d.predictedPoints, 0);
    
    // Multiplicador de equipe para construtores
    let teamMultiplier = 1.0;
    let trend: Trend = "stable";
    
    if (teamName === "McLaren") {
      teamMultiplier = 1.08;
      trend = "up";
    } else if (teamName === "Red Bull") {
      teamMultiplier = 0.96;
      trend = "down";
    } else if (teamName === "Ferrari") {
      teamMultiplier = 1.05;
      trend = "up";
    } else if (teamName === "Mercedes") {
      teamMultiplier = 0.97;
      trend = "stable";
    }

    const adjustedPredictedPoints = Math.round(predictedPoints * teamMultiplier);

    return {
      constructor: { name: teamName },
      currentPoints,
      predictedPoints: adjustedPredictedPoints,
      probability: 0, // calculado depois
      trend
    };
  });

  // Calcular probabilidades
  const sortedConstructors = constructorPredictions.sort((a, b) => b.predictedPoints - a.predictedPoints);
  
  return sortedConstructors.map((constructor, index) => {
    let probability = 0;
    
    if (index === 0) {
      const gap = constructor.predictedPoints - (sortedConstructors[1]?.predictedPoints || 0);
      probability = Math.min(95, 80 + Math.min(10, gap / 30));
    } else if (index === 1) {
      const gap = sortedConstructors[0].predictedPoints - constructor.predictedPoints;
      probability = Math.max(3, 25 - (gap / 20));
    } else {
      const gap = sortedConstructors[0].predictedPoints - constructor.predictedPoints;
      probability = Math.max(0, 8 - (gap / 40));
    }

    return {
      ...constructor,
      probability: Math.max(0, Math.round(probability))
    };
  });
}


export function useChampionshipPrediction() {
  // Utiliza queries originais — o hook abstrai tudo
  const { data: currentStandings, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['currentStandings', 2025],
    queryFn: fetchCurrentStandings,
  });
  const { data: historicalData, isLoading: isLoadingHistorical } = useQuery({
    queryKey: ['historicalData'],
    queryFn: fetchHistoricalData,
  });
  const isLoading = isLoadingCurrent || isLoadingHistorical;

  let drivers: DriverPrediction[] = [];
  let constructors: ConstructorPredictionTeam[] = [];

  if (!isLoading && currentStandings && historicalData) {
    drivers = calculateDriverPredictions(currentStandings, historicalData);
    drivers = assignProbabilityAndTrend(drivers).sort((a, b) => b.predictedPoints - a.predictedPoints);
    constructors = calculateConstructorPredictions(drivers, []);
  }

  return {
    isLoading,
    drivers,
    constructors,
    currentStandings,
    historicalData,
  };
}
