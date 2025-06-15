
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Inclui posição
interface TrendData {
  driverId: string;
  name: string;
  position: number;
  nationality: string;
  constructor: string;
  pointsProgression: number[];
  trend: 'up' | 'down' | 'stable';
  consistency: number;
  winRate: number;
}

const fetchTrendsData = async (): Promise<TrendData[]> => {
  // Simulação ampliada para top 6 pilotos
  const mockTrends: TrendData[] = [
    {
      driverId: "verstappen",
      name: "Max Verstappen",
      position: 1,
      nationality: "Dutch", 
      constructor: "Red Bull",
      pointsProgression: [22, 45, 71, 98, 125, 148, 165],
      trend: 'down',
      consistency: 90,
      winRate: 20
    },
    {
      driverId: "norris",
      name: "Lando Norris", 
      position: 2,
      nationality: "British",
      constructor: "McLaren",
      pointsProgression: [18, 42, 68, 95, 128, 156, 179],
      trend: 'up',
      consistency: 82,
      winRate: 12
    },
    {
      driverId: "piastri",
      name: "Oscar Piastri",
      position: 3,
      nationality: "Australian",
      constructor: "McLaren",
      pointsProgression: [25, 43, 78, 112, 145, 168, 186],
      trend: 'up',
      consistency: 85,
      winRate: 15
    },
    {
      driverId: "leclerc",
      name: "Charles Leclerc",
      position: 4,
      nationality: "Monegasque",
      constructor: "Ferrari",
      pointsProgression: [21, 37, 63, 92, 122, 147, 170],
      trend: 'up',
      consistency: 80,
      winRate: 10
    },
    {
      driverId: "sainz",
      name: "Carlos Sainz",
      position: 5,
      nationality: "Spanish",
      constructor: "Ferrari",
      pointsProgression: [19, 36, 61, 90, 116, 138, 152],
      trend: 'stable',
      consistency: 76,
      winRate: 7
    },
    {
      driverId: "perez",
      name: "Sergio Pérez",
      position: 6,
      nationality: "Mexican",
      constructor: "Red Bull",
      pointsProgression: [15, 32, 56, 79, 97, 123, 134],
      trend: 'down',
      consistency: 73,
      winRate: 4
    }
  ];
  
  return mockTrends;
};

const TrendsAnalysis = () => {
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['trendsData'],
    queryFn: fetchTrendsData,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-red-800/30 p-8">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Carregando tendências...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-red-800/30 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
          <BarChart3 className="mr-3 h-6 w-6 text-red-500" />
          Análise de Tendências - Top 6 Pilotos no Campeonato
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendsData?.slice(0, 6).map((driver) => (
            <Card key={driver.driverId} className="bg-white border-red-800/30 shadow">
              <CardHeader className="pb-3 flex flex-col gap-1">
                <CardTitle className="text-gray-900 flex items-center justify-between space-x-3">
                  <span className="text-sm"><b className="text-red-700">#{driver.position}</b> {driver.name}</span>
                  <div className="flex items-center">
                    {driver.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {driver.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {driver.trend === 'stable' && <Activity className="w-4 h-4 text-yellow-400" />}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Consistência</span>
                    <span className="text-gray-900">{driver.consistency}%</span>
                  </div>
                  <Progress value={driver.consistency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Taxa de Vitória</span>
                    <span className="text-gray-900">{driver.winRate}%</span>
                  </div>
                  <Progress value={driver.winRate} className="h-2" />
                </div>
                <div className="text-xs text-gray-600">
                  Equipe: {driver.constructor}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsAnalysis;
