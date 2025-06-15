
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StandardTable from "./StandardTable";
import { TableRow, TableCell } from "@/components/ui/table";

interface QualifyingResultsProps {
  round: string;
}

const fetchQualifyingResults = async (round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/qualifying.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
};

const QualifyingResults = ({ round }: QualifyingResultsProps) => {
  const { data: results, isLoading } = useQuery({
    queryKey: ["qualifying", round],
    queryFn: () => fetchQualifyingResults(round),
  });

  if (isLoading) {
    return (
      <div className="bg-black rounded-xl border border-red-800/70 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-red-800/50 bg-black">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Classificação</h2>
          <p className="text-gray-300">Resultado da sessão classificatória</p>
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
          <h2 className="text-2xl font-bold text-red-500 mb-2">Classificação</h2>
          <p className="text-gray-300">Resultado da sessão classificatória</p>
        </div>
        <div className="p-6 text-center text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Classificação ainda não realizada</p>
        </div>
      </div>
    );
  }

  return (
    <StandardTable
      title="Classificação"
      subtitle="Resultado da sessão classificatória"
      headers={["Pos", "Piloto", "Equipe", "Q1", "Q2", "Q3"]}
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
            {result.Q1 || "-"}
          </TableCell>
          <TableCell className="text-gray-300 font-mono text-sm">
            {result.Q2 || "-"}
          </TableCell>
          <TableCell className="text-gray-300 font-mono text-sm">
            {result.Q3 ? (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                {result.Q3}
              </div>
            ) : "-"}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default QualifyingResults;
