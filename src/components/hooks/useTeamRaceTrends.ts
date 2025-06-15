
import { useQuery } from "@tanstack/react-query";

// Etapas chave (exemplos: Espanha, Silverstone, Bélgica)
const upgradeEvents = [
  { round: 6, name: "Espanha" },
  { round: 10, name: "Grã-Bretanha" },
  { round: 13, name: "Bélgica" },
];

// Retorna tendências das últimas 3 e 6 etapas + evento de upgrade
export const useTeamRaceTrends = () => {
  // Busca resultados por corrida de 2025 (simulado/mocked para exemplo)
  const { data: races, isLoading } = useQuery({
    queryKey: ["races2025"],
    queryFn: async () => {
      const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/results.json?limit=300");
      const json = await res.json();
      return json.MRData.RaceTable.Races as any[] || [];
    },
  });

  if (isLoading || !races || races.length === 0)
    return { isLoading: true, trends: [] as any[] };

  // Mapeia: team -> [{ round, points }]
  const teamPointsByRace: Record<string, Array<{ round: number, points: number }>> = {};

  // Ordena as corridas por round ascendente
  const sortedRaces = [...races].sort((a, b) => parseInt(a.round) - parseInt(b.round));

  for (const race of sortedRaces) {
    const round = parseInt(race.round);

    // Soma pontos da equipe nesta corrida (agrupar por team)
    const pointsByTeam: Record<string, number> = {};
    for (const result of race.Results) {
      const team = result.Constructor.name;
      const pts = parseInt(result.points);
      pointsByTeam[team] = (pointsByTeam[team] || 0) + pts;
    }
    // Para cada equipe, adiciona o acumulado da corrida à estrutura
    Object.entries(pointsByTeam).forEach(([team, points]) => {
      if (!teamPointsByRace[team]) teamPointsByRace[team] = [];
      teamPointsByRace[team].push({ round, points });
    });
  }

  // Agora, para cada equipe, calcula last3, last6, e o impacto pós-upgrade
  const trends: {
    team: string;
    last3: number;
    last6: number;
    upgradeImpact: number;
    rounds: number[];
  }[] = [];

  for (const [team, pointsArr] of Object.entries(teamPointsByRace)) {
    // Ordena do round mais recente para o mais antigo
    const ordered = [...pointsArr].sort((a, b) => b.round - a.round);

    const last3 = ordered.slice(0, 3).reduce((acc, curr) => acc + curr.points, 0);
    const last6 = ordered.slice(0, 6).reduce((acc, curr) => acc + curr.points, 0);

    trends.push({
      team,
      last3,
      last6,
      rounds: ordered.slice(0, 6).map(e => e.round),
      upgradeImpact: 0, // calculado abaixo
    });
  }

  // Cálculo de impacto pós-upgrade: pontos das 2 corridas antes e depois do evento
  const keyEvent = upgradeEvents[0];
  for (const trend of trends) {
    // Busca na ordem crescente de round
    const pointsArr = [...(teamPointsByRace[trend.team])].sort((a, b) => a.round - b.round);
    // Encontra pontos nas 2 corridas antes e depois do upgrade
    let before = 0, after = 0;
    for (const r of pointsArr) {
      if (r.round === keyEvent.round - 1 || r.round === keyEvent.round - 2) before += r.points;
      if (r.round === keyEvent.round + 1 || r.round === keyEvent.round + 2) after += r.points;
    }
    trend.upgradeImpact = after - before;
  }

  return {
    isLoading: false,
    trends,
    upgradeEvents,
  };
};

