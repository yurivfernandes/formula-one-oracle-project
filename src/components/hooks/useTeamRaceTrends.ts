
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
      // Pequeno ajuste para garantir compatibilidade
      return json.MRData.RaceTable.Races as any[] || [];
    },
  });

  if (isLoading || !races || races.length === 0) return { isLoading: true, trends: [] as any[] };

  // Organiza pontuação por equipe por corrida
  const teamTrends: Record<string, { team: string; last3: number; last6: number; upgradeImpact: number; rounds: number[] }> = {};
  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const round = parseInt(r.round);
    r.Results.forEach((result: any) => {
      const team = result.Constructor.name;
      const pts = parseInt(result.points);
      teamTrends[team] = teamTrends[team] || { team, last3: 0, last6: 0, upgradeImpact: 0, rounds: []};
      teamTrends[team].last6 += pts;
      if (i >= races.length - 3) teamTrends[team].last3 += pts;
      teamTrends[team].rounds.push(round);
    });
  }
  // Normaliza e calcula impacto na etapa de atualização
  Object.values(teamTrends).forEach(trend => {
    const keyEvent = upgradeEvents[0]; // Espanha ex: round 6
    // Pts nas 2 corridas antes/depois do evento
    let before = 0, after = 0;
    for (let teamRoundIdx = 0; teamRoundIdx < trend.rounds.length; teamRoundIdx++) {
      const rnd = trend.rounds[teamRoundIdx];
      if (rnd === keyEvent.round - 1) before++;
      if (rnd === keyEvent.round + 1) after++;
    }
    trend.upgradeImpact = after - before;
  });

  return {
    isLoading: false,
    trends: Object.values(teamTrends),
    upgradeEvents,
  };
};
