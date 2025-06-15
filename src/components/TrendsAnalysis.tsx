
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

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

// Função para buscar classificação atual
const fetchDriversStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const TrendsAnalysis = () => {
  const { data: standings, isLoading: isLoadingStandings } = useQuery({
    queryKey: ["driversStandingsTrends", 2025],
    queryFn: fetchDriversStandings,
  });

  const { data: races, isLoading: isLoadingRaces } = useQuery({
    queryKey: ["races2025", "trends"],
    queryFn: fetchAllRaces2025,
  });

  if (isLoadingStandings || isLoadingRaces) {
    return (
      <StandardTable
        title="Tendências dos Top 6 Pilotos"
        subtitle="Carregando análise de tendências baseada nas últimas corridas..."
        headers={["Pos", "Piloto", "Equipe", "Últimas 3", "Últimas 6", "Tendência"]}
      >
        <TableRow>
          <TableCell colSpan={6}>Carregando...</TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  if (!standings || !races) {
    return (
      <StandardTable
        title="Tendências dos Top 6 Pilotos"
        subtitle="Erro ao carregar dados."
        headers={["Pos", "Piloto", "Equipe", "Últimas 3", "Últimas 6", "Tendência"]}
      >
        <TableRow>
          <TableCell colSpan={6}>Erro ao carregar dados</TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  // Pegar apenas os top 6 pilotos
  const top6Drivers = standings.slice(0, 6);

  // Ordenar corridas por round
  const sortedRaces = [...races].sort((a, b) => parseInt(a.round) - parseInt(b.round));
  const allRounds = sortedRaces.map(r => parseInt(r.round));
  const last3Rounds = allRounds.slice(-3);
  const last6Rounds = allRounds.slice(-6);

  // Calcular pontos por piloto nas últimas corridas
  const driversWithTrends = top6Drivers.map((standing: any) => {
    const driverId = standing.Driver.driverId;
    
    let last3Points = 0;
    let last6Points = 0;

    // Calcular pontos nas últimas 3 e 6 corridas
    for (const race of sortedRaces) {
      const round = parseInt(race.round);
      const result = race.Results.find((r: any) => r.Driver.driverId === driverId);
      const points = result ? parseInt(result.points) : 0;

      if (last3Rounds.includes(round)) {
        last3Points += points;
      }
      if (last6Rounds.includes(round)) {
        last6Points += points;
      }
    }

    // Determinar tendência
    let trendStatus: "up" | "down" | "stable" = "stable";
    let trendIcon = null;
    
    if (last6Points === 0) {
      trendStatus = "stable";
    } else if (last3Points > (last6Points / 2)) {
      trendStatus = "up";
      trendIcon = <ArrowUpRight className="w-4 h-4 text-green-500" />;
    } else if (last3Points < (last6Points / 2)) {
      trendStatus = "down";
      trendIcon = <ArrowDownRight className="w-4 h-4 text-red-500" />;
    } else {
      trendStatus = "stable";
      trendIcon = <span className="text-yellow-500 text-sm">estável</span>;
    }

    return {
      ...standing,
      last3Points,
      last6Points,
      trendStatus,
      trendIcon
    };
  });

  return (
    <StandardTable
      title="Tendências dos Top 6 Pilotos"
      subtitle="Análise baseada no desempenho nas últimas 3 e 6 corridas da temporada 2025"
      headers={["Pos", "Piloto", "Equipe", "Últimas 3", "Últimas 6", "Tendência"]}
    >
      {driversWithTrends.map((driver: any) => (
        <TableRow
          key={driver.Driver.driverId}
          className="border-red-800/70 hover:bg-red-900/10 transition-colors"
        >
          <TableCell>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              driver.position === "1"
                ? "bg-yellow-500 text-black"
                : driver.position === "2"
                ? "bg-gray-400 text-black"
                : driver.position === "3"
                ? "bg-amber-700 text-white"
                : "bg-gray-200 text-gray-900"
            }`}>
              {driver.position}
            </span>
          </TableCell>
          <TableCell className="font-semibold">
            {driver.Driver.givenName} {driver.Driver.familyName}
          </TableCell>
          <TableCell>
            <TeamLogo teamName={driver.Constructors[0].name} className="w-32 h-16" />
          </TableCell>
          <TableCell className="font-semibold">{driver.last3Points} pts</TableCell>
          <TableCell className="font-semibold">{driver.last6Points} pts</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {driver.trendIcon}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default TrendsAnalysis;
