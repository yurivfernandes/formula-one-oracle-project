
import { Trophy, Users, TrendingUp } from "lucide-react";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";
import ConstructorsPrediction from "./ConstructorsPrediction";
import { TableCell, TableRow } from "@/components/ui/table";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

const ChampionshipPrediction = () => {
  const { drivers, constructors } = useChampionshipPrediction();

  // Mostrar apenas os top 8 pilotos
  const top8Drivers = drivers.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Primeira seção - Predição dos Pilotos */}
      <StandardTable
        title="Predição Final - Campeonato de Pilotos 2025 (Top 8)"
        subtitle="Análise dos pilotos favoritos ao título baseada em dados históricos"
        headers={["Pos", "Piloto", "Equipe", "Pontos Preditos", "Probabilidade"]}
        className="bg-white border border-red-200"
      >
        {top8Drivers.map((driver, index) => (
          <TableRow 
            key={driver.driver?.driverId || index} 
            className={`border-red-800/30 hover:bg-red-900/5 transition-colors ${
              index === 0 ? "bg-yellow-50" :
              index === 1 ? "bg-gray-50" :
              index === 2 ? "bg-orange-50" :
              ""
            }`}
          >
            <TableCell className="w-10 sm:w-12">
              <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                index === 0 ? "bg-yellow-500 text-black" :
                index === 1 ? "bg-gray-400 text-black" :
                index === 2 ? "bg-amber-700 text-white" :
                "bg-gray-200 text-gray-900"
              }`}>
                {index + 1}
              </span>
            </TableCell>
            <TableCell className="font-semibold min-w-[120px] sm:min-w-[180px]">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-xs sm:text-base">{driver.driver?.givenName}</span>
                <span className="text-xs sm:text-base sm:ml-1">{driver.driver?.familyName}</span>
              </div>
            </TableCell>
            <TableCell className="min-w-[80px] sm:min-w-[120px]">
              <TeamLogo teamName={driver.constructor?.name} className="w-8 h-5 sm:w-12 sm:h-8" />
            </TableCell>
            <TableCell className="text-center font-bold text-sm sm:text-lg text-red-600 min-w-[80px]">
              {driver.predictedPoints}
            </TableCell>
            <TableCell className="text-center min-w-[90px]">
              <span className={`font-bold text-xs sm:text-base ${
                driver.probability >= 70 ? "text-green-600" :
                driver.probability >= 40 ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {driver.probability}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </StandardTable>

      {/* ...apenas pilotos, construtores agora é uma aba separada... */}
    </div>
  );
};

export default ChampionshipPrediction;
