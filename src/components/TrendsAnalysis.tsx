
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TrendData {
  driverId: string;
  name: string;
  nationality: string;
  constructor: string;
  pointsProgression: number[];
  trend: 'up' | 'down' | 'stable';
  consistency: number;
  winRate: number;
}

const fetchTrendsData = async (): Promise<TrendData[]> => {
  // Simulando dados de tendências baseados em dados históricos
  const mockTrends: TrendData[] = [
    {
      driverId: "piastri",
      name: "Oscar Piastri",
      nationality: "Australian",
      constructor: "McLaren",
      pointsProgression: [25, 43, 78, 112, 145, 168, 186],
      trend: 'up',
      consistency: 85,
      winRate: 15
    },
    {
      driverId: "norris",
      name: "Lando Norris", 
      nationality: "British",
      constructor: "McLaren",
      pointsProgression: [18, 42, 68, 95, 128, 156, 179],
      trend: 'up',
      consistency: 82,
      winRate: 12
    },
    {
      driverId: "verstappen",
      name: "Max Verstappen",
      nationality: "Dutch", 
      constructor: "Red Bull",
      pointsProgression: [22, 45, 71, 98, 125, 148, 165],
      trend: 'down',
      consistency: 90,
      winRate: 20
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
      <div className="bg-gray-900 rounded-xl border border-red-800/30 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Carregando tendências...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl border border-red-800/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="mr-3 h-6 w-6 text-red-500" />
          Análise de Tendências
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendsData?.map((driver) => (
            <Card key={driver.driverId} className="bg-black/40 border-red-800/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="text-sm">{driver.name}</span>
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
                    <span className="text-gray-300">Consistência</span>
                    <span className="text-white">{driver.consistency}%</span>
                  </div>
                  <Progress value={driver.consistency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Taxa de Vitória</span>
                    <span className="text-white">{driver.winRate}%</span>
                  </div>
                  <Progress value={driver.winRate} className="h-2" />
                </div>
                <div className="text-xs text-gray-400">
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
