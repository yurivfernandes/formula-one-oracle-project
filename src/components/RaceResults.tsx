
import { useQuery } from "@tanstack/react-query";
import { Flag, Clock } from "lucide-react";
import StandardTable from "./StandardTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TeamLogo from "./TeamLogo";

interface RaceResult {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructor: {
    name: string;
  };
  laps: string;
  status: string;
  Time?: {
    time: string;
  };
  grid: string;
}

interface RaceResultsProps {
  round: string;
}

const fetchRaceResults = async (round: string) => {
  const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/results.json`);
  const data = await response.json();
  return data.MRData.RaceTable.Races[0]?.Results || [];
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

const RaceResults: React.FC<RaceResultsProps> = ({ round }) => {
  const { data: raceResults, isLoading, error } = useQuery({
    queryKey: ['raceResults', round],
    queryFn: () => fetchRaceResults(round),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full bg-gray-800" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-gray-800" />
        ))}
      </div>
    );
  }

  if (error || !raceResults || raceResults.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-8 text-center">
        <Flag className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-blue-400 mb-2">Corrida Ainda Não Realizada</h3>
        <p className="text-blue-200">Os resultados da corrida aparecerão aqui após a prova.</p>
      </div>
    );
  }

  return (
    <StandardTable
      title="Resultado da Corrida"
      subtitle="Classificação final da corrida"
      headers={["Pos", "Piloto", "Equipe", "Tempo/Status", "Pts", "Grid"]}
    >
      {raceResults.map((result: RaceResult, index: number) => (
        <TableRow key={index} className="border-red-800/30 hover:bg-red-900/30">
          <TableCell className="text-center font-bold">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-500 text-black' :
              index === 1 ? 'bg-gray-400 text-black' :
              index === 2 ? 'bg-amber-700 text-white' :
              'bg-gray-700 text-white'
            }`}>
              {result.position}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <span className="text-xl">{getNationalityFlag(result.Driver.nationality)}</span>
              <span className="font-semibold text-white">
                {result.Driver.givenName} {result.Driver.familyName}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <TeamLogo teamName={result.Constructor.name} />
          </TableCell>
          <TableCell className="text-center font-mono text-sm">
            {result.Time?.time || result.status}
          </TableCell>
          <TableCell className="text-center font-bold text-yellow-400">
            {result.points}
          </TableCell>
          <TableCell className="text-center text-gray-400">
            {result.grid}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default RaceResults;
