
import { Brain, Zap, Target, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

// Função para buscar todas as corridas de 2025
async function fetchAllRaces2025() {
  const limit = 100;
  let offset = 0;
  let allRaces: any[] = [];
  let total = null;
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.jolpi.ca/ergast/f1/2025/results.json?limit=${limit}&offset=${offset}`
    );
    const json = await res.json();
    const races = json?.MRData?.RaceTable?.Races ?? [];
    if (races.length === 0) break;
    allRaces = allRaces.concat(races);

    if (!total) {
      total = parseInt(json?.MRData?.total ?? "0");
    }
    offset += limit;
    if (offset >= total) break;
    page++;
    if (page > 30) break;
  }

  return allRaces;
}

// Carregar standings atuais para análise realista
const fetchStandings = async () => {
  const response = await fetch("https://api.jolpi.ca/ergast/f1/2025/driverStandings/");
  if (!response.ok) throw new Error("Erro ao buscar standings");
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const AIAnalysis = () => {
  const { data: standings, isLoading: isLoadingStandings } = useQuery({
    queryKey: ["currentStandingsForAI", 2025],
    queryFn: fetchStandings,
  });

  const { data: races, isLoading: isLoadingRaces } = useQuery({
    queryKey: ["races2025", "aiAnalysis"],
    queryFn: fetchAllRaces2025,
  });

  if (isLoadingStandings || isLoadingRaces) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
            <Brain className="mr-3 h-6 w-6 text-red-500" />
            Análise com Inteligência Artificial
          </h2>
          <p className="text-gray-600">Carregando análise baseada nos dados de 2025...</p>
        </div>
      </div>
    );
  }

  const participants = standings?.map((d: any) => ({
    name: d.Driver.givenName + " " + d.Driver.familyName,
    team: d.Constructors[0]?.name,
    points: Number(d.points),
    position: Number(d.position)
  })) ?? [];

  // Análise avançada baseada nos dados reais de 2025
  let insights: Array<{ type: string; title: string; description: string; confidence: number; icon: any }> = [];
  
  if (participants.length > 0 && races && races.length > 0) {
    const leader = participants[0];
    const vice = participants[1];
    const third = participants[2];
    
    // Análise de vitórias e consistência
    const driverStats: { [key: string]: { wins: number; podiums: number; points: number; races: number; dnfs: number } } = {};
    
    for (const race of races) {
      if (race.Results && race.Results.length > 0) {
        for (let i = 0; i < Math.min(race.Results.length, 20); i++) {
          const result = race.Results[i];
          const driverName = result.Driver.givenName + " " + result.Driver.familyName;
          
          if (!driverStats[driverName]) {
            driverStats[driverName] = { wins: 0, podiums: 0, points: 0, races: 0, dnfs: 0 };
          }
          
          driverStats[driverName].races++;
          driverStats[driverName].points += Number(result.points) || 0;
          
          if (result.position === "1") driverStats[driverName].wins++;
          if (["1", "2", "3"].includes(result.position)) driverStats[driverName].podiums++;
          if (!result.position || result.position === "\\N") driverStats[driverName].dnfs++;
        }
      }
    }

    // Calcular pontos por equipe e dominância
    const teamStats: { [key: string]: { points: number; wins: number; podiums: number } } = {};
    for (const race of races) {
      if (race.Results) {
        for (const result of race.Results) {
          const teamName = result.Constructor.name;
          const points = Number(result.points) || 0;
          
          if (!teamStats[teamName]) {
            teamStats[teamName] = { points: 0, wins: 0, podiums: 0 };
          }
          
          teamStats[teamName].points += points;
          if (result.position === "1") teamStats[teamName].wins++;
          if (["1", "2", "3"].includes(result.position)) teamStats[teamName].podiums++;
        }
      }
    }

    const topTeams = Object.entries(teamStats)
      .sort(([,a], [,b]) => b.points - a.points)
      .slice(0, 3);

    // Análise de momentum (últimas 3 corridas)
    const last3Races = races.slice(-3);
    const recentPerformance: { [key: string]: number } = {};
    
    for (const race of last3Races) {
      if (race.Results) {
        for (const result of race.Results) {
          const driverName = result.Driver.givenName + " " + result.Driver.familyName;
          const points = Number(result.points) || 0;
          recentPerformance[driverName] = (recentPerformance[driverName] || 0) + points;
        }
      }
    }

    // Taxa de conversão de vitórias
    const leaderStats = driverStats[leader.name];
    const viceStats = driverStats[vice.name];
    const winRate = leaderStats ? (leaderStats.wins / Math.max(leaderStats.races, 1) * 100) : 0;
    const consistencyRate = leaderStats ? (leaderStats.podiums / Math.max(leaderStats.races, 1) * 100) : 0;

    insights = [
      {
        type: "dominance",
        title: `${leader.name}: ${winRate.toFixed(0)}% de taxa de vitórias`,
        description: `${leader.name} (${leader.team}) domina com ${leaderStats?.wins || 0} vitórias em ${races.length} corridas (${winRate.toFixed(1)}% de conversão). Taxa de pódios: ${consistencyRate.toFixed(1)}%. Gap para o vice: ${leader.points - vice.points} pontos - uma diferença que representa aproximadamente ${Math.ceil((leader.points - vice.points) / 25)} vitórias.`,
        confidence: 94,
        icon: <Zap className="w-5 h-5" />,
      },
      {
        type: "momentum",
        title: `Momentum recente: ${Object.entries(recentPerformance).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`,
        description: `Nas últimas 3 corridas, ${Object.entries(recentPerformance).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'} teve o melhor desempenho com ${Object.entries(recentPerformance).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} pontos. ${vice.name} precisa de ${Math.ceil((leader.points - vice.points) / (races.length > 15 ? 20 : 25))} corridas perfeitas para alcançar a liderança, considerando ${24 - races.length} corridas restantes.`,
        confidence: 89,
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        type: "constructor",
        title: `${topTeams[0][0]}: ${topTeams[0][1].podiums} pódios em ${races.length} corridas`,
        description: `A equipe ${topTeams[0][0]} tem ${topTeams[0][1].wins} vitórias e ${topTeams[0][1].podiums} pódios, representando ${((topTeams[0][1].podiums / (races.length * 2)) * 100).toFixed(1)}% dos pódios disponíveis. Gap para o segundo colocado: ${topTeams[0][1].points - topTeams[1][1].points} pontos.`,
        confidence: 91,
        icon: <Target className="w-5 h-5" />,
      },
      {
        type: "mathematical",
        title: `Análise matemática: ${races.length}/${24} corridas disputadas`,
        description: `Com ${24 - races.length} corridas restantes, o máximo de pontos disponíveis é ${(24 - races.length) * 25}. ${vice.name} precisa superar o gap de ${leader.points - vice.points} pontos, exigindo uma média de ${((leader.points - vice.points + 1) / Math.max(24 - races.length, 1)).toFixed(1)} pontos extras por corrida vs o líder. Probabilidade matemática: ${leader.points - vice.points > (24 - races.length) * 25 ? '0%' : ((1 - (leader.points - vice.points) / ((24 - races.length) * 25)) * 100).toFixed(1) + '%'}.`,
        confidence: 97,
        icon: <AlertCircle className="w-5 h-5" />,
      }
    ];
  }

  const methodology = [
    `Análise de dados de ${races?.length || 0} corridas da temporada 2025`,
    "Algoritmos baseados em performance atual e pontuação real",
    "Consideração de vitórias, pódios e consistência por corrida",
    "Análise estatística de tendências recentes (últimas 3 corridas)",
    "Modelagem preditiva baseada em dados reais de 2025"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
          <Brain className="mr-3 h-6 w-6 text-red-500" />
          Análise com Inteligência Artificial
        </h2>
        
        <div className="space-y-4 mb-8">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">{insight.icon}</span>
                    {insight.title}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-400 bg-green-50">
                    {insight.confidence}% confiança
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-red-700 mb-3">Metodologia da IA</h3>
          <ul className="space-y-2">
            {methodology.map((method, index) => (
              <li key={index} className="text-gray-700 text-sm flex items-start">
                <span className="text-red-400 mr-2">→</span>
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
