
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

interface Result {
  position: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
}

interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  Results: Result[];
}

interface RaceResponse {
  MRData: {
    RaceTable: {
      Races: Race[];
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
const fetchRaceResults = async (): Promise<Race[]> => {
  // Buscar todas as corridas da temporada 2025
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/results.json?limit=100');
  if (!response.ok) {
    throw new Error('A resposta da rede não foi bem-sucedida');
  }
  const data: RaceResponse = await response.json();
  return data.MRData.RaceTable.Races;
};

const RaceByRaceStandings = () => {
  const { data: races, isLoading, isError, error } = useQuery({
    queryKey: ['raceResults', 2025],
    queryFn: fetchRaceResults,
  });

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
        <div className="p-6 border-b border-red-800/30">
          <h2 className="text-2xl font-bold text-white mb-2">Resultados Corrida a Corrida 2025</h2>
          <p className="text-gray-300">A carregar dados das corridas...</p>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
        <p className="text-gray-300 mb-4">Não foi possível buscar os resultados das corridas.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!races || races.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 p-6 text-white text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Temporada 2025</h2>
        <p className="text-gray-300">Ainda não há resultados de corridas para esta temporada.</p>
      </div>
    );
  }

  // Criar uma matriz de pilotos e seus pontos por corrida
  const allDrivers = new Set<string>();
  const driverData: { [key: string]: { driver: Driver; constructor: Constructor; racePoints: { [round: string]: string } } } = {};

  // Coletar todos os pilotos e seus dados
  races.forEach(race => {
    race.Results.forEach(result => {
      const driverId = result.Driver.driverId;
      allDrivers.add(driverId);
      
      if (!driverData[driverId]) {
        driverData[driverId] = {
          driver: result.Driver,
          constructor: result.Constructor,
          racePoints: {}
        };
      }
      
      driverData[driverId].racePoints[race.round] = result.points;
    });
  });

  // Calcular pontos totais para ordenação
  const driversWithTotals = Object.entries(driverData).map(([driverId, data]) => {
    const totalPoints = Object.values(data.racePoints).reduce((sum, points) => sum + parseInt(points || '0'), 0);
    return { driverId, ...data, totalPoints };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Resultados Corrida a Corrida 2025</h2>
        <p className="text-gray-300">Pontos por corrida de cada piloto</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold sticky left-0 bg-black/40 min-w-[200px]">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-[200px] bg-black/40 min-w-[150px]">Equipe</TableHead>
              {races.map((race) => (
                <TableHead key={race.round} className="text-red-400 font-bold text-center min-w-[80px]">
                  R{race.round}
                </TableHead>
              ))}
              <TableHead className="text-red-400 font-bold text-center min-w-[80px]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversWithTotals.map(({ driverId, driver, constructor, racePoints, totalPoints }) => (
              <TableRow 
                key={driverId} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="sticky left-0 bg-black/40 text-white">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
                    <span className="font-semibold whitespace-nowrap">{`${driver.givenName} ${driver.familyName}`}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-[200px] bg-black/40">
                  <Badge className={`${getTeamColor(constructor.name)} text-white text-xs whitespace-nowrap`}>
                    {constructor.name}
                  </Badge>
                </TableCell>
                {races.map((race) => (
                  <TableCell key={race.round} className="text-white text-center font-medium">
                    {racePoints[race.round] || '0'}
                  </TableCell>
                ))}
                <TableCell className="text-white font-bold text-lg text-center bg-red-900/20">
                  {totalPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RaceByRaceStandings;
