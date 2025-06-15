import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import PredictionExplanation from "./PredictionExplanation";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

// Tipos de dados
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

interface HistoricalData {
  driver: Driver;
  constructor: Constructor;
  points: number;
  position: number;
  year: number;
}

interface PredictionData {
  driver: Driver;
  constructor: Constructor;
  currentPoints: number;
  predictedPoints: number;
  probability: number;
  trend: 'up' | 'down' | 'stable';
  historicalAverage: number;
}

// Funções auxiliares
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

// Funções de fetch
const fetchCurrentStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação atual');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const fetchHistoricalData = async (): Promise<HistoricalData[]> => {
  const historicalData: HistoricalData[] = [];
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

const calculatePrediction = (currentStandings: any[], historicalData: HistoricalData[]): PredictionData[] => {
  const currentRound = 10;
  const totalRounds = 24;
  const remainingRounds = totalRounds - currentRound;
  
  return currentStandings.map((standing, index) => {
    const driverId = standing.Driver.driverId;
    const currentPoints = parseInt(standing.points);
    
    // Buscar dados históricos do piloto
    const driverHistory = historicalData.filter(h => h.driver.driverId === driverId);
    const historicalAverage = driverHistory.length > 0 
      ? driverHistory.reduce((sum, h) => sum + h.points, 0) / driverHistory.length 
      : currentPoints;
    
    // Calcular média de pontos por corrida com análise de tendência da temporada atual
    const currentPointsPerRace = currentRound > 0 ? currentPoints / currentRound : 0;
    
    // Análise da evolução do campeonato 2025 - McLaren dominante
    let teamPerformanceMultiplier = 1.0;
    const teamName = standing.Constructors[0].name;
    
    // Ajustes baseados na performance real das equipes em 2025
    if (teamName === "McLaren") {
      teamPerformanceMultiplier = 1.15; // McLaren está dominando
    } else if (teamName === "Red Bull") {
      teamPerformanceMultiplier = 0.92; // Red Bull perdeu competitividade
    } else if (teamName === "Ferrari") {
      teamPerformanceMultiplier = 1.05; // Ferrari competitiva
    } else if (teamName === "Mercedes") {
      teamPerformanceMultiplier = 0.95; // Mercedes em recuperação
    }
    
    // Calcular tendência baseada nos últimos 3 anos
    const recentHistory = driverHistory.filter(h => h.year >= 2022).sort((a, b) => b.year - a.year);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (recentHistory.length >= 2) {
      const recentAvg = recentHistory.slice(0, 2).reduce((sum, h) => sum + h.points, 0) / 2;
      const olderAvg = recentHistory.slice(2).reduce((sum, h) => sum + h.points, 0) / Math.max(1, recentHistory.length - 2);
      
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';
    }
    
    // Modelo de predição refinado baseado na performance da temporada 2025
    let projectedFinalPoints = currentPoints;
    
    if (currentRound > 0) {
      // Análise específica da temporada 2025 - corridas mais competitivas
      const seasonCompetitiveFactor = 1.08; // Temporada mais competitiva que 2024
      
      // Ajustar baseado na tendência do piloto
      let trendMultiplier = 1.0;
      if (trend === 'up') trendMultiplier = 1.08;
      else if (trend === 'down') trendMultiplier = 0.94;
      
      // Fator de progressão da temporada (performance pode variar)
      const seasonProgressionFactor = index < 5 ? 0.98 : 0.92; // Top 5 mantém melhor ritmo
      
      // Calcular pontuação projetada com base na competitividade atual
      const adjustedPointsPerRace = currentPointsPerRace * 
                                   teamPerformanceMultiplier * 
                                   trendMultiplier * 
                                   seasonCompetitiveFactor * 
                                   seasonProgressionFactor;
      
      // Limitar pontos por corrida a um máximo realista para 2025
      const maxPointsPerRace = index === 0 ? 18 : (index < 3 ? 16 : (index < 8 ? 12 : 8));
      const finalPointsPerRace = Math.min(adjustedPointsPerRace, maxPointsPerRace);
      
      const projectedRemainingPoints = finalPointsPerRace * remainingRounds;
      projectedFinalPoints = Math.round(currentPoints + projectedRemainingPoints);
    }
    
    // Garantir limites realistas baseados na evolução do esporte
    // 2025 é mais competitivo, então recordes podem ser quebrados moderadamente
    const maxRealisticPoints = 520; // Ligeiramente maior que o recorde de 2023
    const predictedPoints = Math.min(Math.max(currentPoints, projectedFinalPoints), maxRealisticPoints);
    
    // Probabilidade de vitória mais refinada baseada na situação atual
    const leadingPoints = currentStandings[0] ? parseInt(currentStandings[0].points) : currentPoints;
    const pointsGap = leadingPoints - currentPoints;
    const maxPossibleGain = remainingRounds * 25;
    
    let probability = 0;
    if (index === 0) {
      // Líder atual - probabilidade baseada na vantagem e performance da equipe
      const leadAdvantage = pointsGap === 0 ? 0 : -pointsGap;
      const teamStrength = teamPerformanceMultiplier;
      probability = Math.max(70, Math.min(95, 75 + (leadAdvantage / 10) + (teamStrength - 1) * 30));
    } else {
      // Outros pilotos - análise mais sofisticada
      const catchUpProbability = Math.max(0, (maxPossibleGain - pointsGap) / maxPossibleGain);
      const teamFactor = (teamPerformanceMultiplier - 0.8) * 50; // Converte para percentual
      probability = Math.min(40, (catchUpProbability * 100 * 0.6) + teamFactor);
    }
    
    return {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      currentPoints,
      predictedPoints,
      probability: Math.max(0, Math.round(probability)),
      trend,
      historicalAverage: Math.round(historicalAverage)
    };
  }).sort((a, b) => b.predictedPoints - a.predictedPoints);
};

