
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

  if (isLoading || !races || races.length === 0) return { isLoading: true, trends: [] as any[] };

  // Refatorado: calcular pontos nas últimas 3 e 6 corridas corretamente
  // Cria mapa equipe -> [corridas, pontosPorCorrida]
  const teamRacePoints: Record<string, number[]> = {};

  for (const race of races) {
    const round = parseInt(race.round);
    // Agrupa e ordena para garantir corretamente o slicing no fim
    for (const result of race.Results) {
      const team = result.Constructor.name;
      const pts = parseInt(result.points);
      if (!teamRacePoints[team]) teamRacePoints[team] = [];
      teamRacePoints[team].push(pts);
    }
  }

  // Assegura que array de pontos de cada equipe seja do tamanho correto (ordenado do mais antigo ao mais novo)
  Object.values(teamRacePoints).forEach(arr => arr.reverse());

  // Agora calcula as tendências considerando só pontos de provas recentes
  const trends: {
    team: string;
    last3: number;
    last6: number;
    upgradeImpact: number;
    rounds: number[];
  }[] = [];

  for (const [team, pointsArr] of Object.entries(teamRacePoints)) {
    const last3 = pointsArr.slice(0, 3).reduce((a, b) => a + b, 0);
    const last6 = pointsArr.slice(0, 6).reduce((a, b) => a + b, 0);
    trends.push({
      team,
      last3,
      last6,
      rounds: [],
      upgradeImpact: 0, // calculado abaixo
    });
  }

  // Cálculo de impacto pós-upgrade: pontos das 2 corridas antes e depois do evento
  const keyEvent = upgradeEvents[0];
  for (const trend of trends) {
    // Descobrir quais rounds essa equipe fez pontos
    const teamResults = races
      .map(race => {
        const result = race.Results.find((res: any) => res.Constructor.name === trend.team);
        return {
          round: parseInt(race.round),
          points: result ? parseInt(result.points) : 0,
        };
      })
      .sort((a, b) => a.round - b.round);

    // pega pontos nas 2 corridas antes e depois do upgrade
    let before = 0;
    let after = 0;
    for (const res of teamResults) {
      if (res.round === keyEvent.round - 1 || res.round === keyEvent.round - 2) before += res.points;
      if (res.round === keyEvent.round + 1 || res.round === keyEvent.round + 2) after += res.points;
    }
    trend.upgradeImpact = after - before;
  }

  return {
    isLoading: false,
    trends,
    upgradeEvents,
  };
};
