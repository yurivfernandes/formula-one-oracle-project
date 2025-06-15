import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";
import ConstructorsPrediction from "./ConstructorsPrediction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TeamLogo from "./TeamLogo";

const ChampionshipPrediction = () => {
  const { drivers, constructors } = useChampionshipPrediction();

  return (
    <div className="space-y-8">
      {/* Primeira seção - Predição dos Pilotos */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trophy className="h-5 w-5" />
            Predição Final - Campeonato de Pilotos 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">Pos</TableHead>
                <TableHead>Piloto</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead className="text-right">Pontos Preditos</TableHead>
                <TableHead className="text-right">Probabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver, index) => (
                <TableRow key={driver.driver?.driverId || index} className={index < 3 ? "bg-yellow-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {driver.driver?.givenName} {driver.driver?.familyName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TeamLogo teamName={driver.constructor?.name} className="w-24 h-12" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{driver.predictedPoints}</TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">{driver.probability}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Terceira seção - Predição dos Construtores */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Users className="h-5 w-5" />
            Campeonato de Construtores 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ConstructorsPrediction />
        </CardContent>
      </Card>

      {/* Quarta seção - Análise de Tendências */}
      {/* Removendo a seção de tendências irreais */}
    </div>
  );
};

export default ChampionshipPrediction;