const ChampionshipPrediction = () => {
  const { data: currentStandings, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['currentStandings', 2025],
    queryFn: fetchCurrentStandings,
  });

  const { data: historicalData, isLoading: isLoadingHistorical } = useQuery({
    queryKey: ['historicalData'],
    queryFn: fetchHistoricalData,
  });

  const isLoading = isLoadingCurrent || isLoadingHistorical;

  if (isLoading) {
    return (
      <div>
        <PredictionExplanation />
        <StandardTable
          title="Predição do Campeonato 2025"
          subtitle="Analisando dados históricos..."
          headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência", "Média Histórica"]}
        >
          <TableRow>
            <TableCell colSpan={8}>
              <Skeleton className="h-96 w-full" />
            </TableCell>
          </TableRow>
        </StandardTable>
      </div>
    );
  }

  const predictions = currentStandings && historicalData 
    ? calculatePrediction(currentStandings, historicalData)
    : [];

  return (
    <div>
      <PredictionExplanation />
      
      <StandardTable
        title="Predição do Campeonato 2025"
        subtitle="Baseado em dados históricos e performance atual da temporada"
        headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência", "Média Histórica"]}
      >
        {predictions.map((prediction, index) => (
          <TableRow 
            key={prediction.driver.driverId} 
            className="border-red-800/50 hover:bg-red-900/20 transition-colors"
          >
            <TableCell className="text-white font-bold min-w-[50px]">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-amber-600 text-white' : 
                'bg-gray-600 text-white'
              }`}>
                {index + 1}
              </span>
            </TableCell>
            <TableCell className="text-white min-w-[200px]">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getNationalityFlag(prediction.driver.nationality)}</span>
                <span className="font-semibold">{`${prediction.driver.givenName} ${prediction.driver.familyName}`}</span>
              </div>
            </TableCell>
            <TableCell className="min-w-[100px]">
              <TeamLogo teamName={prediction.constructor.name} />
            </TableCell>
            <TableCell className="text-white text-center font-bold text-lg min-w-[100px]">
              {prediction.currentPoints}
            </TableCell>
            <TableCell className="text-center min-w-[100px]">
              <span className="text-red-400 font-bold text-lg">
                {prediction.predictedPoints}
              </span>
            </TableCell>
            <TableCell className="text-center min-w-[120px]">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-white font-medium">{prediction.probability}%</span>
                <Progress 
                  value={prediction.probability} 
                  className="w-20 h-2"
                />
              </div>
            </TableCell>
            <TableCell className="text-center min-w-[100px]">
              <div className="flex items-center justify-center">
                {prediction.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                {prediction.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                {prediction.trend === 'stable' && <Minus className="w-5 h-5 text-yellow-400" />}
              </div>
            </TableCell>
            <TableCell className="text-white text-center font-medium min-w-[100px]">
              {prediction.historicalAverage}
            </TableCell>
          </TableRow>
        ))}
      </StandardTable>
    </div>
  );
};

export default ChampionshipPrediction;
