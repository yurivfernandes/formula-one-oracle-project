import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Thermometer, Cloud, CloudRain, Sun, Snowflake, Wind, Droplets } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWeatherData, WeatherData } from "@/services/weather";

// Tradução de países e bandeiras
const countryPTBR: { [key: string]: { nome: string; flag: string } } = {
  "Australia": { nome: "Austrália", flag: "🇦🇺" },
  "China": { nome: "China", flag: "🇨🇳" },
  "Japan": { nome: "Japão", flag: "🇯🇵" },
  "Bahrain": { nome: "Bahrein", flag: "🇧🇭" },
  "Saudi Arabia": { nome: "Arábia Saudita", flag: "🇸🇦" },
  "USA": { nome: "Estados Unidos", flag: "🇺🇸" },
  "Italy": { nome: "Itália", flag: "🇮🇹" },
  "Monaco": { nome: "Mônaco", flag: "🇲🇨" },
  "Spain": { nome: "Espanha", flag: "🇪🇸" },
  "Canada": { nome: "Canadá", flag: "🇨🇦" },
  "Austria": { nome: "Áustria", flag: "🇦🇹" },
  "UK": { nome: "Reino Unido", flag: "🇬🇧" },
  "Hungary": { nome: "Hungria", flag: "🇭🇺" },
  "Belgium": { nome: "Bélgica", flag: "🇧🇪" },
  "Netherlands": { nome: "Holanda", flag: "🇳🇱" },
  "Azerbaijan": { nome: "Azerbaijão", flag: "🇦🇿" },
  "Singapore": { nome: "Singapura", flag: "🇸🇬" },
  "Mexico": { nome: "México", flag: "🇲🇽" },
  "Brazil": { nome: "Brasil", flag: "🇧🇷" },
  "Qatar": { nome: "Catar", flag: "🇶🇦" },
  "United Arab Emirates": { nome: "Abu Dhabi", flag: "🇦🇪" },
  "Las Vegas": { nome: "Las Vegas", flag: "🎲" },
};

// Tradução dos nomes dos GPs para português brasileiro
const gpNamesPTBR: { [key: string]: string } = {
  "Australian Grand Prix": "GP da Austrália",
  "Chinese Grand Prix": "GP da China",
  "Japanese Grand Prix": "GP do Japão",
  "Bahrain Grand Prix": "GP do Bahrein",
  "Saudi Arabian Grand Prix": "GP da Arábia Saudita",
  "Miami Grand Prix": "GP de Miami",
  "Emilia Romagna Grand Prix": "GP da Emília-Romanha",
  "Monaco Grand Prix": "GP de Mônaco",
  "Spanish Grand Prix": "GP da Espanha",
  "Canadian Grand Prix": "GP do Canadá",
  "Austrian Grand Prix": "GP da Áustria",
  "British Grand Prix": "GP da Grã-Bretanha",
  "Hungarian Grand Prix": "GP da Hungria",
  "Belgian Grand Prix": "GP da Bélgica",
  "Dutch Grand Prix": "GP da Holanda",
  "Italian Grand Prix": "GP da Itália",
  "Azerbaijan Grand Prix": "GP do Azerbaijão",
  "Singapore Grand Prix": "GP de Singapura",
  "United States Grand Prix": "GP dos Estados Unidos",
  "Mexico City Grand Prix": "GP do México",
  "São Paulo Grand Prix": "GP de São Paulo",
  "Las Vegas Grand Prix": "GP de Las Vegas",
  "Qatar Grand Prix": "GP do Catar",
  "Abu Dhabi Grand Prix": "GP de Abu Dhabi"
};

// Mapeamento de circuitos para cidades meteorológicas
const circuitToCityMap: { [key: string]: string } = {
  "Albert Park Grand Prix Circuit": "Melbourne",
  "Shanghai International Circuit": "Shanghai",
  "Suzuka Circuit": "Suzuka",
  "Bahrain International Circuit": "Sakhir",
  "Jeddah Corniche Circuit": "Jeddah",
  "Miami International Autodrome": "Miami",
  "Autodromo Enzo e Dino Ferrari": "Imola",
  "Circuit de Monaco": "Monte-Carlo",
  "Circuit de Barcelona-Catalunya": "Barcelona",
  "Circuit Gilles Villeneuve": "Montreal",
  "Red Bull Ring": "Spielberg",
  "Silverstone Circuit": "Silverstone",
  "Hungaroring": "Budapest",
  "Circuit de Spa-Francorchamps": "Spa-Francorchamps",
  "Circuit Zandvoort": "Zandvoort",
  "Autodromo Nazionale di Monza": "Monza",
  "Baku City Circuit": "Baku",
  "Marina Bay Street Circuit": "Singapore",
  "Circuit of the Americas": "Austin",
  "Autódromo Hermanos Rodríguez": "Mexico City",
  "Autodromo Jose Carlos Pace": "São Paulo",
  "Las Vegas Strip Circuit": "Las Vegas",
  "Lusail International Circuit": "Lusail",
  "Yas Marina Circuit": "Abu Dhabi"
};

const getCountryPTBR = (country: string) =>
  countryPTBR[country] || { nome: country, flag: "🏁" };

const getGPNamePTBR = (raceName: string) =>
  gpNamesPTBR[raceName] || raceName;

