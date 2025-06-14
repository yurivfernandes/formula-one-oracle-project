
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Dados simulados da temporada 2025 com pontos por corrida
const races2025 = [
  "BAH", "SAU", "AUS", "JPN", "CHN", "MIA", "ITA", "MON", "CAN", "ESP", 
  "AUT", "GBR", "HUN", "BEL", "NED", "SIN", "AZE", "USA", "MEX", "BRA", "LAS", "QAT", "ABU"
];

const driversData2025 = [
  { 
    position: 1, 
    name: "Max Verstappen", 
    team: "Red Bull Racing", 
    nationality: "🇳🇱",
    racePoints: [25, 18, 25, 25, 18, 25, 15, 25, 18, 25, 25, 18, 25, 12, 25, 18, 25, 25, 18, 25, 18, 25, 25],
    totalPoints: 487
  },
  { 
    position: 2, 
    name: "Lando Norris", 
    team: "McLaren", 
    nationality: "🇬🇧",
    racePoints: [18, 25, 18, 18, 25, 18, 25, 18, 25, 18, 18, 25, 18, 25, 18, 25, 18, 18, 25, 18, 25, 18, 18],
    totalPoints: 456
  },
  { 
    position: 3, 
    name: "Charles Leclerc", 
    team: "Ferrari", 
    nationality: "🇲🇨",
    racePoints: [15, 15, 15, 15, 15, 15, 18, 15, 15, 15, 15, 15, 15, 18, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    totalPoints: 351
  },
  { 
    position: 4, 
    name: "Oscar Piastri", 
    team: "McLaren", 
    nationality: "🇦🇺",
    racePoints: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 15, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    totalPoints: 279
  },
  { 
    position: 5, 
    name: "Carlos Sainz", 
    team: "Williams", 
    nationality: "🇪🇸",
    racePoints: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    totalPoints: 230
  },
  { 
    position: 6, 
    name: "George Russell", 
    team: "Mercedes", 
    nationality: "🇬🇧",
    racePoints: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    totalPoints: 184
  },
  { 
    position: 7, 
    name: "Lewis Hamilton", 
    team: "Ferrari", 
    nationality: "🇬🇧",
    racePoints: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    totalPoints: 138
  },
  { 
    position: 8, 
    name: "Sergio Pérez", 
    team: "Red Bull Racing", 
    nationality: "🇲🇽",
    racePoints: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    totalPoints: 92
  }
];

const getTeamColor = (team: string) => {
  const colors: { [key: string]: string } = {
    "Red Bull Racing": "bg-blue-600",
    "McLaren": "bg-orange-500",
    "Ferrari": "bg-red-600",
    "Mercedes": "bg-gray-600",
    "Williams": "bg-cyan-600",
    "Aston Martin": "bg-green-600",
    "Haas": "bg-gray-400"
  };
  return colors[team] || "bg-gray-500";
};

const DriversStandings = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
        <p className="text-gray-300">Pontuação após {races2025.length} corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold sticky left-0 bg-black/40 z-10">Pos</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-12 bg-black/40 z-10">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-64 bg-black/40 z-10">Equipe</TableHead>
              {races2025.map((race, index) => (
                <TableHead 
                  key={index} 
                  className="text-red-400 font-bold text-center min-w-12"
                >
                  {race}
                </TableHead>
              ))}
              <TableHead className="text-red-400 font-bold text-center bg-red-900/30 sticky right-0 z-10">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversData2025.map((driver) => (
              <TableRow 
                key={driver.position} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white sticky left-0 bg-black/40 z-10">
                  {driver.position === 1 && <span className="text-yellow-400">👑</span>}
                  {driver.position}
                </TableCell>
                <TableCell className="text-white sticky left-12 bg-black/40 z-10">
                  <div className="flex items-center space-x-2">
                    <span>{driver.nationality}</span>
                    <span className="font-semibold whitespace-nowrap">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-64 bg-black/40 z-10">
                  <Badge className={`${getTeamColor(driver.team)} text-white whitespace-nowrap`}>
                    {driver.team}
                  </Badge>
                </TableCell>
                {driver.racePoints.map((points, index) => (
                  <TableCell 
                    key={index} 
                    className="text-white text-center font-medium"
                  >
                    {points > 0 ? points : '-'}
                  </TableCell>
                ))}
                <TableCell className="text-white font-bold text-lg text-center bg-red-900/30 sticky right-0 z-10">
                  {driver.totalPoints}
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
