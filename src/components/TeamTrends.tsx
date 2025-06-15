
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wrench, TrendingUp } from "lucide-react";
import { useTeamRaceTrends } from "./hooks/useTeamRaceTrends";

const TeamTrends = () => {
  const { trends, isLoading, upgradeEvents } = useTeamRaceTrends();

  if (isLoading) {
    return (
      <div className="bg-white border border-red-800/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg text-gray-900">Carregando tendências dinâmicas...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-800/30 rounded-lg p-6 mb-8">
      <h3 className="text-lg flex items-center text-gray-900 mb-4">
        <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
        Tendências Dinâmicas das Equipes (Atualização Espanha & Últimas Corridas)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map(trend => (
          <Card className="bg-white border-red-800/30 shadow" key={trend.team}>
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <span>{trend.team}</span>
                {trend.upgradeImpact > 0 && <Wrench className="text-green-400 w-4 h-4" />}
                {trend.upgradeImpact < 0 && <Wrench className="text-red-400 w-4 h-4" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 text-xs text-gray-800">
                <div>
                  <b>Pontos nas últimas 3 corridas:</b>{" "}
                  {trend.last3}
                  {trend.last3 > 40 && <ArrowUpRight className="w-3 h-3 inline text-green-400 ml-1" />}
                  {trend.last3 < 20 && <ArrowDownRight className="w-3 h-3 inline text-red-400 ml-1" />}
                </div>
                <div>
                  <b>Pontos nas últimas 6 corridas:</b> {trend.last6}
                </div>
                <div>
                  <b>Impacto pós-{upgradeEvents[0].name}:</b>{" "}
                  {trend.upgradeImpact > 0
                    ? <span className="text-green-400">+{trend.upgradeImpact} pontos</span>
                    : trend.upgradeImpact < 0
                      ? <span className="text-red-400">{trend.upgradeImpact} pontos</span>
                      : <span className="text-yellow-400">estável</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamTrends;
