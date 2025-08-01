
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";
import ConstructorsPrediction from "./ConstructorsPrediction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TeamLogo from "./TeamLogo";

const ChampionshipPrediction = () => {
  const { drivers, constructors } = useChampionshipPrediction();

  // Mostrar apenas os top 8 pilotos
  const top8Drivers = drivers.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Primeira seção - Predição dos Pilotos */}
      <Card className="border-red-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className="flex items-center gap-2 text-red-700 text-2xl">
            <Trophy className="h-6 w-6" />
            Predição Final - Campeonato de Pilotos 2025 (Top 8)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableHead className="w-16 font-bold">Pos</TableHead>
                <TableHead className="font-bold">Piloto</TableHead>
                <TableHead className="font-bold">Equipe</TableHead>
                <TableHead className="text-right font-bold">Pontos Preditos</TableHead>
                <TableHead className="text-right font-bold">Probabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top8Drivers.map((driver, index) => (
                <TableRow 
                  key={driver.driver?.driverId || index} 
                  className={`hover:bg-gray-50 transition-colors ${
                    index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" :
                    index === 1 ? "bg-gradient-to-r from-gray-50 to-gray-100" :
                    index === 2 ? "bg-gradient-to-r from-orange-50 to-orange-100" :
                    ""
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                      index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-600" :
                      index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                      "bg-gradient-to-br from-red-500 to-red-700"
                    }`}>
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-lg">
                    {driver.driver?.givenName} {driver.driver?.familyName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TeamLogo teamName={driver.constructor?.name} className="w-28 h-14" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">{driver.predictedPoints}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold text-lg ${
                      driver.probability >= 70 ? "text-green-600" :
                      driver.probability >= 40 ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {driver.probability}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

  {/* ...apenas pilotos, construtores agora é uma aba separada... */}
    </div>
  );
};

export default ChampionshipPrediction;
