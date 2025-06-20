import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";
import { useTeamRaceTrends } from "./hooks/useTeamRaceTrends";
import TeamTrends from "./TeamTrends";

// DEFININDO O TIPO PARA EVITAR ERRO!
interface ConstructorPrediction {
  constructor: any;
  currentPoints: number;
  predictedPoints: number;
  probability: number;
  trend: "up" | "down" | "stable";
}

const fetchConstructorStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação de construtores');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
};

const calculateConstructorPrediction = (standings: any[]): ConstructorPrediction[] => {
  if (!Array.isArray(standings) || standings.length === 0) {
    return [];
  }
  const currentRound = 10;
  const totalRounds = 24;
  const remainingRounds = totalRounds - currentRound;
  const maxByTeam = totalRounds * (25 + 18);

  return standings.map((standing, index): ConstructorPrediction => {
    const currentPoints = parseInt(standing.points);
    const teamName = standing.Constructor.name;

    let teamPerformanceMultiplier = 1.0;
    if (teamName === "McLaren") {
      teamPerformanceMultiplier = 1.10;
    } else if (teamName === "Red Bull") {
      teamPerformanceMultiplier = 0.95;
    } else if (teamName === "Ferrari") {
      teamPerformanceMultiplier = 1.05;
    } else if (teamName === "Mercedes") {
      teamPerformanceMultiplier = 0.97;
    }
    const currentPointsPerRace = currentRound > 0 ? currentPoints / currentRound : 0;
    let predictedPerRace = Math.min(currentPointsPerRace * teamPerformanceMultiplier, 37);
    const projectedRemainingPoints = predictedPerRace * remainingRounds;
    let predictedPoints = Math.round(currentPoints + projectedRemainingPoints);
    predictedPoints = Math.min(predictedPoints, maxByTeam, 650);

    const leadingPoints = standings[0] ? parseInt(standings[0].points) : currentPoints;
    const pointsGap = leadingPoints - currentPoints;
    const maxPossibleGain = remainingRounds * 43;

    let probability = 0;
    if (index === 0) {
      probability = Math.max(70, Math.min(95, 75 + (teamPerformanceMultiplier - 1) * 30));
    } else {
      const catchUpProbability = Math.max(0, (maxPossibleGain - pointsGap) / maxPossibleGain);
      const teamFactor = (teamPerformanceMultiplier - 0.9) * 40;
      probability = Math.min(40, (catchUpProbability * 100 * 0.55) + teamFactor);
    }

    // Corrigindo para tipo literal:
    let trend: "up" | "down" | "stable" = "stable";
    if (teamPerformanceMultiplier > 1.05) trend = "up";
    else if (teamPerformanceMultiplier < 0.96) trend = "down";

    return {
      constructor: standing.Constructor,
      currentPoints,
      predictedPoints,
      probability: Math.max(0, Math.round(probability)),
      trend
    };
  });
};

const ConstructorsPrediction = () => {
  const { data: constructorStandings, isLoading, error } = useQuery({
    queryKey: ['constructorStandings', 2025],
    queryFn: fetchConstructorStandings,
  });

  const { trends, isLoading: isTrendsLoading } = useTeamRaceTrends();

  if (isLoading) {
    return (
      <StandardTable
        title="Predição Construtores 2025 - Top 4"
        subtitle="Análise das equipes favoritas ao título"
        headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-white border border-red-800"
      >
        <TableRow>
          <TableCell colSpan={6}>
            <div className="bg-white">
              <Skeleton className="h-48 w-full bg-white" />
            </div>
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  if (error) {
    return (
      <StandardTable
        title="Predição Construtores 2025 - Top 4"
        subtitle="Erro ao carregar dados"
        headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-white border border-red-800"
      >
        <TableRow>
          <TableCell colSpan={6} className="text-center text-red-400">
            Erro ao carregar predição dos construtores
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  const predictions = constructorStandings ? calculateConstructorPrediction(constructorStandings).slice(0, 4) : [];

  return (
    <div>
      <StandardTable
        title="Predição Construtores 2025 - Top 4"
        subtitle="Análise das equipes favoritas ao título de construtores"
        headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-white border border-red-800"
      >
        {predictions.map((prediction, index) => (
          <TableRow
            key={prediction.constructor.constructorId}
            className="border-red-800/80 hover:bg-red-900/10 transition-colors"
          >
            <TableCell>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-500 text-black"
                    : index === 1
                    ? "bg-gray-400 text-black"
                    : index === 2
                    ? "bg-amber-700 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {index + 1}
              </span>
            </TableCell>
            <TableCell>
              <TeamLogo teamName={prediction.constructor.name} />
            </TableCell>
            <TableCell className="text-center font-bold text-lg text-gray-900">
              {prediction.currentPoints}
            </TableCell>
            <TableCell className="text-center">
              <span className="text-red-500 font-bold text-lg">
                {prediction.predictedPoints}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <span className="font-medium text-gray-900">
                  {prediction.probability}%
                </span>
                <Progress value={prediction.probability} className="w-20 h-2 bg-red-900" />
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                {prediction.trend === "up" && <TrendingUp className="w-5 h-5 text-green-400" />}
                {prediction.trend === "down" && <TrendingDown className="w-5 h-5 text-red-400" />}
                {prediction.trend === "stable" && <Minus className="w-5 h-5 text-yellow-400" />}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </StandardTable>
      <TeamTrends />
    </div>
  );
};

export default ConstructorsPrediction;
