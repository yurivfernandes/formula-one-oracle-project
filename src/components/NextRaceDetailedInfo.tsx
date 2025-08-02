import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Award, MapPin, Zap, Thermometer, Cloud, CloudRain, Sun, Snowflake, Wind, Droplets } from "lucide-react";
import { format, parseISO, isAfter, isBefore, addHours, subHours } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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
  return circuitToCityMap[circuitName] || "Montreal"; // Default para Montreal
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

const fetchSprints = async () => {
  // Importar rounds de sprint do JSON centralizado
  const sprintRoundsJson = await import("../data/sprint-rounds-2025.json");
  return sprintRoundsJson.default.map((item: { round: number }) => ({ round: item.round.toString() }));
};

const fetchSchedule = async (round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0];
};

const NextRaceDetailedInfo = ({ hero }: { hero?: boolean }) => {
  // All hooks must be called at the top level
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });
  
  const { data: sprints, isLoading: loadingSprints } = useQuery({
    queryKey: ["sprintRaces", 2025],
    queryFn: fetchSprints,
  });

  // Find next race first
  const now = new Date();
  const nextRaceObj = races?.find((race: any) => {
    const dt = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
    return dt >= now;
  });

  // This hook must always be called, but only enabled when we have a next race
  const { data: nextRaceFull, isLoading: loadingSchedule } = useQuery({
    queryKey: ["raceSchedule", nextRaceObj?.round],
    queryFn: () => fetchSchedule(nextRaceObj.round),
    enabled: Boolean(nextRaceObj),
  });

  // Busca dados meteorológicos para o próximo GP
  const weatherCity = nextRaceObj ? getCityFromCircuit(nextRaceObj.Circuit.circuitName) : null;
  const raceDateTime = nextRaceObj?.date && nextRaceObj?.time 
    ? `${nextRaceObj.date}T${nextRaceObj.time}` 
    : undefined;
    
  const { data: weatherDays, isLoading: loadingWeather } = useQuery({
    queryKey: ["weather", weatherCity, nextRaceObj?.Circuit.Location.country, raceDateTime],
    queryFn: () => fetchWeatherData(weatherCity!, nextRaceObj?.Circuit.Location.country || "", raceDateTime),
    enabled: Boolean(nextRaceObj && weatherCity),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });

  // Now handle loading states and early returns
  if (loadingRaces || loadingSprints) {
    return <Skeleton className="h-40 w-full bg-black/30 rounded-xl mb-8" />;
  }

  if (!nextRaceObj) {
    return (
      <div className="bg-gradient-to-r from-red-900/40 to-black/60 border border-red-500/30 rounded-xl px-5 py-6 text-center text-white font-semibold mb-6">
        🏁 Temporada finalizada
      </div>
    );
  }

  // Cálculo pontos restantes
  const currentRoundNum = parseInt(nextRaceObj.round);
  const racesLeft = races?.filter((race: any) => parseInt(race.round) >= currentRoundNum).length ?? 0;
  const sprintsLeft = sprints?.filter((s: any) => parseInt(s.round) >= currentRoundNum).length ?? 0;
  const pontosGrandPrix = racesLeft * 25;
  const pontosSprint = sprintsLeft * 8;
  const pontosPilotos = pontosGrandPrix + pontosSprint;
  const pontosConstrutores = racesLeft * (25 + 18) + sprintsLeft * (8 + 7);

  // Função para mostrar data/hora no fuso de Brasília
  const formatDateTime = (date: string, time: string | undefined) => {
    try {
      if (!date) return "-";
      let iso = date;
      if (time) iso += "T" + time;
      const d = parseISO(iso);
      return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  // Criar array de sessões com horários
  const sessions: { label: string, dt: string, dateObj: Date | null, isNext: boolean }[] = [];
  if (nextRaceFull) {
    const addSession = (label: string, date: string, time: string | undefined) => {
      const dt = formatDateTime(date, time);
      let dateObj = null;
      try {
        let iso = date;
        if (time) iso += "T" + time;
        dateObj = parseISO(iso);
      } catch {}
      sessions.push({ label, dt, dateObj, isNext: false });
    };

    if (nextRaceFull.FirstPractice)
      addSession("Treino Livre 1", nextRaceFull.FirstPractice.date, nextRaceFull.FirstPractice.time);
    if (nextRaceFull.SecondPractice)
      addSession("Treino Livre 2", nextRaceFull.SecondPractice.date, nextRaceFull.SecondPractice.time);
    if (nextRaceFull.ThirdPractice)
      addSession("Treino Livre 3", nextRaceFull.ThirdPractice.date, nextRaceFull.ThirdPractice.time);
    if (nextRaceFull.Sprint)
      addSession("Sprint", nextRaceFull.Sprint.date, nextRaceFull.Sprint.time);
    if (nextRaceFull.Qualifying)
      addSession("Classificação", nextRaceFull.Qualifying.date, nextRaceFull.Qualifying.time);
    if (nextRaceFull.date && nextRaceFull.time)
      addSession("Corrida", nextRaceFull.date, nextRaceFull.time);

    // Determinar próxima sessão
    const currentTime = new Date();
    let nextSessionFound = false;
    for (const session of sessions) {
      if (session.dateObj && isAfter(session.dateObj, currentTime) && !nextSessionFound) {
        session.isNext = true;
        nextSessionFound = true;
      }
    }
  }

  const proxima = {
    nome: getGPNamePTBR(nextRaceObj.raceName),
    pais: getCountryPTBR(nextRaceObj.Circuit.Location.country),
    data: format(parseISO(nextRaceObj.date), "PPP", { locale: ptBR }),
    hora: nextRaceObj.time ? formatDateTime(nextRaceObj.date, nextRaceObj.time) : "-",
    circuito: nextRaceObj.Circuit.circuitName
  };

  const nextSession = sessions.find(s => s.isNext);

  // Get date/time for race
  const raceStart = nextRaceObj?.date && nextRaceObj?.time
    ? parseISO(`${nextRaceObj.date}T${nextRaceObj.time}`)
    : null;

  // Calcula se está dentro da janela Live Timing (1h antes)
  let liveTimingShow = false;
  if (raceStart) {
    const oneHourBeforeStart = subHours(raceStart, 1);
    const raceEnd = addHours(raceStart, 2);
    liveTimingShow = now >= oneHourBeforeStart && now <= raceEnd;
  }

  // GP Canadá 2025: 15/jun/2025 15:00 Brasil — UTC "2025-06-15T18:00:00Z"
  const nextRaceStart = new Date("2025-06-15T18:00:00Z");
  const nextRaceEnd = new Date("2025-06-15T20:00:00Z");
  const nowForLiveTiming = new Date();
  const liveTimingAvailable = nowForLiveTiming >= nextRaceStart && nowForLiveTiming <= nextRaceEnd;

  // HERO SECTION
  if (hero) {
    return (
      <div
        className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl bg-white border border-red-200 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10 p-8">
          {/* GP e país -- bandeira ao lado do nome, compacto */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">{proxima.pais.flag}</span>
              <span className="text-2xl text-red-700 font-semibold">{proxima.nome}</span>
            </div>
            <span className="text-md text-gray-600 font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4 text-red-400" /> {proxima.circuito}
            </span>
            <div className="flex items-center gap-2 mt-3">
              <CalendarDays className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">{proxima.data}</span>
            </div>
            {/* Botão Live Timing só aparece a partir de 1h antes */}
            {liveTimingShow && (
              <a
                href="/race-weekend/live"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-green-100 text-green-800 border border-green-300 font-semibold shadow hover:bg-green-200 transition"
              >
                <Zap className="w-4 h-4 text-green-700 animate-pulse" />
                Live Timing
              </a>
            )}
          </div>
          {/* Próxima sessão com visual branco e detalhes leves */}
          {nextSession && (
            <div className="bg-white border-2 border-yellow-400 rounded-xl px-8 py-7 shadow flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                <span className="text-yellow-600 font-bold text-lg">PRÓXIMA SESSÃO</span>
              </div>
              <div className="text-red-700 font-bold text-xl">{nextSession.label}</div>
              <div className="flex items-center gap-2 text-yellow-700 text-lg font-semibold">
                <Clock className="w-5 h-5" />
                {nextSession.dt}
              </div>
            </div>
          )}
        </div>
        {/* Colapsável: Cronograma */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-3 text-lg font-bold text-red-700 bg-white hover:bg-gray-100 transition rounded-none border-t border-red-200">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" /> Cronograma Completo
            </span>
            <ChevronDown className="w-5 h-5 text-red-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 py-4 bg-white border-x border-b border-red-200 rounded-b-xl">
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                    session.isNext
                      ? "bg-yellow-50 border border-yellow-200 shadow"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <span className={`font-semibold flex gap-2 items-center ${session.isNext ? 'text-yellow-700' : 'text-red-700'}`}>
                    {session.isNext && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                    {session.label}
                  </span>
                  <span className={`font-mono text-sm font-semibold ${session.isNext ? 'text-yellow-800' : 'text-gray-800'}`}>
                    {session.dt}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>



        {/* Colapsável: Pontos Restantes */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-3 text-lg font-bold text-red-700 bg-white hover:bg-gray-100 transition rounded-none border-t border-red-200">
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Pontos Restantes
            </span>
            <ChevronDown className="w-5 h-5 text-red-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-6 bg-white border-x border-b border-red-200 rounded-b-xl">
            <div className="space-y-4 pt-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-yellow-700 font-bold text-lg">Campeonato de Pilotos</span>
                  <span className="text-3xl font-bold text-yellow-800">{pontosPilotos}</span>
                </div>
                <p className="text-xs text-yellow-700">
                  {racesLeft} corridas • {sprintsLeft} sprints restantes
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-bold text-lg">Campeonato de Construtores</span>
                  <span className="text-3xl font-bold text-gray-800">{pontosConstrutores}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {racesLeft} corridas • {sprintsLeft} sprints restantes
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Colapsável: Previsão do Tempo */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-3 text-lg font-bold text-red-700 bg-white hover:bg-gray-100 transition rounded-none border-t border-red-200">
            <span className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-400" /> Previsão do Tempo
            </span>
            <ChevronDown className="w-5 h-5 text-red-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-6 bg-white border-x border-b border-red-200 rounded-b-xl">
            <div className="pt-4">
              {loadingWeather ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : weatherDays ? (
                <div className="space-y-3">
                  {weatherDays.slice(0, 3).map((day: WeatherData, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
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
                          <p className="text-sm text-gray-600">{day.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  <p>Dados meteorológicos indisponíveis no momento</p>
                  <p className="text-sm text-gray-500 mt-1">Cidade: {weatherCity}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Componente padrão para exibir seção detalhada (melhor fundo p/ próxima corrida)
  return (
    <div className="mb-8">
      <Card className="bg-white border border-red-200 shadow-xl">
        <CardContent className="p-8">
          {/* Header principal */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full border border-red-200">
                  <CalendarDays className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-700 mb-2">
                    Próxima Corrida
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{proxima.pais.flag}</span>
                    <div>
                      <p className="text-2xl font-bold text-red-700 mb-1">{proxima.nome}</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{proxima.circuito}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Área da direita: Próxima sessão + Pontos restantes */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Próxima sessão */}
              {nextSession && (
                <div className="bg-white border border-yellow-300 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                    <span className="text-yellow-600 font-bold text-lg">PRÓXIMA SESSÃO</span>
                  </div>
                  <div className="text-red-700 font-bold text-xl">{nextSession.label}</div>
                  <div className="flex items-center gap-2 text-yellow-700 text-lg font-semibold">
                    <Clock className="w-5 h-5" />
                    {nextSession.dt}
                  </div>
                </div>
              )}

              {/* Pontos restantes compactos */}
              <div className="flex flex-col gap-3">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-700 font-bold text-sm">Campeonato de Pilotos</span>
                    <span className="text-2xl font-bold text-yellow-800">{pontosPilotos}</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    {racesLeft} corridas • {sprintsLeft} sprints restantes
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-bold text-sm">Campeonato de Construtores</span>
                    <span className="text-2xl font-bold text-gray-800">{pontosConstrutores}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {racesLeft} corridas • {sprintsLeft} sprints restantes
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid de cronograma */}
          <div className="grid lg:grid-cols-1 gap-8">
            {/* Cronograma completo */}
            <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
              <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-red-400" />
                Cronograma Completo
              </h3>
              {loadingSchedule ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <Skeleton key={i} className="h-12 w-full bg-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-all duration-300 ${
                        session.isNext 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {session.isNext && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
                        <span className={`font-semibold ${session.isNext ? 'text-yellow-700' : 'text-gray-700'}`}>
                          {session.label}
                        </span>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${session.isNext ? 'text-yellow-800' : 'text-red-500'}`}>
                        {session.dt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NextRaceDetailedInfo;
