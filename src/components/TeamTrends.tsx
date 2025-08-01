import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wrench, TrendingUp } from "lucide-react";
import { useTeamRaceTrends } from "./hooks/useTeamRaceTrends";
import TeamLogo from "./TeamLogo";

const TeamTrends = () => {
  const { trends, isLoading, upgradeEvents } = useTeamRaceTrends();

  if (isLoading) {
    return (
      <div className="bg-white border border-red-800/30 rounded-lg p-6 mb-8 mt-16">
        <h3 className="text-lg text-gray-900">Carregando tendências dinâmicas...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-800/30 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8 mt-8 sm:mt-16">
      <h3 className="text-base sm:text-lg flex items-center text-gray-900 mb-3 sm:mb-4">
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
        <span className="text-sm sm:text-base">Tendências Dinâmicas das Equipes (Atualização Espanha & Últimas Corridas)</span>
      </h3>
      <div className="mb-4 sm:mb-8"></div> {/* Spacer para separar do bloco acima */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {trends.map(trend => (
          <Card className="bg-white border-red-800/30 shadow" key={trend.team}>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <TeamLogo teamName={trend.team} className="w-16 h-8 sm:w-24 sm:h-12" />
                {/* Upgrade */}
                {trend.upgradeImpact > 0 && <Wrench className="text-green-400 w-3 h-3 sm:w-4 sm:h-4 ml-1" />}
                {trend.upgradeImpact < 0 && <Wrench className="text-red-400 w-3 h-3 sm:w-4 sm:h-4 ml-1" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-800">
                <div className="mb-1">
                  <b>Pontos nas últimas 3 corridas:</b>{" "}
                  {trend.last3}
                  {trend.trendStatus === "up" && <ArrowUpRight className="w-3 h-3 inline text-green-400 ml-1" />}
                  {trend.trendStatus === "down" && <ArrowDownRight className="w-3 h-3 inline text-red-400 ml-1" />}
                  {trend.trendStatus === "stable" && <span className="ml-2 text-yellow-400">estável</span>}
                </div>
                <div className="mb-1">
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
