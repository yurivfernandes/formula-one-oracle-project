
import { Zap, Wifi } from "lucide-react";

interface LiveTimingHeaderProps {
  gpName: string;
  raceStatus: "before" | "live" | "after";
  localStartTime: string;
}

export default function LiveTimingHeader({ gpName, raceStatus, localStartTime }: LiveTimingHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-3">
        <Zap className="w-7 h-7 animate-pulse" />
        Live Timing — {gpName}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span>
          <Wifi className="w-4 h-4 text-green-500 inline" />{" "}
          <span className="text-green-700">Conectado à API Ergast</span>
        </span>
        <span>
          {raceStatus === "before" && (
            <>Corrida começa às <b>{localStartTime}</b></>
          )}
          {raceStatus === "live" && (
            <>Corrida em andamento · Atualizando automaticamente</>
          )}
        </span>
      </div>
    </div>
  );
}
