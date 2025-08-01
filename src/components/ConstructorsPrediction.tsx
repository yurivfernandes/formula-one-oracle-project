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

// Importar rounds de sprint de JSON reutilizável
import sprintRoundsJson from "../data/sprint-rounds-2025.json";
const SPRINT_ROUNDS_2025: number[] = sprintRoundsJson.map((item: { round: number }) => item.round);

const fetchConstructorStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação de construtores');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
};


const F1_SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

const calculateConstructorPrediction = (standings: any[], races: any[]): ConstructorPrediction[] => {
  if (!Array.isArray(standings) || standings.length === 0 || !races) {
    return [];
  }
  // Calcular rounds dinâmicos
  const totalRounds = races.length;
  const now = new Date();
  const nextRace = races.find((race: any) => {
    const raceDate = new Date(`${race.date}T12:00:00Z`);
    return raceDate >= now;
  });
  const currentRound = nextRace ? parseInt(nextRace.round) - 1 : totalRounds;
  const remainingRounds = totalRounds - currentRound;
  // Sprints restantes
  const remainingSprintRounds = SPRINT_ROUNDS_2025.filter(r => r > currentRound).length;
  const maxByTeam = totalRounds * (25 + 18) + remainingSprintRounds * (F1_SPRINT_POINTS[0] + F1_SPRINT_POINTS[1]);

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
    // Projeção de pontos de sprint restantes para construtores (máximo possível, ponderado)
    // Considerando 2 pilotos por equipe, mas ponderando por performance
    const sprintPointsProjection = remainingSprintRounds * ((F1_SPRINT_POINTS[0] + F1_SPRINT_POINTS[1]) * 0.5 + predictedPerRace * 0.2);
    let predictedPoints = Math.round(currentPoints + projectedRemainingPoints + sprintPointsProjection);
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

  // Buscar corridas para cálculo dinâmico
  const { data: races, isLoading: isLoadingRaces } = useQuery({
    queryKey: ['races', 2025],
    queryFn: async () => {
      const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
      if (!response.ok) throw new Error('Erro ao buscar corridas');
      const data = await response.json();
      return data.MRData.RaceTable.Races;
    },
  });

  const { trends, isLoading: isTrendsLoading } = useTeamRaceTrends();

  if (isLoading || isLoadingRaces) {
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

  const predictions = constructorStandings && races ? calculateConstructorPrediction(constructorStandings, races).slice(0, 4) : [];

  return (
    <div className="overflow-x-auto">
      <StandardTable
        title="Predição Construtores 2025 - Top 4"
        subtitle="Análise das equipes favoritas ao título de construtores"
        headers={["Pos", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-white border border-red-800 w-full"
      >
        {predictions.map((prediction, index) => (
          <TableRow
            key={prediction.constructor.constructorId}
            className="border-red-800/80 hover:bg-red-900/10 transition-colors"
          >
            <TableCell className="w-10 sm:w-12">
              <span
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
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
            <TableCell className="min-w-[80px] sm:min-w-[120px]">
              <TeamLogo teamName={prediction.constructor.name} className="w-8 h-5 sm:w-12 sm:h-8" />
            </TableCell>
            <TableCell className="text-center font-bold text-sm sm:text-lg text-gray-900 min-w-[60px]">
              {prediction.currentPoints}
            </TableCell>
            <TableCell className="text-center min-w-[70px]">
              <span className="text-red-500 font-bold text-sm sm:text-lg">
                {prediction.predictedPoints}
              </span>
            </TableCell>
            <TableCell className="text-center min-w-[80px] sm:min-w-[100px]">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <span className="font-medium text-gray-900 text-xs sm:text-base">
                  {prediction.probability}%
                </span>
                <Progress value={prediction.probability} className="w-12 sm:w-20 h-1 sm:h-2 bg-red-900" />
              </div>
            </TableCell>
            <TableCell className="text-center min-w-[50px]">
              <div className="flex items-center justify-center">
                {prediction.trend === "up" && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />}
                {prediction.trend === "down" && <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
                {prediction.trend === "stable" && <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </StandardTable>
    </div>
  );
};

export default ConstructorsPrediction;
