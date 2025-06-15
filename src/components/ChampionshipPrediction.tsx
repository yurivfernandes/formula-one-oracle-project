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
                      <TeamLogo teamName={driver.constructor?.name} className="w-6 h-6" />
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
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <TrendingUp className="h-5 w-5" />
            Análise de Tendências da Temporada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-700">Favoritos para Vitórias</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Max Verstappen</span>
                  <span className="text-red-600 font-semibold">12-14 vitórias</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Lando Norris</span>
                  <span className="text-red-600 font-semibold">4-6 vitórias</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Charles Leclerc</span>
                  <span className="text-red-600 font-semibold">3-5 vitórias</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-700">Batalhas a Observar</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="font-medium">Título de Pilotos</div>
                  <div className="text-sm text-gray-600">Verstappen vs Norris</div>
                </div>
                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <div className="font-medium">P3 no Campeonato</div>
                  <div className="text-sm text-gray-600">Leclerc vs Piastri vs Russell</div>
                </div>
                <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div className="font-medium">Construtores</div>
                  <div className="text-sm text-gray-600">Red Bull vs McLaren</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChampionshipPrediction;
