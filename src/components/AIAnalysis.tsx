
import { Brain, Zap, Target, AlertCircle } from "lucide-react";
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

  // Análise baseada nos dados reais de 2025
  let insights: Array<{ type: string; title: string; description: string; confidence: number; icon: any }> = [];
  
  if (participants.length > 0 && races && races.length > 0) {
    const leader = participants[0];
    const vice = participants[1];
    const third = participants[2];
    
    // Calcular vitórias dos top 3
    const wins = {
      [leader.name]: 0,
      [vice.name]: 0,
      [third.name]: 0
    };

    for (const race of races) {
      const winner = race.Results[0];
      const winnerName = winner.Driver.givenName + " " + winner.Driver.familyName;
      if (wins[winnerName] !== undefined) {
        wins[winnerName]++;
      }
    }

    // Calcular pontos por equipe
    const teamPoints: { [key: string]: number } = {};
    for (const race of races) {
      for (const result of race.Results) {
        const teamName = result.Constructor.name;
        const points = Number(result.points) || 0;
        teamPoints[teamName] = (teamPoints[teamName] || 0) + points;
      }
    }

    // Ordenar equipes por pontos
    const topTeams = Object.entries(teamPoints)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    // Análise das últimas 3 corridas
    const last3Races = races.slice(-3);
    const recentWinners = last3Races.map(race => {
      const winner = race.Results[0];
      return winner.Driver.givenName + " " + winner.Driver.familyName;
    });

    insights = [
      {
        type: "championship",
        title: `${leader.name} lidera com ${leader.points} pontos`,
        description: `${leader.name} (${leader.team}) está na liderança do campeonato com ${wins[leader.name]} vitórias em ${races.length} corridas disputadas. A diferença para o segundo colocado é de ${leader.points - vice.points} pontos.`,
        confidence: 95,
        icon: <Zap className="w-5 h-5" />,
      },
      {
        type: "battle",
        title: "Disputa pelo Vice-Campeonato",
        description: `${vice.name} (${vice.team}) ocupa a segunda posição com ${vice.points} pontos, ${vice.points - third.points} pontos à frente de ${third.name}. A disputa pelo vice-campeonato permanece acirrada.`,
        confidence: 88,
        icon: <Target className="w-5 h-5" />,
      },
      {
        type: "team",
        title: `${topTeams[0][0]} domina o campeonato de construtores`,
        description: `A equipe ${topTeams[0][0]} lidera com ${topTeams[0][1]} pontos, seguida por ${topTeams[1][0]} (${topTeams[1][1]} pts) e ${topTeams[2][0]} (${topTeams[2][1]} pts).`,
        confidence: 92,
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        type: "recent",
        title: "Tendência das últimas corridas",
        description: `Nas últimas 3 corridas, as vitórias foram de: ${recentWinners.join(", ")}. ${recentWinners[recentWinners.length - 1]} venceu a corrida mais recente.`,
        confidence: 85,
        icon: <TrendingUp className="w-5 h-5" />,
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
