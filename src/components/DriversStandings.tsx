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
          className="border-red-800/70 hover:bg-red-900/30 transition-colors"
        >
          <TableCell className="text-white font-bold">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                standing.position === "1"
                  ? "bg-yellow-500 text-black"
                  : standing.position === "2"
                  ? "bg-gray-400 text-black"
                  : standing.position === "3"
                  ? "bg-amber-700 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {standing.position}
            </span>
          </TableCell>
          <TableCell className="text-white">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getNationalityFlag(standing.Driver.nationality)}</span>
              <span className="font-semibold">{`${standing.Driver.givenName} ${standing.Driver.familyName}`}</span>
            </div>
          </TableCell>
          <TableCell>
            <TeamLogo teamName={standing.Constructors[0].name} />
          </TableCell>
          <TableCell className="text-white text-center font-bold text-lg">
            {standing.points}
          </TableCell>
          <TableCell className="text-white text-center font-bold">
            {standing.wins}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default DriversStandings;
