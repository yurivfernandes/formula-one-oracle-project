
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Tipos de dados da API ---
interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

interface StandingsList {
  season: string;
  round: string;
  ConstructorStandings: ConstructorStanding[];
}

interface ErgastResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: StandingsList[];
    };
  };
}

// --- Funções Auxiliares ---
const getTeamColor = (team: string) => {
  const colors: { [key: string]: string } = {
    "McLaren": "bg-orange-500",
    "Ferrari": "bg-red-600",
    "Red Bull": "bg-blue-600",
    "Mercedes": "bg-gray-600",
    "Williams": "bg-cyan-600",
    "Aston Martin": "bg-green-600",
    "Alpine F1 Team": "bg-pink-500",
    "Haas F1 Team": "bg-gray-400",
    "RB F1 Team": "bg-blue-400",
    "Sauber": "bg-green-400"
  };
  return colors[team] || "bg-gray-500";
};

const getNationalityFlag = (nationality: string) => {
  const flags: { [key: string]: string } = {
    "British": "🇬🇧",
    "Italian": "🇮🇹",
    "Austrian": "🇦🇹",
    "German": "🇩🇪",
    "American": "🇺🇸",
    "French": "🇫🇷",
    "Swiss": "🇨🇭"
  };
  return flags[nationality] || "🏁";
};

// --- Função de Fetch ---
const fetchConstructorStandings = async (): Promise<StandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json');
  if (!response.ok) {
    throw new Error('A resposta da rede não foi bem-sucedida');
  }
  const data: ErgastResponse = await response.json();
  if (!data.MRData.StandingsTable.StandingsLists.length) {
    return { season: "2025", round: "0", ConstructorStandings: [] };
  }
  return data.MRData.StandingsTable.StandingsLists[0];
};

const ConstructorsStandings = () => {
  const { data: standingsList, isLoading, isError, error } = useQuery({
    queryKey: ['constructorStandings', 2025],
    queryFn: fetchConstructorStandings,
  });

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
        <div className="p-6 border-b border-red-800/30">
          <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Construtores 2025</h2>
          <p className="text-gray-300">A carregar dados da temporada...</p>
        </div>
        <div className="p-6 space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-12 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
        <p className="text-gray-300 mb-4">Não foi possível buscar a classificação dos construtores.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!standingsList || standingsList.ConstructorStandings.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Temporada 2025</h2>
        <p className="text-gray-300">Ainda não há dados de classificação de construtores para esta temporada.</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Construtores 2025</h2>
        <p className="text-gray-300">Pontuação após {standingsList.round} corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold w-16">Pos</TableHead>
              <TableHead className="text-red-400 font-bold min-w-[200px]">Equipe</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Pontos</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Vitórias</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standingsList.ConstructorStandings.map((constructor) => (
              <TableRow 
                key={constructor.Constructor.constructorId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white text-center">
                  {constructor.position === "1" && <span className="text-yellow-400 mr-1">👑</span>}
                  {constructor.position}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getNationalityFlag(constructor.Constructor.nationality)}</span>
                    <Badge className={`${getTeamColor(constructor.Constructor.name)} text-white px-3 py-1`}>
                      {constructor.Constructor.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-white font-bold text-lg text-center">
                  {constructor.points}
                </TableCell>
                <TableCell className="text-white text-center font-medium">
                  {constructor.wins}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConstructorsStandings;
