
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const constructorsData2025 = [
  { 
    position: 1, 
    name: "McLaren", 
    points: 886, 
    wins: 12,
    podiums: 28,
    flag: "🇬🇧"
  },
  { 
    position: 2, 
    name: "Red Bull Racing", 
    points: 566, 
    wins: 8,
    podiums: 18,
    flag: "🇦🇹"
  },
  { 
    position: 3, 
    name: "Ferrari", 
    points: 460, 
    wins: 2,
    podiums: 15,
    flag: "🇮🇹"
  },
  { 
    position: 4, 
    name: "Williams", 
    points: 230, 
    wins: 1,
    podiums: 3,
    flag: "🇬🇧"
  },
  { 
    position: 5, 
    name: "Mercedes", 
    points: 138, 
    wins: 0,
    podiums: 2,
    flag: "🇩🇪"
  },
  { 
    position: 6, 
    name: "Aston Martin", 
    points: 69, 
    wins: 0,
    podiums: 0,
    flag: "🇬🇧"
  },
  { 
    position: 7, 
    name: "Alpine", 
    points: 28, 
    wins: 0,
    podiums: 0,
    flag: "🇫🇷"
  },
  { 
    position: 8, 
    name: "Haas", 
    points: 18, 
    wins: 0,
    podiums: 0,
    flag: "🇺🇸"
  },
  { 
    position: 9, 
    name: "RB", 
    points: 12, 
    wins: 0,
    podiums: 0,
    flag: "🇮🇹"
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
    "Williams": "bg-cyan-600",
    "Aston Martin": "bg-green-600",
    "Alpine": "bg-pink-500",
    "Haas": "bg-gray-400",
    "RB": "bg-blue-400",
    "Kick Sauber": "bg-green-400"
  };
  return colors[team] || "bg-gray-500";
};

const ConstructorsStandings = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-800/30 overflow-hidden">
      <div className="p-6 border-b border-red-800/30">
        <h2 className="text-2xl font-bold text-white mb-2">Classificação dos Construtores 2025</h2>
        <p className="text-gray-300">Pontuação após 23 corridas</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/30">
              <TableHead className="text-red-400 font-bold w-16">Pos</TableHead>
              <TableHead className="text-red-400 font-bold min-w-[200px]">Equipe</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Pontos</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Vitórias</TableHead>
              <TableHead className="text-red-400 font-bold text-center">Pódios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {constructorsData2025.map((constructor) => (
              <TableRow 
                key={constructor.position} 
                className="border-red-800/30 hover:bg-red-900/20 transition-colors"
              >
                <TableCell className="font-bold text-white text-center">
                  {constructor.position === 1 && <span className="text-yellow-400 mr-1">👑</span>}
                  {constructor.position}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{constructor.flag}</span>
                    <Badge className={`${getTeamColor(constructor.name)} text-white px-3 py-1`}>
                      {constructor.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-white font-bold text-lg text-center">
                  {constructor.points}
                </TableCell>
                <TableCell className="text-white text-center font-medium">
                  {constructor.wins}
                </TableCell>
                <TableCell className="text-white text-center font-medium">
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
