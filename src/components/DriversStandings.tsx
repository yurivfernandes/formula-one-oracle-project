
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const driversData = [
  { 
    position: 1, 
    name: "Max Verstappen", 
    team: "Red Bull Racing", 
    points: 575, 
    wins: 19,
    podiums: 21,
    nationality: "🇳🇱"
  },
  { 
    position: 2, 
    name: "Lando Norris", 
    team: "McLaren", 
    points: 356, 
    wins: 3,
    podiums: 15,
    nationality: "🇬🇧"
  },
  { 
    position: 3, 
    name: "Charles Leclerc", 
    team: "Ferrari", 
    points: 323, 
    wins: 2,
    podiums: 11,
    nationality: "🇲🇨"
  },
  { 
    position: 4, 
    name: "Oscar Piastri", 
    team: "McLaren", 
    points: 292, 
    wins: 2,
    podiums: 8,
    nationality: "🇦🇺"
  },
  { 
    position: 5, 
    name: "Carlos Sainz", 
    team: "Ferrari", 
    points: 267, 
    wins: 1,
    podiums: 9,
    nationality: "🇪🇸"
  },
  { 
    position: 6, 
    name: "George Russell", 
    team: "Mercedes", 
    points: 245, 
    wins: 2,
    podiums: 5,
    nationality: "🇬🇧"
  },
  { 
    position: 7, 
    name: "Lewis Hamilton", 
    team: "Mercedes", 
    points: 223, 
    wins: 2,
    podiums: 7,
    nationality: "🇬🇧"
  },
  { 
    position: 8, 
    name: "Sergio Pérez", 
    team: "Red Bull Racing", 
    points: 152, 
    wins: 0,
    podiums: 4,
    nationality: "🇲🇽"
  },
  { 
    position: 9, 
    name: "Fernando Alonso", 
    team: "Aston Martin", 
    points: 86, 
    wins: 0,
    podiums: 1,
    nationality: "🇪🇸"
  },
  { 
    position: 10, 
    name: "Nico Hülkenberg", 
    team: "Haas", 
    points: 35, 
    wins: 0,
    podiums: 0,
    nationality: "🇩🇪"
  }
];

const getTeamColor = (team: string) => {
  const colors: { [key: string]: string } = {
    "Red Bull Racing": "bg-blue-600",
    "McLaren": "bg-orange-500",
    "Ferrari": "bg-red-600",
    "Mercedes": "bg-gray-600",
    "Aston Martin": "bg-green-600",
    "Haas": "bg-gray-400"
  };
  return colors[team] || "bg-gray-500";
};

const DriversStandings = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Pilotos 2024</h2>
        <p className="text-gray-300">Pontuação após 24 corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold">Pos</TableHead>
              <TableHead className="text-red-400 font-bold">Piloto</TableHead>
              <TableHead className="text-red-400 font-bold">Equipe</TableHead>
              <TableHead className="text-red-400 font-bold">Pontos</TableHead>
              <TableHead className="text-red-400 font-bold">Vitórias</TableHead>
              <TableHead className="text-red-400 font-bold">Pódios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversData.map((driver) => (
              <TableRow 
                key={driver.position} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white">
                  {driver.position === 1 && <span className="text-yellow-400">👑</span>}
                  {driver.position}
                </TableCell>
                <TableCell className="text-white">
                  <div className="flex items-center space-x-2">
                    <span>{driver.nationality}</span>
                    <span className="font-semibold">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getTeamColor(driver.team)} text-white`}>
                    {driver.team}
                  </Badge>
                </TableCell>
                <TableCell className="text-white font-bold text-lg">
                  {driver.points}
                </TableCell>
                <TableCell className="text-white">
                  {driver.wins}
                </TableCell>
                <TableCell className="text-white">
                  {driver.podiums}
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
