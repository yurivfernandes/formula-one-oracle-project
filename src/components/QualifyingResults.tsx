
import { useQuery } from "@tanstack/react-query";
import { Clock, Trophy } from "lucide-react";
import StandardTable from "./StandardTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TeamLogo from "./TeamLogo";

interface QualifyingResult {
  position: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructor: {
    name: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface QualifyingResultsProps {
  round: string;
}

const fetchQualifyingResults = async (round: string) => {
  const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/qualifying.json`);
  const data = await response.json();
  return data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
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

const QualifyingResults: React.FC<QualifyingResultsProps> = ({ round }) => {
  const { data: qualifyingResults, isLoading, error } = useQuery({
    queryKey: ['qualifyingResults', round],
    queryFn: () => fetchQualifyingResults(round),
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

  if (error || !qualifyingResults || qualifyingResults.length === 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-8 text-center">
        <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-yellow-400 mb-2">Classificação Ainda Não Realizada</h3>
        <p className="text-yellow-200">Os resultados da classificação aparecerão aqui após a sessão.</p>
      </div>
    );
  }

  return (
    <StandardTable
      title="Grid de Largada"
      subtitle="Resultado da classificação para a corrida"
      headers={["Pos", "Piloto", "Equipe", "Q1", "Q2", "Q3"]}
    >
      {qualifyingResults.map((result: QualifyingResult, index: number) => (
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
            {result.Q1 || "-"}
          </TableCell>
          <TableCell className="text-center font-mono text-sm">
            {result.Q2 || "-"}
          </TableCell>
          <TableCell className="text-center font-mono text-sm">
            {result.Q3 || "-"}
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
  );
};

export default QualifyingResults;
