import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Thermometer, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWeatherData, WeatherData } from "@/services/weather";

// Tradução de países e bandeiras
const countryPTBR: { [key: string]: { nome: string; flag: string } } = {
  "Canada": { nome: "Canadá", flag: "🇨🇦" },
  "Spain": { nome: "Espanha", flag: "🇪🇸" },
  "Monaco": { nome: "Mônaco", flag: "🇲🇨" },
  "Azerbaijan": { nome: "Azerbaijão", flag: "🇦🇿" },
  "Austria": { nome: "Áustria", flag: "🇦🇹" },
  "UK": { nome: "Reino Unido", flag: "🇬🇧" },
  "Hungary": { nome: "Hungria", flag: "🇭🇺" },
  "Belgium": { nome: "Bélgica", flag: "🇧🇪" },
  "Netherlands": { nome: "Holanda", flag: "🇳🇱" },
  "Italy": { nome: "Itália", flag: "🇮🇹" },
  "Singapore": { nome: "Singapura", flag: "🇸🇬" },
  "USA": { nome: "Estados Unidos", flag: "🇺🇸" },
  "Mexico": { nome: "México", flag: "🇲🇽" },
  "Brazil": { nome: "Brasil", flag: "🇧🇷" },
  "Qatar": { nome: "Catar", flag: "🇶🇦" },
  "United Arab Emirates": { nome: "Abu Dhabi", flag: "🇦🇪" },
};

// Tradução dos nomes dos GPs
const gpNamesPTBR: { [key: string]: string } = {
  "Canadian Grand Prix": "GP do Canadá",
  "Spanish Grand Prix": "GP da Espanha",
  "Monaco Grand Prix": "GP de Mônaco",
  "Azerbaijan Grand Prix": "GP do Azerbaijão",
  "Austrian Grand Prix": "GP da Áustria",
  "British Grand Prix": "GP da Grã-Bretanha",
  "Hungarian Grand Prix": "GP da Hungria",
  "Belgian Grand Prix": "GP da Bélgica",
  "Dutch Grand Prix": "GP da Holanda",
  "Italian Grand Prix": "GP da Itália",
  "Singapore Grand Prix": "GP de Singapura",
  "United States Grand Prix": "GP dos Estados Unidos",
  "Mexico City Grand Prix": "GP do México",
  "São Paulo Grand Prix": "GP de São Paulo",
  "Qatar Grand Prix": "GP do Catar",
  "Abu Dhabi Grand Prix": "GP de Abu Dhabi"
};

// Mapeamento de circuitos para cidades
const circuitToCityMap: { [key: string]: string } = {
  "Circuit Gilles Villeneuve": "Montreal",
  "Circuit de Barcelona-Catalunya": "Barcelona",
  "Circuit de Monaco": "Monte-Carlo",
  "Baku City Circuit": "Baku",
  "Red Bull Ring": "Spielberg",
  "Silverstone Circuit": "Silverstone",
  "Hungaroring": "Budapest",
  "Circuit de Spa-Francorchamps": "Spa-Francorchamps",
  "Circuit Zandvoort": "Zandvoort",
  "Autodromo Nazionale di Monza": "Monza",
  "Marina Bay Street Circuit": "Singapore",
  "Circuit of the Americas": "Austin",
  "Autódromo Hermanos Rodríguez": "Mexico City",
  "Autodromo Jose Carlos Pace": "São Paulo",
  "Lusail International Circuit": "Lusail",
  "Yas Marina Circuit": "Abu Dhabi"
};

const getCountryPTBR = (country: string) =>
  countryPTBR[country] || { nome: country, flag: "🏁" };

const getGPNamePTBR = (raceName: string) =>
  gpNamesPTBR[raceName] || raceName;

const getCityFromCircuit = (circuitName: string): string => {
  return circuitToCityMap[circuitName] || "Montreal";
};

const fetchRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const NextRaceCompact = () => {
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });

  const now = new Date();
  const nextRaceObj = races?.find((race: any) => {
    const dt = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
    return dt >= now;
  });

  const weatherCity = nextRaceObj ? getCityFromCircuit(nextRaceObj.Circuit.circuitName) : "Montreal";
  const raceDateTime = nextRaceObj?.date && nextRaceObj?.time 
    ? `${nextRaceObj.date}T${nextRaceObj.time}` 
    : undefined;

  const { data: weatherDays, isLoading: loadingWeather } = useQuery({
    queryKey: ["weather", weatherCity, nextRaceObj?.Circuit.Location.country, raceDateTime],
    queryFn: () => fetchWeatherData(weatherCity, nextRaceObj?.Circuit.Location.country || "", raceDateTime),
    enabled: Boolean(nextRaceObj),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  if (loadingRaces) {
    return (
      <Card className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <CardContent className="p-8">
          <Skeleton className="h-6 w-32 mb-2 bg-white/20" />
          <Skeleton className="h-8 w-48 mb-4 bg-white/20" />
          <Skeleton className="h-4 w-40 bg-white/20" />
        </CardContent>
      </Card>
    );
  }

  if (!nextRaceObj) {
    return (
      <Card className="bg-gradient-to-br from-gray-600 to-gray-800 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">🏁 Temporada Finalizada</h3>
          <p>Aguarde a próxima temporada!</p>
        </CardContent>
      </Card>
    );
  }

  const proxima = {
    nome: getGPNamePTBR(nextRaceObj.raceName),
    pais: getCountryPTBR(nextRaceObj.Circuit.Location.country),
    data: format(parseISO(nextRaceObj.date), "dd/MM", { locale: ptBR }),
    cidade: nextRaceObj.Circuit.Location.locality
  };

  const raceWeather = weatherDays?.[2]; // Domingo (corrida)

  return (
    <Card className="bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl hover:shadow-2xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="w-6 h-6" />
          <span className="text-lg font-semibold">Próximo GP</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{proxima.pais.flag}</span>
            <div>
              <h3 className="text-2xl font-bold">{proxima.nome}</h3>
              <div className="flex items-center gap-2 text-red-100">
                <MapPin className="w-4 h-4" />
                <span>{proxima.cidade}</span>
              </div>
            </div>
          </div>
          <div className="text-red-100">
            <span className="font-semibold">{proxima.data}</span>
          </div>
        </div>

        {loadingWeather ? (
          <div className="flex items-center gap-3 mb-6">
            <Thermometer className="w-5 h-5" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
        ) : raceWeather ? (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="w-5 h-5" />
              <span className="font-semibold">Previsão para a Corrida</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-red-100">{raceWeather.description}</span>
                <span className="text-xl font-bold">{raceWeather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-red-100">
                <span>💧 {raceWeather.chanceOfRain}%</span>
                <span>💨 {raceWeather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="/race-weekend" 
            className="flex-1 bg-white/20 hover:bg-white/30 text-center py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Ver Detalhes
          </a>
          <a 
            href="/championship" 
            className="flex-1 bg-white text-red-600 hover:bg-red-50 text-center py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Campeonato
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextRaceCompact;
