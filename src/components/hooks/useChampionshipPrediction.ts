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

  // Score base de cada piloto, também ponderado pelo desempenho recente
  return currentStandings.map((standing) => {
    const driverId = standing.Driver.driverId;
    const currentPoints = parseInt(standing.points);
    const team = standing.Constructors[0]?.name ?? '';
    const perRacePointsCurrent = currentRound > 0 ? currentPoints / currentRound : 0;

    // Média histórica
    const driverHistory = historicalData.filter(h => h.driver.driverId === driverId);
    let historicalAverage = 0;
    if (driverHistory.length > 0) {
      // 70% dos últimos 3 anos, 30% do resto
      const recent = driverHistory.filter(h => h.year >= 2022);
      const older = driverHistory.filter(h => h.year < 2022);
      const avgRecent = recent.length ? recent.reduce((s, h) => s + h.points, 0) / recent.length : 0;
      const avgOlder = older.length ? older.reduce((s, h) => s + h.points, 0) / (older.length || 1) : 0;
      historicalAverage = avgRecent * 0.7 + avgOlder * 0.3;
    }

    // O desempenho do time afeta multiplciador da predição
    let multiplier = 1.0;
    if (team === "McLaren") multiplier = 1.09;
    else if (team === "Red Bull") multiplier = 0.97;
    else if (team === "Ferrari") multiplier = 1.04;
    else if (team === "Mercedes") multiplier = 0.98;

    // Projeção do piloto: ponderação entre proporção do ano + histórico, ajustado pelo multiplicador
    const predictedPerRace = Math.min(
      (perRacePointsCurrent * 0.55 + (historicalAverage / totalRounds) * 0.45) * multiplier,
      22
    );
    let futurePoints = predictedPerRace * remainingRounds;
    // O máximo por piloto é sempre coerente (não pode passar 25 por corrida)
    let predictedPoints = Math.min(Math.round(currentPoints + futurePoints), maxByDriver, 420);

    // Tendência (histórico recente & gap para líder)
    let trend: Trend = "stable";
    if (historicalAverage > 170) trend = "up";
    else if (historicalAverage < 70) trend = "down";

    return {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      currentPoints,
      predictedPoints: Math.max(currentPoints, predictedPoints),
      probability: 0, // calculado depois!
      trend,
      historicalAverage: Math.round(historicalAverage),
    };
  });
}

function limitTeamTotal(driverPreds: DriverPrediction[], totalRounds = 24): DriverPrediction[] {
  // Map dos pilotos por equipe
  const perTeam: Record<string, DriverPrediction[]> = {};
  driverPreds.forEach((p) => {
    const team = p.constructor?.name;
    if (!team) return;
    perTeam[team] = perTeam[team] || [];
    perTeam[team].push(p);
  });
  // Limitar total de pontos preditos por equipe para não ultrapassar construtores
  const maxByTeam = realisticMaxConstructorPoints(totalRounds);
  Object.values(perTeam).forEach((drivers) => {
    // A soma dos pilotos nunca ultrapassa 99% do valor máximo da equipe
    const sum = drivers.reduce((tot, d) => tot + d.predictedPoints, 0);
    if (sum > maxByTeam * 0.99) {
      drivers.forEach((d) => {
        d.predictedPoints = Math.round((d.predictedPoints / sum) * (maxByTeam * 0.99));
      });
    }
  });
  return driverPreds;
}

function assignProbabilityAndTrend(drivers: DriverPrediction[]): DriverPrediction[] {
  const sorted = [...drivers].sort((a, b) => b.currentPoints - a.currentPoints);
  const leaderPts = sorted[0]?.currentPoints || 0;
  const maxGap = 120; // diferença máxima aceitável para ser campeão
  return drivers.map((d, idx) => {
    let baseProb = 30;
    const gap = leaderPts - d.currentPoints;
    if (idx === 0) {
      baseProb = 70 + (d.predictedPoints > 320 ? 10 : 0) + (d.constructor?.name === "McLaren" ? 7 : 0);
    } else {
      baseProb = Math.round(35 - (gap / maxGap) * 25 + (d.historicalAverage > 150 ? 2 : 0));
      baseProb = Math.max(2, Math.min(40, baseProb));
    }
    let trend: Trend = d.trend;
    if (d.historicalAverage > 170) trend = "up";
    else if (d.historicalAverage < 70) trend = "down";
    return { ...d, probability: Math.max(0, Math.min(100, baseProb)), trend };
  });
}

function calculateConstructorPredictions(driverPreds: DriverPrediction[], standings: any[], totalRounds = 24, currentRound = 10): ConstructorPredictionTeam[] {
  // Para cada equipe, considerar soma dos pilotos e histórico do time
  const remainingRounds = totalRounds - currentRound;
  const maxByTeam = realisticMaxConstructorPoints(totalRounds);

  return standings.map((standing, idx): ConstructorPredictionTeam => {
    const team = standing.Constructor?.name ?? '';
    const currentPoints = parseInt(standing.points);
    // Soma dos pilotos daquela equipe
    const predictedSum = driverPreds.filter(p => p.constructor?.name === team)
      .reduce((s, p) => s + p.predictedPoints, 0);

    // Histórico: média dos scores dos últimos 10 anos p/ aquela equipe
    // (simplificação: não temos histórico da equipe, só dos pilotos)
    let multiplier = 1.0;
    if (team === "McLaren") multiplier = 1.08;
    else if (team === "Red Bull") multiplier = 0.97;
    else if (team === "Ferrari") multiplier = 1.03;
    else if (team === "Mercedes") multiplier = 0.98;

    // A previsão sempre respeita a soma dos pilotos, mas pode ser até 8% acima caso histórico seja favorável
    let predictedPoints = Math.round(Math.min(predictedSum * multiplier, maxByTeam, 650));

    // Probabilidade semelhante ao modelo antigo
    let probability = 0;
    const leadingPoints = parseInt(standings[0]?.points ?? "0");
    const pointsGap = leadingPoints - currentPoints;
    const maxPossibleGain = remainingRounds * 43;
    if (idx === 0) {
      probability = Math.max(70, Math.min(95, 75 + (multiplier - 1) * 30));
    } else {
      const catchUpProbability = Math.max(0, (maxPossibleGain - pointsGap) / maxPossibleGain);
      const teamFactor = (multiplier - 0.95) * 40;
      probability = Math.min(40, (catchUpProbability * 100 * 0.55) + teamFactor);
    }

    // Tendência para cada time baseada nos pilotos
    let trend: Trend = "stable";
    if (multiplier > 1.05) trend = "up";
    else if (multiplier < 0.96) trend = "down";

    return {
      constructor: standing.Constructor,
      currentPoints,
      predictedPoints,
      probability: Math.max(0, Math.round(probability)),
      trend
    };
  }).sort((a, b) => b.predictedPoints - a.predictedPoints);
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
    drivers = limitTeamTotal(drivers);
    drivers = assignProbabilityAndTrend(drivers).sort((a, b) => b.predictedPoints - a.predictedPoints);
    // Recebendo standings de construtores p/ consistência visual
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
