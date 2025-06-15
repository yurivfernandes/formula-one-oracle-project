
import TeamLogo from "@/components/TeamLogo";

interface DriverType {
  id: string;
  position: number;
  name: string;
  team: string;
  country: string;
  qualyRow?: any;
}

interface LiveTimingTableProps {
  raceStatus: "before" | "live" | "after";
  drivers: DriverType[];
  lapTimes: Record<string, string[]>;
  visibleLapRange: [number, number];
  totalLaps: number;
}

export default function LiveTimingTable({
  raceStatus, drivers, lapTimes, visibleLapRange, totalLaps
}: LiveTimingTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-16">Pos</th>
              <th className={`px-2 py-2 font-semibold w-28 text-left`}>Piloto</th>
              <th className={`px-1 py-2 font-semibold w-24 text-left`}>Equipe</th>
              {/* Cabeçalho das voltas */}
              {raceStatus === "live" && totalLaps > 0 &&
                Array.from({ length: visibleLapRange[1] - visibleLapRange[0] }, (_, i) => (
                  <th
                    key={visibleLapRange[0] + i + 1}
                    className="px-2 py-2 text-center font-semibold w-20 text-xs"
                  >
                    {`L${visibleLapRange[0] + i + 1}`}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {/* Antes da corrida: grid do qualifying */}
            {raceStatus === "before" && drivers.map((driver, index) => (
              <tr
                key={driver.id}
                className={`border-b ${index < 10 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50`}
              >
                <td className="px-3 py-2 font-bold text-gray-900">{driver.position}</td>
                <td className="px-2 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{driver.country}</span>
                    <span className="font-mono font-semibold text-red-700 text-base">{driver.id}</span>
                  </div>
                  <span className="block text-xs text-gray-600">{driver.name}</span>
                </td>
                <td className="py-2 w-24 text-left">
                  <div className="flex items-center gap-2">
                    <TeamLogo teamName={driver.team} className="w-7 h-5" />
                    <span className="font-semibold">{driver.team}</span>
                  </div>
                </td>
              </tr>
            ))}
            {/* Durante a corrida: posição atual + tempos de volta */}
            {raceStatus === "live" && drivers.map((driver, index) => (
              <tr
                key={driver.id}
                className={`border-b ${index < 10 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50`}
              >
                <td className="px-3 py-2 font-bold text-gray-900">{driver.position}</td>
                <td className="px-2 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{driver.country}</span>
                    <span className="font-mono font-semibold text-red-700 text-base">{driver.id}</span>
                  </div>
                  <span className="block text-xs text-gray-600">{driver.name}</span>
                </td>
                <td className="py-2 w-24 text-left">
                  <div className="flex items-center gap-2">
                    <TeamLogo teamName={driver.team} className="w-7 h-5" />
                    <span className="font-semibold">{driver.team}</span>
                  </div>
                </td>
                {/* Tempos de volta */}
                {lapTimes[driver.id]
                  ?.slice(visibleLapRange[0], visibleLapRange[1])
                  .map((time, lapIndex) => (
                    <td
                      key={lapIndex + visibleLapRange[0]}
                      className="px-2 py-2 text-center font-mono text-xs text-gray-800 whitespace-nowrap"
                    >
                      {time}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