const getCityFromCircuit = (circuitName: string): string => {
  return circuitToCityMap[circuitName] || "Montreal"; // Default para Montreal (GP do Canadá)
};

const getWeatherIcon = (condition: string, size: string = "w-5 h-5") => {
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

const fetchRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const NextRaceWithWeather = () => {
  // Busca informações das corridas
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });

  // Encontra a próxima corrida
  const now = new Date();
  const nextRaceObj = races?.find((race: any) => {
    const dt = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
    return dt >= now;
  });

  // Determina a cidade para buscar dados meteorológicos
  const weatherCity = nextRaceObj ? getCityFromCircuit(nextRaceObj.Circuit.circuitName) : "Montreal";

  // Busca dados meteorológicos
  const { data: weatherDays, isLoading: loadingWeather, error: weatherError } = useQuery({
    queryKey: ["weather", weatherCity, nextRaceObj?.Circuit.Location.country, nextRaceObj?.round],
    queryFn: () => fetchWeatherData(
      weatherCity, 
      nextRaceObj?.Circuit.Location.country || "",
      nextRaceObj?.date && nextRaceObj?.time ? `${nextRaceObj.date}T${nextRaceObj.time}` : undefined,
      nextRaceObj // Passa dados básicos da corrida
    ),
    enabled: Boolean(nextRaceObj),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
  });

  if (loadingRaces) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-blue-50 border-red-200">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!nextRaceObj) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-700 mb-2">🏁 Temporada Finalizada</h3>
          <p className="text-gray-600">Não há mais corridas programadas para esta temporada.</p>
        </CardContent>
      </Card>
    );
  }

  const proxima = {
    nome: getGPNamePTBR(nextRaceObj.raceName),
    pais: getCountryPTBR(nextRaceObj.Circuit.Location.country),
    data: format(parseISO(nextRaceObj.date), "PPP", { locale: ptBR }),
    circuito: nextRaceObj.Circuit.circuitName,
    cidade: nextRaceObj.Circuit.Location.locality
  };

  return (
    <Card className="bg-gradient-to-br from-red-50 via-white to-blue-50 border-red-200 shadow-lg">
      <CardContent className="p-6">
        {/* Header do próximo GP */}
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-xl font-bold text-red-700">Próximo GP</h3>
            <p className="text-sm text-gray-600">Dados em tempo real</p>
          </div>
        </div>

        {/* Informações do GP */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{proxima.pais.flag}</span>
            <div>
              <h4 className="text-2xl font-bold text-red-700">{proxima.nome}</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm">{proxima.cidade}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="font-semibold">{proxima.data}</span>
          </div>
        </div>

        {/* Previsão do tempo */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-bold text-gray-800">Previsão do Tempo</h4>
          </div>

          {loadingWeather ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : weatherError ? (
            <div className="text-center py-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold">⚠️ Dados meteorológicos indisponíveis</p>
              <p className="text-sm text-red-500 mt-1">
                Não foi possível carregar a previsão do tempo para {weatherCity}
              </p>
            </div>
          ) : weatherDays && weatherDays.length > 0 ? (
            <div className="space-y-3">
              {weatherDays.slice(0, 3).map((day: WeatherData, index: number) => (
                <div key={index} className={`rounded-lg p-4 border ${
                  day.condition === 'unavailable' 
                    ? 'bg-gray-50 border-gray-300' 
                    : 'bg-white/70 border-blue-200'
                }`}>
                  {day.condition === 'unavailable' ? (
                    <div className="text-center py-2">
                      <h5 className="font-semibold text-gray-700">{day.day}</h5>
                      <p className="text-sm text-gray-600">{day.date}</p>
                      <p className="text-gray-500 mt-2">📡 {day.description}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getWeatherIcon(day.condition)}
                          <div>
                            <h5 className="font-semibold text-gray-800">{day.day}</h5>
                            <p className="text-sm text-gray-600">{day.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-800">{day.temperature}°C</p>
                          <p className="text-xs text-gray-500">{day.temperatureMin}° - {day.temperatureMax}°</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center bg-white/60 rounded p-2">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-600">Umidade</p>
                          <p className="text-sm font-semibold text-gray-800">{day.humidity}%</p>
                        </div>
                        
                        <div className="text-center bg-white/60 rounded p-2">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Wind className="w-3 h-3 text-green-500" />
                          </div>
                          <p className="text-xs text-gray-600">Vento</p>
                          <p className="text-sm font-semibold text-gray-800">{day.windSpeed} km/h</p>
                        </div>
                        
                        <div className="text-center bg-white/60 rounded p-2">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CloudRain className="w-3 h-3 text-blue-600" />
                          </div>
                          <p className="text-xs text-gray-600">Chuva</p>
                          <p className="text-sm font-semibold text-gray-800">{day.chanceOfRain}%</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : weatherDays && weatherDays.length === 0 ? (
            <div className="text-center py-4 text-orange-600 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold">🏁 Todas as sessões já aconteceram</p>
              <p className="text-sm text-orange-500 mt-1">
                Não há mais sessões com previsão do tempo para este GP
              </p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold">📡 Dados meteorológicos indisponíveis</p>
              <p className="text-sm text-gray-500 mt-1">Cidade: {weatherCity}</p>
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="mt-6 pt-4 border-t border-red-200">
          <a 
            href="/race-weekend" 
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Ver Detalhes Completos do GP
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextRaceWithWeather;
