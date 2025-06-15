
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Tipos de dados da API ---
interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
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
    "McLaren": "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png",
    "Ferrari": "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png",
    "Red Bull": "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png",
    "Mercedes": "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png",
    "Williams": "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png",
    "Aston Martin": "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png",
    "Alpine F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png",
    "Haas F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png.transform/2col/image.png",
    "RB F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png",
    "Sauber": "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png"
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
    "American": "🇺🇸",
    "New Zealander": "🇳🇿",
    "Brazilian": "🇧🇷",
    "Argentine": "🇦🇷"
  };
  return flags[nationality] || "🏁";
};

// --- Função de Fetch ---
const fetchDriverStandings = async (): Promise<StandingsList> => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings.json');
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
      <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/30 bg-black/50">
          <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
          <p className="text-gray-300">A carregar dados da temporada...</p>
        </div>
        <div className="p-6 space-y-3">
          {[...Array(20)].map((_, i) => (
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
      <div className="bg-gray-900 rounded-xl border border-red-800/30 p-6 text-white text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
        <p className="text-gray-300 mb-4">Não foi possível buscar a classificação dos pilotos.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!standingsList || standingsList.DriverStandings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-red-800/30 p-6 text-white text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Temporada 2025</h2>
        <p className="text-gray-300">Ainda não há dados de classificação de pilotos para esta temporada.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-red-800/30 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-red-800/30 bg-black/50">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
        <p className="text-gray-300">Pontuação após {standingsList.round} corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30 bg-black/50">
              <TableHead className="text-gray-300 font-bold w-16">Pos</TableHead>
              <TableHead className="text-gray-300 font-bold min-w-[200px]">Piloto</TableHead>
              <TableHead className="text-gray-300 font-bold min-w-[100px]">Equipe</TableHead>
              <TableHead className="text-gray-300 font-bold text-center">Pontos</TableHead>
              <TableHead className="text-gray-300 font-bold text-center">Vitórias</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standingsList.DriverStandings.map((driver) => (
              <TableRow 
                key={driver.Driver.driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white text-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    driver.position === "1" ? 'bg-yellow-500 text-black' : 
                    driver.position === "2" ? 'bg-gray-400 text-black' : 
                    driver.position === "3" ? 'bg-amber-600 text-white' : 
                    'bg-gray-600 text-white'
                  }`}>
                    {driver.position}
                  </span>
                </TableCell>
                <TableCell className="text-white">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getNationalityFlag(driver.Driver.nationality)}</span>
                    <span className="font-semibold">{`${driver.Driver.givenName} ${driver.Driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center bg-white/10 rounded-lg p-2">
                    <img 
                      src={getTeamLogo(driver.Constructors[0].name)} 
                      alt={driver.Constructors[0].name}
                      className="w-12 h-8 object-contain filter brightness-0 invert"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-white text-xs font-medium px-2">${driver.Constructors[0].name}</span>`;
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-white font-bold text-lg text-center">
                  {driver.points}
                </TableCell>
                <TableCell className="text-white text-center font-medium">
                  {driver.wins}
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
