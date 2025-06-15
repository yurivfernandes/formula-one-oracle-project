
import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

interface Constructor {
  constructorId: string;
  name: string;
}

interface ConstructorPrediction {
  constructor: Constructor;
  currentPoints: number;
  predictedPoints: number;
  probability: number;
  trend: 'up' | 'down' | 'stable';
}

const fetchConstructorStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação de construtores');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
};

const calculateConstructorPrediction = (standings: any[]): ConstructorPrediction[] => {
  const currentRound = 10;
  const totalRounds = 24;
  const remainingRounds = totalRounds - currentRound;
  
  return standings.slice(0, 4).map((standing, index) => {
    const currentPoints = parseInt(standing.points);
    const teamName = standing.Constructor.name;
    
    let teamPerformanceMultiplier = 1.0;
    if (teamName === "McLaren") {
      teamPerformanceMultiplier = 1.15;
    } else if (teamName === "Red Bull") {
      teamPerformanceMultiplier = 0.92;
    } else if (teamName === "Ferrari") {
      teamPerformanceMultiplier = 1.05;
    } else if (teamName === "Mercedes") {
      teamPerformanceMultiplier = 0.95;
    }
    
    const currentPointsPerRace = currentRound > 0 ? currentPoints / currentRound : 0;
    const adjustedPointsPerRace = currentPointsPerRace * teamPerformanceMultiplier;
    const projectedRemainingPoints = adjustedPointsPerRace * remainingRounds;
    const predictedPoints = Math.round(currentPoints + projectedRemainingPoints);
    
    const leadingPoints = standings[0] ? parseInt(standings[0].points) : currentPoints;
    const pointsGap = leadingPoints - currentPoints;
    const maxPossibleGain = remainingRounds * 44; // 2 carros podem somar até 44 pontos por corrida
    
    let probability = 0;
    if (index === 0) {
      probability = Math.max(70, Math.min(95, 75 + (teamPerformanceMultiplier - 1) * 30));
    } else {
      const catchUpProbability = Math.max(0, (maxPossibleGain - pointsGap) / maxPossibleGain);
      const teamFactor = (teamPerformanceMultiplier - 0.8) * 50;
      probability = Math.min(40, (catchUpProbability * 100 * 0.6) + teamFactor);
    }
    
    return {
      constructor: standing.Constructor,
      currentPoints,
      predictedPoints,
      probability: Math.max(0, Math.round(probability)),
      trend: teamPerformanceMultiplier > 1.0 ? 'up' : teamPerformanceMultiplier < 1.0 ? 'down' : 'stable'
    };
  });
};

const ConstructorsPrediction = () => {
  const { data: constructorStandings, isLoading } = useQuery({
    queryKey: ['constructorStandings', 2025],
    queryFn: fetchConstructorStandings,
  });

  if (isLoading) {
    return (
      <StandardTable
        title="Predição Construtores 2025 - Top 4"
        subtitle="Análise das equipes favoritas ao título"
        headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
      >
        <TableRow>
          <TableCell colSpan={6}>
            <Skeleton className="h-48 w-full" />
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  const predictions = constructorStandings ? calculateConstructorPrediction(constructorStandings) : [];

  return (
    <StandardTable
      title="Predição Construtores 2025 - Top 4"
      subtitle="Análise das equipes favoritas ao título de construtores"
      headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
    >
      {predictions.map((prediction, index) => (
        <TableRow 
          key={prediction.constructor.constructorId} 
          className="border-red-800/50 hover:bg-red-900/20 transition-colors"
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
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default ConstructorsPrediction;
