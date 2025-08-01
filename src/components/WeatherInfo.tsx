import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DayWeather {
  day: string;
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  chanceOfRain: number;
}

interface WeatherInfoProps {
  city: string;
  country: string;
  raceDate: string;
}

// Simulação de dados meteorológicos para os 3 dias
const fetchWeatherData = async (city: string, country: string): Promise<DayWeather[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const days = [
        { day: "Sexta-feira", date: "14/06" },
        { day: "Sábado", date: "15/06" },
        { day: "Domingo", date: "16/06" }
      ];
      
      const weatherData = days.map(day => ({
        ...day,
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        condition: Math.random() > 0.7 ? "cloudy" : Math.random() > 0.5 ? "sunny" : "partly-cloudy",
        description: Math.random() > 0.7 ? "Nublado" : Math.random() > 0.5 ? "Ensolarado" : "Parcialmente nublado",
        chanceOfRain: Math.floor(Math.random() * 60) + 10 // 10-70%
      }));
      
      resolve(weatherData);
    }, 500);
  });
};

const getWeatherIcon = (condition: string, size: string = "w-6 h-6") => {
  const iconClasses = `${size} flex-shrink-0`;
  
  switch (condition) {
    case "sunny":
      return <Sun className={`${iconClasses} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${iconClasses} text-gray-500`} />;
    case "rainy":
      return <CloudRain className={`${iconClasses} text-blue-500`} />;
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
                  <p className="text-2xl font-bold text-gray-800">{day.temperature}°C</p>
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
