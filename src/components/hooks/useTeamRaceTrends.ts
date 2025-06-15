
import { useQuery } from "@tanstack/react-query";

// Etapas chave (exemplos: Espanha, Silverstone, Bélgica)
const upgradeEvents = [
  { round: 6, name: "Espanha" },
  { round: 10, name: "Grã-Bretanha" },
  { round: 13, name: "Bélgica" },
];

export const useTeamRaceTrends = () => {
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

  // Ordenar corridas por round ascendente
  const sortedRaces = [...races].sort((a, b) => parseInt(a.round) - parseInt(b.round));

  // Extraímos todas as equipes que aparecem em qualquer corrida do ano
  const allTeams = new Set<string>();
  for (const race of sortedRaces) {
    for (const result of race.Results) {
      allTeams.add(result.Constructor.name);
    }
  }

  // Mapeia equipe -> array de { round, points }
  // Mesmo que a equipe não pontue na etapa, ela terá (round, 0) registrado
  const teamPointsByRace: Record<string, Array<{ round: number, points: number }>> = {};
  for (const team of allTeams) {
    teamPointsByRace[team] = [];
  }

  for (const race of sortedRaces) {
    const round = parseInt(race.round);
    // Inicializa pontuação zerada pra cada equipe
    const pointsByTeam: Record<string, number> = {};
    for (const team of allTeams) {
      pointsByTeam[team] = 0;
    }
    // Soma pontos dos pilotos para as respectivas equipes nesta corrida
    for (const result of race.Results) {
      const team = result.Constructor.name;
      const pts = Number(result.points) || 0;
      pointsByTeam[team] += pts;
    }
    // Grava no histórico de cada equipe
    Object.entries(pointsByTeam).forEach(([team, points]) => {
      teamPointsByRace[team].push({ round, points });
    });
  }

  // Agora calcula tendências com slices certeiros das últimas 3/6 etapas (3/6 rounds finais)
  const trends: {
    team: string;
    last3: number;
    last6: number;
    upgradeImpact: number;
    rounds: number[];
  }[] = [];

  for (const [team, history] of Object.entries(teamPointsByRace)) {
    // Ordena sempre pelas etapas mais recentes
    const ordered = [...history].sort((a, b) => b.round - a.round);
    const last3 = ordered.slice(0, 3).reduce((acc, curr) => acc + curr.points, 0);
    const last6 = ordered.slice(0, 6).reduce((acc, curr) => acc + curr.points, 0);

    trends.push({
      team,
      last3,
      last6,
      rounds: ordered.slice(0, 6).map(e => e.round),
      upgradeImpact: 0, // será calculado depois
    });
  }

  // Calcula impacto do upgrade: compara pontos 2 etapas antes e 2 depois do round do upgrade
  const keyEvent = upgradeEvents[0];
  for (const trend of trends) {
    // Busca sempre na ordem das corridas (round crescente)
    const history = [...(teamPointsByRace[trend.team])].sort((a, b) => a.round - b.round);
    let before = 0, after = 0;
    for (const r of history) {
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

