
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

  // Descobrir todos os rounds presentes no campeonato
  const allRounds: number[] = sortedRaces.map(r => parseInt(r.round));

  // Extraí todas as equipes que aparecem em qualquer corrida do ano
  const allTeams = new Set<string>();
  for (const race of sortedRaces) {
    for (const result of race.Results) {
      allTeams.add(result.Constructor.name);
    }
  }

  // Para cada equipe, construir um array de { round, points } para TODOS os rounds (mesmo com zero)
  const teamPointsByRace: Record<string, Array<{ round: number; points: number }>> = {};
  for (const team of allTeams) {
    // Inicializa a lista completa, preenchida com zeros
    teamPointsByRace[team] = allRounds.map(round => ({ round, points: 0 }));
  }

  for (const race of sortedRaces) {
    const round = parseInt(race.round);
    // Para cada resultado, somar pontos da equipe naquele round
    const pointsByTeam: Record<string, number> = {};
    for (const result of race.Results) {
      const team = result.Constructor.name;
      const pts = Number(result.points) || 0;
      pointsByTeam[team] = (pointsByTeam[team] || 0) + pts;
    }
    // Atualiza os pontos nesse round para cada equipe que pontuou
    for (const [team, pts] of Object.entries(pointsByTeam)) {
      const histArr = teamPointsByRace[team];
      if (histArr) {
        // Encontra a entrada correspondente ao round e ajusta pontos
        const entry = histArr.find(e => e.round === round);
        if (entry) entry.points = pts;
      }
    }
    // Equipes que não pontuaram já tem "0" registrado no array inicializado
  }

  // Quais são os N últimos rounds realizados?
  const last3Rounds = allRounds.slice(-3);
  const last6Rounds = allRounds.slice(-6);

  // Agora calcula tendências reais das últimas 3/6 etapas
  const trends: {
    team: string;
    last3: number;
    last6: number;
    upgradeImpact: number;
    rounds: number[];
  }[] = [];

  for (const [team, history] of Object.entries(teamPointsByRace)) {
    // Ordena pelo round crescente
    const ordered = [...history].sort((a, b) => a.round - b.round);

    const last3 = ordered.filter(e => last3Rounds.includes(e.round)).reduce((acc, cur) => acc + cur.points, 0);
    const last6 = ordered.filter(e => last6Rounds.includes(e.round)).reduce((acc, cur) => acc + cur.points, 0);

    trends.push({
      team,
      last3,
      last6,
      rounds: last6Rounds,
      upgradeImpact: 0, // será calculado depois
    });
  }

  // Calcula impacto do upgrade: compara pontos 2 etapas antes e 2 depois do round do upgrade
  const keyEvent = upgradeEvents[0];
  for (const trend of trends) {
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
