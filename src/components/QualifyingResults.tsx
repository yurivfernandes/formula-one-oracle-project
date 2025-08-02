
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StandardTable from "./StandardTable";
import { TableRow, TableCell } from "@/components/ui/table";
import TeamLogo from "./TeamLogo";

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
      className="bg-white border border-red-200"
    >
      {results.map((result: any, index: number) => (
        <TableRow
          key={result.Driver.driverId}
          className={`border-red-800/30 hover:bg-red-900/5 transition-colors ${
            index === 0 ? "bg-yellow-50" :
            index === 1 ? "bg-gray-50" :
            index === 2 ? "bg-orange-50" :
            ""
          }`}
        >
          <TableCell className="w-10 sm:w-12">
            <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              index === 0 ? "bg-yellow-500 text-black" :
              index === 1 ? "bg-gray-400 text-black" :
              index === 2 ? "bg-amber-700 text-white" :
              "bg-gray-200 text-gray-900"
            }`}>
              {result.position}
            </span>
          </TableCell>
          <TableCell className="font-semibold min-w-[120px] sm:min-w-[180px]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-xs sm:text-base">{result.Driver.givenName}</span>
              <span className="text-xs sm:text-base sm:ml-1">{result.Driver.familyName}</span>
            </div>
          </TableCell>
          <TableCell className="min-w-[80px] sm:min-w-[120px]">
            <TeamLogo teamName={result.Constructor.name} className="w-8 h-5 sm:w-12 sm:h-8" />
          </TableCell>
          <TableCell className="text-center font-mono text-xs sm:text-sm align-middle">
            <div className="flex justify-center items-center min-h-[24px]">{result.Q1 || "-"}</div>
          </TableCell>
          <TableCell className="text-center font-mono text-xs sm:text-sm align-middle">
            <div className="flex justify-center items-center min-h-[24px]">{result.Q2 || "-"}</div>
          </TableCell>
          <TableCell className="text-center font-mono text-xs sm:text-sm align-middle">
            <div className="flex justify-center items-center min-h-[24px]">{result.Q3 || "-"}</div>
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default QualifyingResults;
