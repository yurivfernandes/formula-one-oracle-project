import { useQuery } from "@tanstack/react-query";

// Etapas chave (exemplos: Espanha, Silverstone, Bélgica)
const upgradeEvents = [
  { round: 6, name: "Espanha" },
  { round: 10, name: "Grã-Bretanha" },
  { round: 13, name: "Bélgica" },
];

// Função utilitária para normalizar nomes de equipes
function normalizeTeamName(name: string) {
  return name.trim().toLowerCase();
}

// Função utilitária para buscar todas as páginas de resultados da API
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

    // Descobrir se já pegou tudo
    if (!total) {
      total = parseInt(json?.MRData?.total ?? "0");
    }
    offset += limit;
    // Termina se pegou todos resultados
    if (offset >= total) break;
    page++;
    if (page > 30) break; // Seguranca anti-loop infinito
  }

  return allRaces;
}

export const useTeamRaceTrends = () => {
  const { data: races, isLoading } = useQuery({
    queryKey: ["races2025", "allPages"],
    queryFn: fetchAllRaces2025,
  });

  if (isLoading || !races || races.length === 0)
    return { isLoading: true, trends: [] as any[] };

  // Ordenar corridas por round ascendente
  const sortedRaces = [...races].sort((a, b) => parseInt(a.round) - parseInt(b.round));
  const allRounds: number[] = sortedRaces.map(r => parseInt(r.round));

  // Construir um Map de nome-normalizado->nomeOriginal para mapeamento seguro nas trends
  const teamNameMap = new Map<string, string>();
  for (const race of sortedRaces) {
    for (const result of race.Results) {
      const canonical = normalizeTeamName(result.Constructor.name);
      if (!teamNameMap.has(canonical)) teamNameMap.set(canonical, result.Constructor.name);
    }
  }

  // Para cada round, calcular pontos por equipe (nome-normalizado)
  const teamPointsByRound: Record<string, { [round: number]: number }> = {};
  for (const race of sortedRaces) {
    const round = parseInt(race.round);
    // Contabilizar pontos de cada piloto para cada equipe por corrida
    for (const result of race.Results) {
      const teamNorm = normalizeTeamName(result.Constructor.name);
      const pts = Number(result.points) || 0;
      if (!teamPointsByRound[teamNorm]) teamPointsByRound[teamNorm] = {};
      teamPointsByRound[teamNorm][round] = (teamPointsByRound[teamNorm][round] || 0) + pts;
    }
  }

  // Construir matriz por equipe, preenchendo com 0 onde não pontuaram
  const teams = Array.from(teamNameMap.keys());
  const teamPointsHistory: Record<string, Array<{ round: number; points: number }>> = {};
  teams.forEach(teamNorm => {
    teamPointsHistory[teamNorm] = races.map(race => {
      const round = parseInt(race.round);
      // Soma todos os pilotos do time naquela corrida
      let pts = 0;
      for (const result of race.Results) {
        if (normalizeTeamName(result.Constructor.name) === teamNorm) {
          pts += Number(result.points) || 0;
        }
      }
      return { round, points: pts };
    });
  });

  // Rounds para análise de tendência (últimos 3 e 6 rounds)
  const allRounds: number[] = races.map(r => parseInt(r.round));
  const last3Rounds = allRounds.slice(-3);
  const last6Rounds = allRounds.slice(-6);

  // Construir as tendências para todas as equipes (apenas times que participaram de 2025)
  const trends: {
    team: string;
    last3: number;
    last6: number;
    trendStatus: "up" | "down" | "stable";
    upgradeImpact: number;
    rounds: number[];
  }[] = [];

  for (const teamNorm of teams) {
    const history = teamPointsHistory[teamNorm];

    let last3 = 0, last6 = 0;
    if (history.length > 0) {
      last3 = history.filter(e => last3Rounds.includes(e.round)).reduce((acc, cur) => acc + cur.points, 0);
      last6 = history.filter(e => last6Rounds.includes(e.round)).reduce((acc, cur) => acc + cur.points, 0);
    }

    // Nova lógica para tendência
    let trendStatus: "up" | "down" | "stable" = "stable";
    if (last3 > (last6 / 2)) {
      trendStatus = "up";
    } else if (last3 < (last6 / 2)) {
      trendStatus = "down";
    } // se for igual, permanece "stable"

    trends.push({
      team: teamNameMap.get(teamNorm) || teamNorm,
      last3,
      last6,
      trendStatus,
      rounds: last6Rounds,
      upgradeImpact: 0, // será calculado depois
    });
  }

  // Calcula impacto do upgrade: compara pontos 2 etapas antes e 2 depois do round do upgrade
  const keyEvent = upgradeEvents[0];
  for (const trend of trends) {
    // Usar nome normalizado para buscar em teamPointsHistory
    const teamNorm = normalizeTeamName(trend.team);
    const history = teamPointsHistory[teamNorm];
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
