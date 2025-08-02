import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Calendar, Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWeatherData, WeatherData } from "@/services/weather";

interface WeatherInfoProps {
  city: string;
  country: string;
  raceDate: string;
}

const getWeatherIcon = (condition: string, size: string = "w-6 h-6") => {
  const iconClasses = `${size} flex-shrink-0`;
  
  switch (condition) {
    case "sunny":
      return <Sun className={`${iconClasses} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${iconClasses} text-gray-500`} />;
    case "rainy":
      return <CloudRain className={`${iconClasses} text-blue-500`} />;
    case "snowy":
      return <Snowflake className={`${iconClasses} text-blue-300`} />;
    case "partly-cloudy":
    default:
      return <Cloud className={`${iconClasses} text-gray-400`} />;
  }
};

const WeatherInfo = ({ city, country, raceDate }: WeatherInfoProps) => {
  const { data: weatherDays, isLoading } = useQuery({
    queryKey: ["weather", city, country],
    queryFn: () => fetchWeatherData(city, country),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2, // Tenta novamente 2 vezes em caso de erro
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Previsão do Tempo</h3>
              <p className="text-sm text-gray-600">{city}, {country}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherDays) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-800">Previsão do Tempo</h3>
            <p className="text-sm text-gray-600">{city}, {country}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {weatherDays.map((day, index) => (
            <div key={index} className="bg-white/70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <h4 className="font-semibold text-gray-800">{day.day}</h4>
                    <p className="text-sm text-gray-600">{day.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="text-2xl font-bold text-gray-800">{day.temperature}°C</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.temperatureMin}°C - {day.temperatureMax}°C
                  </div>
                  <p className="text-sm text-gray-600">{day.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600">Umidade</p>
                  <p className="text-sm font-semibold text-gray-800">{day.humidity}%</p>
                </div>
                
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Wind className="w-3 h-3 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-600">Vento</p>
                  <p className="text-sm font-semibold text-gray-800">{day.windSpeed} km/h</p>
                </div>
                
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CloudRain className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Chuva</p>
                  <p className="text-sm font-semibold text-gray-800">{day.chanceOfRain}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherInfo;
