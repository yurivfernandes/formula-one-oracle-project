
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const constructorsData = [
  { 
    position: 1, 
    name: "McLaren", 
    points: 648, 
    wins: 5,
    podiums: 23,
    flag: "🇬🇧"
  },
  { 
    position: 2, 
    name: "Ferrari", 
    points: 590, 
    wins: 3,
    podiums: 20,
    flag: "🇮🇹"
  },
  { 
    position: 3, 
    name: "Red Bull Racing", 
    points: 727, 
    wins: 19,
    podiums: 25,
    flag: "🇦🇹"
  },
  { 
    position: 4, 
    name: "Mercedes", 
    points: 468, 
    wins: 4,
    podiums: 12,
    flag: "🇩🇪"
  },
  { 
    position: 5, 
    name: "Aston Martin", 
    points: 94, 
    wins: 0,
    podiums: 1,
    flag: "🇬🇧"
  },
  { 
    position: 6, 
    name: "Alpine", 
    points: 65, 
    wins: 0,
    podiums: 0,
    flag: "🇫🇷"
  },
  { 
    position: 7, 
    name: "Haas", 
    points: 58, 
    wins: 0,
    podiums: 0,
    flag: "🇺🇸"
  },
  { 
    position: 8, 
    name: "RB", 
    points: 46, 
    wins: 0,
    podiums: 0,
    flag: "🇮🇹"
  },
  { 
    position: 9, 
    name: "Williams", 
    points: 17, 
    wins: 0,
    podiums: 0,
    flag: "🇬🇧"
  },
  { 
    position: 10, 
    name: "Kick Sauber", 
    points: 4, 
    wins: 0,
    podiums: 0,
    flag: "🇨🇭"
  }
];

const getTeamColor = (team: string) => {
  const colors: { [key: string]: string } = {
    "McLaren": "bg-orange-500",
    "Ferrari": "bg-red-600",
    "Red Bull Racing": "bg-blue-600",
    "Mercedes": "bg-gray-600",
    "Aston Martin": "bg-green-600",
    "Alpine": "bg-pink-500",
    "Haas": "bg-gray-400",
    "RB": "bg-blue-400",
    "Williams": "bg-cyan-500",
    "Kick Sauber": "bg-green-400"
  };
  return colors[team] || "bg-gray-500";
};

const ConstructorsStandings = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Construtores 2024</h2>
        <p className="text-gray-300">Pontuação após 24 corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold">Pos</TableHead>
              <TableHead className="text-red-400 font-bold">Equipe</TableHead>
              <TableHead className="text-red-400 font-bold">Pontos</TableHead>
              <TableHead className="text-red-400 font-bold">Vitórias</TableHead>
              <TableHead className="text-red-400 font-bold">Pódios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {constructorsData.map((constructor) => (
              <TableRow 
                key={constructor.position} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white">
                  {constructor.position === 1 && <span className="text-yellow-400">👑</span>}
                  {constructor.position}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <span>{constructor.flag}</span>
                    <Badge className={`${getTeamColor(constructor.name)} text-white`}>
                      {constructor.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-white font-bold text-lg">
                  {constructor.points}
                </TableCell>
                <TableCell className="text-white">
                  {constructor.wins}
                </TableCell>
                <TableCell className="text-white">
                  {constructor.podiums}
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
