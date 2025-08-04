import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

const fetchConstructorsStandings = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings/');
  if (!response.ok) throw new Error('Erro ao buscar classificação de construtores');
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
};

const ConstructorsStandings = () => {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ['constructorsStandings', 2025],
    queryFn: fetchConstructorsStandings,
  });

  if (isLoading) {
    return (
      <StandardTable
        title="Classificação de Construtores 2025"
        subtitle="Carregando dados da temporada..."
        headers={["Pos", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={4}>
            <div className="bg-black">
              <Skeleton className="h-96 w-full" />
            </div>
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  if (error) {
    return (
      <StandardTable
        title="Classificação de Construtores 2025"
        subtitle="Erro ao carregar dados"
        headers={["Pos", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={4} className="text-center text-red-400">
            Erro ao carregar classificação dos construtores
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  return (
    <StandardTable
      title="Classificação de Construtores 2025"
      subtitle="Classificação atual do campeonato mundial de construtores"
      headers={["Pos", "Equipe", "Pontos", "Vitórias"]}
    >
      {standings?.map((standing: any) => (
        <TableRow
          key={standing.Constructor.constructorId}
          className="border-red-800/70 hover:bg-red-900/10 transition-colors"
        >
          <TableCell className="w-10 sm:w-12">
            <span
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                standing.position === "1"
                  ? "bg-yellow-500 text-black"
                  : standing.position === "2"
                  ? "bg-gray-400 text-black"
                  : standing.position === "3"
                  ? "bg-amber-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {standing.position}
            </span>
          </TableCell>
          <TableCell className="min-w-[120px] sm:min-w-[160px]">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <TeamLogo teamName={standing.Constructor.name} className="w-8 h-5 sm:w-12 sm:h-8" />
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                {standing.Constructor.name}
              </span>
            </div>
          </TableCell>
          <TableCell className="text-center font-bold text-sm sm:text-lg text-gray-900 min-w-[60px]">
            {standing.points}
          </TableCell>
          <TableCell className="text-center font-bold text-gray-900 text-sm sm:text-base min-w-[50px]">
            {standing.wins}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default ConstructorsStandings;
