import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import PredictionExplanation from "./PredictionExplanation";

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
    
    // Calcular média de pontos por corrida atual (mais conservadora)
    const currentPointsPerRace = currentRound > 0 ? currentPoints / currentRound : 0;
    
    // Calcular tendência baseada nos últimos 3 anos
    const recentHistory = driverHistory.filter(h => h.year >= 2022).sort((a, b) => b.year - a.year);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (recentHistory.length >= 2) {
      const recentAvg = recentHistory.slice(0, 2).reduce((sum, h) => sum + h.points, 0) / 2;
      const olderAvg = recentHistory.slice(2).reduce((sum, h) => sum + h.points, 0) / Math.max(1, recentHistory.length - 2);
      
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';
    }
    
    // Modelo de predição mais conservador e realista
    let projectedFinalPoints = currentPoints;
    
    if (currentRound > 0) {
      // Fator de declínio para segunda metade da temporada (mais realista)
      const seasonProgressFactor = 0.85; // Performance tende a diminuir ligeiramente
      
      // Ajustar baseado na tendência (menos agressivo)
      let trendMultiplier = 1.0;
      if (trend === 'up') trendMultiplier = 1.05; // Reduzido de 1.1 para 1.05
      else if (trend === 'down') trendMultiplier = 0.95; // Reduzido de 0.9 para 0.95
      
      // Limitar pontos por corrida a um máximo mais realista
      const maxPointsPerRace = 15; // Raramente alguém média mais que isso
      const adjustedPointsPerRace = Math.min(currentPointsPerRace * trendMultiplier * seasonProgressFactor, maxPointsPerRace);
      
      const projectedRemainingPoints = adjustedPointsPerRace * remainingRounds;
      projectedFinalPoints = Math.round(currentPoints + projectedRemainingPoints);
    }
    
    // Garantir limites realistas baseados em dados históricos
    const maxRealisticPoints = 450; // Baseado nos recordes históricos
    const predictedPoints = Math.min(Math.max(currentPoints, projectedFinalPoints), maxRealisticPoints);
    
    // Probabilidade de vitória mais realista
    const leadingPoints = currentStandings[0] ? parseInt(currentStandings[0].points) : currentPoints;
    const pointsGap = leadingPoints - currentPoints;
    const maxPossibleGain = remainingRounds * 25; // Máximo teórico
    
    let probability = 0;
    if (index === 0) {
      // Líder atual tem vantagem significativa
      probability = Math.max(60, Math.min(95, 80 - (pointsGap / maxPossibleGain) * 100));
    } else {
      // Outros pilotos baseado na diferença de pontos
      const catchUpProbability = Math.max(0, (maxPossibleGain - pointsGap) / maxPossibleGain);
      probability = Math.min(35, catchUpProbability * 100);
    }
    
    return {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      currentPoints,
      predictedPoints,
      probability: Math.round(probability),
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
      <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/30 bg-black/50">
          <h2 className="text-2xl font-bold text-white mb-2">Predição do Campeonato 2025</h2>
          <p className="text-gray-300">Analisando dados históricos...</p>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const predictions = currentStandings && historicalData 
    ? calculatePrediction(currentStandings, historicalData)
    : [];

  return (
    <div>
      <PredictionExplanation />
      
      <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/30 bg-black/50">
          <h2 className="text-3xl font-bold text-white mb-2">Predição do Campeonato 2025</h2>
          <p className="text-gray-300">Baseado em dados históricos dos últimos 10 anos</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-red-800/30 bg-black/50">
                <TableHead className="text-gray-300 font-bold min-w-[50px]">Pos</TableHead>
                <TableHead className="text-gray-300 font-bold min-w-[200px]">Piloto</TableHead>
                <TableHead className="text-gray-300 font-bold min-w-[100px]">Equipe</TableHead>
                <TableHead className="text-gray-300 font-bold text-center min-w-[100px]">Pts Atuais</TableHead>
                <TableHead className="text-gray-300 font-bold text-center min-w-[100px]">Pts Preditos</TableHead>
                <TableHead className="text-gray-300 font-bold text-center min-w-[120px]">Probabilidade</TableHead>
                <TableHead className="text-gray-300 font-bold text-center min-w-[100px]">Tendência</TableHead>
                <TableHead className="text-gray-300 font-bold text-center min-w-[100px]">Média Histórica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction, index) => (
                <TableRow 
                  key={prediction.driver.driverId} 
                  className="border-red-800/30 hover:bg-red-900/20 transition-colors"
                >
                  <TableCell className="text-white font-bold">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-400 text-black' : 
                      index === 2 ? 'bg-amber-600 text-white' : 
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getNationalityFlag(prediction.driver.nationality)}</span>
                      <span className="font-semibold">{`${prediction.driver.givenName} ${prediction.driver.familyName}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center bg-white/10 rounded-lg p-2">
                      <img 
                        src={getTeamLogo(prediction.constructor.name)} 
                        alt={prediction.constructor.name}
                        className="w-12 h-8 object-contain brightness-0 invert"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-white text-xs font-medium px-2">${prediction.constructor.name}</span>`;
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-white text-center font-bold text-lg">
                    {prediction.currentPoints}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-red-400 font-bold text-lg">
                      {prediction.predictedPoints}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-white font-medium">{prediction.probability}%</span>
                      <Progress 
                        value={prediction.probability} 
                        className="w-20 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {prediction.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                      {prediction.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                      {prediction.trend === 'stable' && <Minus className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-white text-center font-medium">
                    {prediction.historicalAverage}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipPrediction;
