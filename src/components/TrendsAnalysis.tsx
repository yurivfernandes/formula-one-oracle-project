
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

const fetchDriversStandings = async () => {
  // Traz só os pilotos de 2025 realmente!
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const TrendsAnalysis = () => {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ["driversStandingsTrends", 2025],
    queryFn: fetchDriversStandings,
  });

  if (isLoading) {
    return (
      <StandardTable
        title="Tendências dos Pilotos (Campeonato Atual)"
        subtitle="Carregando dados das tendências da temporada atual..."
        headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={5}>Carregando...</TableCell>
        </TableRow>
      </StandardTable>
    );
  }
  if (error) {
    return (
      <StandardTable
        title="Tendências dos Pilotos (Campeonato Atual)"
        subtitle="Erro ao carregar dados."
        headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={5}>Erro ao carregar dados</TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  return (
    <StandardTable
      title="Tendências dos Pilotos (Campeonato Atual)"
      subtitle="Baseado somente nos pilotos participantes do campeonato de 2025"
      headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
    >
      {standings.map((standing: any) => (
        <TableRow
          key={standing.Driver.driverId}
          className="border-red-800/70 hover:bg-red-900/10 transition-colors"
        >
          <TableCell>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              standing.position === "1"
                ? "bg-yellow-500 text-black"
                : standing.position === "2"
                ? "bg-gray-400 text-black"
                : standing.position === "3"
                ? "bg-amber-700 text-white"
                : "bg-gray-200 text-gray-900"
            }`}>
              {standing.position}
            </span>
          </TableCell>
          <TableCell>
            {standing.Driver.givenName} {standing.Driver.familyName}
          </TableCell>
          <TableCell>
            <TeamLogo teamName={standing.Constructors[0].name} className="w-24 h-12" />
          </TableCell>
          <TableCell>{standing.points}</TableCell>
          <TableCell>{standing.wins}</TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default TrendsAnalysis;
