import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Corridas da temporada 2025 da F1
const races2025 = [
  "BAH", "SAU", "AUS", "JPN", "CHN", "MIA", "ITA", "MON", "CAN", "ESP", 
  "AUT", "GBR", "HUN", "BEL", "NED", "SIN", "AZE", "USA", "MEX", "BRA", "LAS", "QAT", "ABU"
];

// Dados da temporada 2025 da F1 (após 10 de 23 corridas) - DADOS SIMULADOS
const driversData2025 = [
  { 
    position: 1, 
    name: "Max Verstappen", 
    team: "Red Bull Racing", 
    nationality: "🇳🇱",
    racePoints: [25, 18, 25, 18, 25, 25, 12, 15, 25, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 206
  },
  { 
    position: 2, 
    name: "Lando Norris", 
    team: "McLaren", 
    nationality: "🇬🇧",
    racePoints: [15, 12, 18, 15, 15, 18, 25, 18, 12, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 173
  },
  { 
    position: 3, 
    name: "Charles Leclerc", 
    team: "Ferrari", 
    nationality: "🇲🇨",
    racePoints: [18, 25, 15, 12, 18, 12, 18, 25, 15, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 158
  },
  { 
    position: 4, 
    name: "Lewis Hamilton", 
    team: "Ferrari", 
    nationality: "🇬🇧",
    racePoints: [12, 15, 10, 10, 12, 15, 15, 8, 18, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 127
  },
  { 
    position: 5, 
    name: "Oscar Piastri", 
    team: "McLaren", 
    nationality: "🇦🇺",
    racePoints: [10, 8, 12, 8, 10, 10, 10, 10, 8, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 101
  },
  { 
    position: 6, 
    name: "Sergio Pérez", 
    team: "Red Bull Racing", 
    nationality: "🇲🇽",
    racePoints: [8, 10, 8, 6, 8, 6, 8, 0, 10, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 72
  },
  { 
    position: 7, 
    name: "George Russell", 
    team: "Mercedes", 
    nationality: "🇬🇧",
    racePoints: [6, 6, 4, 8, 6, 8, 6, 12, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 68
  },
  { 
    position: 8, 
    name: "Carlos Sainz Jr.", 
    team: "Williams", 
    nationality: "🇪🇸",
    racePoints: [4, 4, 6, 10, 4, 4, 4, 6, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 50
  },
  { 
    position: 9, 
    name: "Fernando Alonso", 
    team: "Aston Martin", 
    nationality: "🇪🇸",
    racePoints: [2, 1, 1, 4, 2, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 15
  },
  { 
    position: 10, 
    name: "Alex Albon", 
    team: "Williams", 
    nationality: "🇹🇭",
    racePoints: [1, 1, 1, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 11
  },
  { 
    position: 11, 
    name: "Lance Stroll", 
    team: "Aston Martin", 
    nationality: "🇨🇦",
    racePoints: [0, 0, 0, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 4
  },
  { 
    position: 12, 
    name: "Nico Hülkenberg", 
    team: "Haas", 
    nationality: "🇩🇪",
    racePoints: [0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 3
  },
  { 
    position: 13, 
    name: "Yuki Tsunoda", 
    team: "RB", 
    nationality: "🇯🇵",
    racePoints: [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 2
  },
  { 
    position: 14, 
    name: "Kimi Antonelli", 
    team: "Mercedes", 
    nationality: "🇮🇹",
    racePoints: [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 2
  },
  { 
    position: 15, 
    name: "Daniel Ricciardo", 
    team: "RB", 
    nationality: "🇦🇺",
    racePoints: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 1
  },
  { 
    position: 16, 
    name: "Pierre Gasly", 
    team: "Alpine", 
    nationality: "🇫🇷",
    racePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 0
  },
  { 
    position: 17, 
    name: "Esteban Ocon", 
    team: "Alpine", 
    nationality: "🇫🇷",
    racePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 0
  },
  { 
    position: 18, 
    name: "Kevin Magnussen", 
    team: "Haas", 
    nationality: "🇩🇰",
    racePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 0
  },
  { 
    position: 19, 
    name: "Valtteri Bottas", 
    team: "Kick Sauber", 
    nationality: "🇫🇮",
    racePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 0
  },
  { 
    position: 20, 
    name: "Zhou Guanyu", 
    team: "Kick Sauber", 
    nationality: "🇨🇳",
    racePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalPoints: 0
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
    "Alpine": "bg-pink-500",
    "Haas": "bg-gray-400",
    "RB": "bg-blue-400",
    "Kick Sauber": "bg-green-400"
  };
  return colors[team] || "bg-gray-500";
};

const getPointsColor = (points: number) => {
  if (points === 25) return "text-yellow-400 font-bold";
  if (points === 18) return "text-gray-300 font-bold";
  if (points === 15) return "text-orange-400 font-bold";
  if (points >= 10) return "text-green-400 font-semibold";
  if (points >= 1) return "text-blue-400";
  return "text-gray-500";
};

const DriversStandings = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2025</h2>
        <p className="text-gray-300">Pontuação após 10 corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold sticky left-0 bg-black z-20 min-w-[50px]">Pos</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-[50px] bg-black z-20 min-w-[200px]">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold sticky left-[250px] bg-black z-20 min-w-[120px]">Equipe</TableHead>
              {races2025.map((race, index) => (
                <TableHead 
                  key={index} 
                  className="text-red-400 font-bold text-center min-w-[60px] px-2"
                >
                  {race}
                </TableHead>
              ))}
              <TableHead className="text-red-400 font-bold text-center bg-red-900 sticky right-0 z-20 min-w-[80px]">
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
                <TableCell className="font-bold text-white sticky left-0 bg-black z-10 text-center">
                  {driver.position === 1 && <span className="text-yellow-400 mr-1">👑</span>}
                  {driver.position}
                </TableCell>
                <TableCell className="text-white sticky left-[50px] bg-black z-10">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{driver.nationality}</span>
                    <span className="font-semibold whitespace-nowrap text-sm">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell className="sticky left-[250px] bg-black z-10">
                  <Badge className={`${getTeamColor(driver.team)} text-white text-xs whitespace-nowrap`}>
                    {driver.team}
                  </Badge>
                </TableCell>
                {driver.racePoints.map((points, index) => (
                  <TableCell 
                    key={index} 
                    className={`text-center font-medium px-2 ${getPointsColor(points)}`}
                  >
                    {points > 0 ? points : index < 10 ? '0' : '-'}
                  </TableCell>
                ))}
                <TableCell className="text-white font-bold text-lg text-center bg-red-900 sticky right-0 z-10">
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
