
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StandardTable from "./StandardTable";
import { TableRow, TableCell } from "@/components/ui/table";

interface RaceResultsProps {
  round: string;
}

const fetchRaceResults = async (round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/results.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.Results || [];
};

const RaceResults = ({ round }: RaceResultsProps) => {
  const { data: results, isLoading } = useQuery({
    queryKey: ["raceResults", round],
    queryFn: () => fetchRaceResults(round),
  });

  if (isLoading) {
    return (
      <div className="bg-black rounded-xl border border-red-800/70 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/50 bg-black">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Resultado da Corrida</h2>
          <p className="text-gray-300">Classificação final da corrida</p>
        </div>
        <div className="p-6">
          <Skeleton className="h-80 w-full bg-red-900/20" />
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-black rounded-xl border border-red-800/70 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/50 bg-black">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Resultado da Corrida</h2>
          <p className="text-gray-300">Classificação final da corrida</p>
        </div>
        <div className="p-6 text-center text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Corrida ainda não realizada</p>
        </div>
      </div>
    );
  }

  return (
    <StandardTable
      title="Resultado da Corrida"
      subtitle="Classificação final da corrida"
      headers={["Pos", "Piloto", "Equipe", "Tempo/Status", "Pts", "Volta Mais Rápida"]}
    >
      {results.map((result: any, index: number) => (
        <TableRow 
          key={result.Driver.driverId}
          className={`border-red-800/30 hover:bg-red-900/20 ${
            index < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''
          }`}
        >
          <TableCell className="font-bold text-white flex items-center gap-2">
            {result.position}
            {index === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
            {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
            {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
          </TableCell>
          <TableCell>
            <div className="text-white">
              <div className="font-semibold">
                {result.Driver.givenName} {result.Driver.familyName}
              </div>
              <div className="text-xs text-gray-400">
                #{result.number} • {result.Driver.code}
              </div>
            </div>
          </TableCell>
          <TableCell className="text-red-400 font-medium">
            {result.Constructor.name}
          </TableCell>
          <TableCell className="text-gray-300 font-mono text-sm">
            {result.Time?.time || result.status}
          </TableCell>
          <TableCell className="text-yellow-400 font-bold">
            {result.points}
          </TableCell>
          <TableCell className="text-gray-300 font-mono text-sm">
            {result.FastestLap ? (
              <div className="flex items-center gap-1">
                {result.FastestLap.rank === "1" && <Zap className="h-3 w-3 text-purple-400" />}
                {result.FastestLap.Time.time}
                {result.FastestLap.rank === "1" && (
                  <span className="text-purple-400 text-xs ml-1">VR</span>
                )}
              </div>
            ) : "-"}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default RaceResults;
