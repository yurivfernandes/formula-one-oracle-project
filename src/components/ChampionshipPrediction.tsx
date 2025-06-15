import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import PredictionExplanation from "./PredictionExplanation";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";
import ConstructorsPrediction from "./ConstructorsPrediction";

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

// Função de cálculo de pontuação máxima possível numa temporada
const getMaxPointsPerSeason = (totalRounds: number) => {
  // 25 (p1) + 18 (p2) por corrida, por equipe (pódio duplo) = 43 x totalRounds
  // Por piloto = 25 x totalRounds (vitórias em todas)
  // Ex: 24 corridas → piloto: 600, equipe: 1032
  return {
    maxByDriver: totalRounds * 25,
    maxByTeam: totalRounds * (25 + 18),
  };
};

const calculatePrediction = (currentStandings: any[], historicalData: HistoricalData[]): PredictionData[] => {
  const currentRound = 10;
  const totalRounds = 24;
  const remainingRounds = totalRounds - currentRound;
  const { maxByDriver, maxByTeam } = getMaxPointsPerSeason(totalRounds);

  // Mapeia todos os pilotos e já agrupa para somar os pontos por equipe ao final:
  let predictions = currentStandings.map((standing, index) => {
    const driverId = standing.Driver.driverId;
    const currentPoints = parseInt(standing.points);

    // Buscar dados históricos do piloto
    const driverHistory = historicalData.filter(h => h.driver.driverId === driverId);

    // Média histórica, ponderando mais os anos recentes
    let historicalAverage = currentPoints;
    if (driverHistory.length > 0) {
      // Peso para anos mais recentes: 70% três últimos, 30% anteriores
      const recent = driverHistory.filter(h => h.year >= 2022);
      const older = driverHistory.filter(h => h.year < 2022);
      const recentAvg = recent.length > 0 ? recent.reduce((sum, h) => sum + h.points, 0) / recent.length : 0;
      const olderAvg = older.length > 0 ? older.reduce((sum, h) => sum + h.points, 0) / older.length : 0;
      historicalAverage = recentAvg * 0.7 + olderAvg * 0.3;
    }

    // Média de pontos por corrida atual
    const currentPointsPerRace = currentRound > 0 ? currentPoints / currentRound : 0;

    // Fator equipe (manter gap pequeno entre dupla, exceto no caso de amplo domínio)
    const team = standing.Constructors[0].name;
    let teamPerformanceMultiplier = 1.0;
    if (team === "McLaren") {
      teamPerformanceMultiplier = 1.10;
    } else if (team === "Red Bull") {
      teamPerformanceMultiplier = 0.95;
    } else if (team === "Ferrari") {
      teamPerformanceMultiplier = 1.05;
    } else if (team === "Mercedes") {
      teamPerformanceMultiplier = 0.97;
    }

    // O máximo de pontos que o piloto pode fazer daqui até o fim:
    const maxPossibleToGain = remainingRounds * 25;
    // Projeção realista do piloto (mantendo ritmo, ponderado pelo desempenho atual/histórico)
    let predicted = currentPoints;
    // Média entre pontos por corrida recente (comperformance) e histórico recente
    let predictedPerRace = (currentPointsPerRace * 0.7 + (historicalAverage / totalRounds) * 0.3) * teamPerformanceMultiplier;

    // Não pode passar do máximo por corrida (25), geralmente fica entre 10~20 nos bons pilotos
    predictedPerRace = Math.min(predictedPerRace, 21);

    // Projetar para corridas restantes
    predicted += Math.round(predictedPerRace * remainingRounds);

    // Nunca passar do máximo absoluto (vitória em todas), nem ultrapassar recordes históricos
    predicted = Math.min(predicted, maxByDriver, 420);

    return {
      driver: standing.Driver,
      constructor: standing.Constructors[0],
      currentPoints,
      predictedPoints: Math.max(currentPoints, Math.round(predicted)),
      probability: 0, // Preencher depois
      trend: "stable", // Preencher depois
      historicalAverage: Math.round(historicalAverage),
    };
  });

  // Ajuste para manter a soma dos pilotos da equipe <= máximo possível da equipe
  const pilotsByTeam: Record<string, PredictionData[]> = {};
  predictions.forEach((p) => {
    if (!pilotsByTeam[p.constructor.name]) pilotsByTeam[p.constructor.name] = [];
    pilotsByTeam[p.constructor.name].push(p);
  });
  Object.entries(pilotsByTeam).forEach(([team, list]) => {
    const total = list.reduce((s, v) => s + v.predictedPoints, 0);
    if (total > maxByTeam) {
      // Reduzir proporcionalmente
      list.forEach((p) => {
        p.predictedPoints = Math.round((p.predictedPoints / total) * maxByTeam);
      });
    }
  });

  // Agora definir probabilidades e tendência
  // O líder tem maior probabilidade, e depende do gap de pontos, forma e equipe
  const sortedCurrent = [...predictions].sort((a, b) => b.currentPoints - a.currentPoints);
  const leadingPoints = sortedCurrent[0] ? sortedCurrent[0].currentPoints : 0;
  predictions = predictions.map((p, idx) => {
    // Probabilidade: depende gap + performance equipe + histórico
    let chance = 30; // base
    const gap = leadingPoints - p.currentPoints;
    if (idx === 0) {
      chance = 70 + (p.predictedPoints > 320 ? 10 : 0) + (p.constructor.name === "McLaren" ? 7 : 0);
    } else {
      // Quanto menor o gap, mais chance, mas nunca acima de 40 para não ser incoerente
      chance = Math.round(35 - gap * 0.12 + (p.constructor.name === "McLaren" ? 3 : 0) + (p.historicalAverage > 150 ? 2 : 0));
      chance = Math.max(2, Math.min(40, chance));
    }

    // Tendência
    const recent = p.historicalAverage;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recent > 170) trend = "up";
    else if (recent < 70) trend = "down";

    return {
      ...p,
      probability: Math.max(0, Math.min(100, chance)),
      trend,
    };
  });

  // Ordenar por pontos preditos
  return predictions.sort((a, b) => b.predictedPoints - a.predictedPoints);
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
      <div className="space-y-8">
        <PredictionExplanation />
        <StandardTable
          title="Predição Pilotos 2025 - Top 6"
          subtitle="Analisando dados históricos..."
          headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
          // TEMAS PRETO E VERMELHO
          className="bg-black border border-red-800"
        >
          <TableRow>
            <TableCell colSpan={7}>
              <Skeleton className="h-96 w-full bg-black" />
            </TableCell>
          </TableRow>
        </StandardTable>
        <ConstructorsPrediction />
      </div>
    );
  }

  const predictions = currentStandings && historicalData 
    ? calculatePrediction(currentStandings, historicalData).slice(0, 6)
    : [];

  return (
    <div className="space-y-8">
      <PredictionExplanation />
      
      <StandardTable
        title="Predição Pilotos 2025 - Top 6"
        subtitle="Análise dos pilotos favoritos ao título mundial"
        headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-black border border-red-800"
      >
        {predictions.map((prediction, index) => (
          <TableRow 
            key={prediction.driver.driverId} 
            className="border-red-800/80 hover:bg-red-900/30 transition-colors"
          >
            <TableCell className="text-white font-bold">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-amber-600 text-white' : 
                'bg-gray-800 text-white'
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
              <TeamLogo teamName={prediction.constructor.name} />
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
                  className="w-20 h-2 bg-red-900"
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
          </TableRow>
        ))}
      </StandardTable>

      <ConstructorsPrediction />
    </div>
  );
};

export default ChampionshipPrediction;

// AVISO DE REFACTOR:
//
// O arquivo ChampionshipPrediction.tsx está muito grande (acima de 300 linhas).
// Recomendo que peça para refatorar em componentes menores prontamente!
