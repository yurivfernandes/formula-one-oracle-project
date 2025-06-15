
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Tipos de dados da API ---
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

interface StandingsList {
  season: string;
  round: string;
  DriverStandings: DriverStanding[];
}

interface ErgastResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: StandingsList[];
    };
  };
}

// --- Funções Auxiliares ---
const getTeamLogo = (team: string) => {
  const logos: { [key: string]: string } = {
    "Red Bull Racing": "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png",
    "McLaren": "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png",
    "Ferrari": "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png",
    "Mercedes": "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png",
    "Williams": "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png",
    "Aston Martin": "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png",
    "Alpine": "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png",
    "Haas": "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png.transform/2col/image.png",
    "RB": "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png",
    "Kick Sauber": "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png"
  };
  return logos[team] || "";
};

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
    "American": "🇺🇸"
  };
  return flags[nationality] || "🏁";
};

// --- Função de Fetch ---
const fetchDriverStandings = async (): Promise<StandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverstandings.json');
  if (!response.ok) {
    throw new Error('A resposta da rede não foi bem-sucedida');
  }
  const data: ErgastResponse = await response.json();
  if (!data.MRData.StandingsTable.StandingsLists.length) {
    return { season: "2025", round: "0", DriverStandings: [] };
  }
  return data.MRData.StandingsTable.StandingsLists[0];
};

const DriversStandings = () => {
  const { data: standingsList, isLoading, isError, error } = useQuery({
    queryKey: ['driverStandings', 2025],
    queryFn: fetchDriverStandings,
  });

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
        <div className="p-6 border-b border-red-800/30">
          <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
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
        <p className="text-gray-300 mb-4">Não foi possível buscar a classificação dos pilotos.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!standingsList || standingsList.DriverStandings.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Temporada 2025</h2>
        <p className="text-gray-300">Ainda não há dados de classificação de pilotos para esta temporada.</p>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
        <p className="text-gray-300">Pontuação após {standingsList.round} corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold w-[60px]">Pos</TableHead>
              <TableHead className="text-red-400 font-bold min-w-[200px]">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold min-w-[150px]">Equipe</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standingsList.DriverStandings.map((driver) => (
              <TableRow 
                key={driver.Driver.driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white text-center">
                  {driver.position === "1" && <span className="text-yellow-400 mr-1">👑</span>}
                  {driver.position}
                </TableCell>
                <TableCell className="text-white">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getNationalityFlag(driver.Driver.nationality)}</span>
                    <span className="font-semibold whitespace-nowrap">{`${driver.Driver.givenName} ${driver.Driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <img 
                      src={getTeamLogo(driver.Constructors[0].name)} 
                      alt={driver.Constructors[0].name}
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-white text-xs font-medium">${driver.Constructors[0].name}</span>`;
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-white font-bold text-lg text-center">
                  {driver.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriversStandings;
