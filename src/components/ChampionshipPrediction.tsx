import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import PredictionExplanation from "./PredictionExplanation";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";
import ConstructorsPrediction from "./ConstructorsPrediction";
import TeamTrends from "./TeamTrends";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";

// Para tradução de nacionalidades e bandeiras
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

const ChampionshipPrediction = () => {
  const { isLoading, drivers } = useChampionshipPrediction();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PredictionExplanation />
        <StandardTable
          title="Predição Pilotos 2025 - Top 6"
          subtitle="Analisando dados históricos..."
          headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
          className="bg-white border border-red-800"
        >
          <TableRow>
            <TableCell colSpan={7}>
              <Skeleton className="h-96 w-full bg-white" />
            </TableCell>
          </TableRow>
        </StandardTable>
        <ConstructorsPrediction />
      </div>
    );
  }

  const predictions = drivers.slice(0, 6);

  return (
    <div className="space-y-8">
      <PredictionExplanation />
      <StandardTable
        title="Predição Pilotos 2025 - Top 6"
        subtitle="Análise dos pilotos favoritos ao título mundial"
        headers={["Pos", "Piloto", "Equipe", "Pts Atuais", "Pts Preditos", "Probabilidade", "Tendência"]}
        className="bg-white border border-red-800"
      >
        {predictions.map((prediction, index) => (
          <TableRow 
            key={prediction.driver.driverId} 
            className="border-red-800/80 hover:bg-red-900/10 transition-colors"
          >
            <TableCell>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-amber-600 text-white' : 
                'bg-gray-200 text-gray-900'
              }`}>
                {index + 1}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getNationalityFlag(prediction.driver.nationality)}</span>
                <span className="font-semibold text-gray-900">{`${prediction.driver.givenName} ${prediction.driver.familyName}`}</span>
              </div>
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
                <span className="font-medium text-gray-900">{prediction.probability}%</span>
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
      <TeamTrends />
      <ConstructorsPrediction />
    </div>
  );
};

export default ChampionshipPrediction;
