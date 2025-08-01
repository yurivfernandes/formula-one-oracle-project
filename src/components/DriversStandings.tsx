import { useQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";

interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

interface Constructor {
  constructorId: string;
  name: string;
}

interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

const getNationalityFlag = (nationality: string) => {
  const flags: { [key: string]: string } = {
    "Dutch": "🇳🇱",
    "British": "🇬🇧",
    "Monegasque": "🇲🇨",
    "Australian": "🇦🇺",
    "Mexican": "🇲🇽",
    "Spanish": "🇪🇸",
    "Thai": "🇹🇭",
    "Canadian": "🇨🇦",
    "German": "🇩🇪",
    "Japanese": "🇯🇵",
    "Italian": "🇮🇹",
    "French": "🇫🇷",
    "Danish": "🇩🇰",
    "Finnish": "🇫🇮",
    "Chinese": "🇨🇳",
    "American": "🇺🇸",
		"New Zealander": "🇳🇿",
		"Brazilian": "🇧🇷",
		"Argentine": "🇦🇷"
  };
  return flags[nationality] || "🏁";
};

const fetchDriversStandings = async (): Promise<DriverStanding[]> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings/');
  if (!response.ok) {
    throw new Error('Failed to fetch driver standings');
  }
  const data = await response.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
};

const DriversStandings = () => {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ["driversStandings", 2025],
    queryFn: fetchDriversStandings,
  });

  if (isLoading) {
    return (
      <StandardTable
        title="Classificação de Pilotos 2025"
        subtitle="Carregando dados da temporada..."
        headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={5}>
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
        title="Classificação de Pilotos 2025"
        subtitle="Erro ao carregar dados"
        headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
      >
        <TableRow>
          <TableCell colSpan={5} className="text-center text-red-400">
            Erro ao carregar classificação dos pilotos
          </TableCell>
        </TableRow>
      </StandardTable>
    );
  }

  return (
    <StandardTable
      title="Classificação de Pilotos 2025"
      subtitle="Classificação atual do campeonato mundial de pilotos"
      headers={["Pos", "Piloto", "Equipe", "Pontos", "Vitórias"]}
    >
      {standings?.map((standing: any) => (
        <TableRow
          key={standing.Driver.driverId}
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
          <TableCell className="min-w-[120px] sm:min-w-[180px]">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-base sm:text-lg">{getNationalityFlag(standing.Driver.nationality)}</span>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold text-gray-900 text-xs sm:text-base">
                  {standing.Driver.givenName}
                </span>
                <span className="font-semibold text-gray-900 text-xs sm:text-base sm:ml-1">
                  {standing.Driver.familyName}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell className="min-w-[80px] sm:min-w-[120px]">
            <TeamLogo teamName={standing.Constructors[0].name} className="w-8 h-5 sm:w-12 sm:h-8" />
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

export default DriversStandings;
