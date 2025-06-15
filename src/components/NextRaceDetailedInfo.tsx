import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Award, MapPin, Zap } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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

const getCountryPTBR = (country: string) =>
  countryPTBR[country] || { nome: country, flag: "🏁" };

const getGPNamePTBR = (raceName: string) =>
  gpNamesPTBR[raceName] || raceName;

const fetchRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const fetchSprints = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/sprint/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const fetchSchedule = async (round: string) => {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}.json`);
  const data = await res.json();
  return data.MRData.RaceTable.Races[0];
};

const CURRENT_ROUND = 10;

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
  const currentRoundNum = parseInt(nextRaceObj.round ?? CURRENT_ROUND + 1);
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

  // GP Canadá 2025: 15/jun/2025 15:00 Brasil — UTC "2025-06-15T18:00:00Z"
  const nextRaceStart = new Date("2025-06-15T18:00:00Z");
  const nextRaceEnd = new Date("2025-06-15T20:00:00Z");
  const now = new Date();
  const liveTimingAvailable = now >= nextRaceStart && now <= nextRaceEnd;

  // HERO SECTION
  if (hero) {
    return (
      <div
        className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl bg-white border border-red-200 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10 p-8">
          {/* GP e país */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2">
            <span className="text-5xl mb-2">
              {proxima.pais.flag}
            </span>
            <span className="text-2xl text-red-700 font-semibold">{proxima.nome}</span>
            <span className="text-md text-gray-600 font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4 text-red-400" /> {proxima.circuito}
            </span>
            <div className="flex items-center gap-2 mt-3">
              <CalendarDays className="w-5 h-5 text-red-500" />
              <span className="text-gray-700">{proxima.data}</span>
            </div>
            {/* Botão Live Timing na home */}
            {liveTimingAvailable && (
              <a
                href="/race-weekend/live"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-green-100 text-green-800 border border-green-300 font-semibold shadow hover:bg-green-200 transition"
              >
                <Zap className="w-4 h-4 text-green-700 animate-pulse" />
                Live Timing
              </a>
            )}
          </div>
          {/* Proxima sessão com visual melhorado */}
          {nextSession && (
            <div className="bg-gradient-to-br from-red-100 via-yellow-50 to-white border-2 border-yellow-300 rounded-xl px-8 py-7 shadow-xl flex flex-col items-center">
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
          <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-3 text-lg font-bold text-red-200 bg-black/30 hover:bg-red-900/30 transition rounded-none border-t border-red-900/30">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" /> Cronograma Completo
            </span>
            <ChevronDown className="w-5 h-5 text-red-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 py-4">
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                    session.isNext
                      ? "bg-gradient-to-r from-red-600/40 to-yellow-100/10 border border-red-400/60 shadow-lg shadow-red-500/10"
                      : "bg-black/30 border border-red-800/30 hover:bg-black/40"
                  }`}
                >
                  <span className={`font-semibold flex gap-2 items-center ${session.isNext ? 'text-yellow-400' : 'text-white'}`}>
                    {session.isNext && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                    {session.label}
                  </span>
                  <span className={`font-mono text-sm font-semibold ${session.isNext ? 'text-yellow-300' : 'text-red-300'}`}>
                    {session.dt}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Colapsável: Pontos Restantes */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-3 text-lg font-bold text-red-200 bg-black/30 hover:bg-red-900/30 transition rounded-none border-y border-red-900/30">
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Pontos Restantes
            </span>
            <ChevronDown className="w-5 h-5 text-red-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-6">
            <div className="space-y-4 pt-4">
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 rounded-lg p-4 border border-yellow-400/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-yellow-400 font-bold text-lg">Campeonato de Pilotos</span>
                  <span className="text-3xl font-bold text-yellow-400">{pontosPilotos}</span>
                </div>
                <p className="text-xs text-yellow-200/80">
                  {racesLeft} corridas • {sprintsLeft} sprints restantes
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-gray-600/20 to-gray-500/10 rounded-lg p-4 border border-gray-400/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 font-bold text-lg">Campeonato de Construtores</span>
                  <span className="text-3xl font-bold text-gray-300">{pontosConstrutores}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {racesLeft} corridas • {sprintsLeft} sprints restantes
                </p>
              </div>
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
                      <p className="text-2xl font-bold text-red-400 mb-1">{proxima.nome}</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{proxima.circuito}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Próxima sessão com fundo melhorado */}
            {nextSession && (
              <div className="bg-gradient-to-br from-red-100 via-yellow-50 to-white border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
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
          {/* Grid de cronograma e pontos */}
          <div className="grid lg:grid-cols-2 gap-8">
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
                          ? 'bg-gradient-to-r from-red-100 via-yellow-50 to-white border-yellow-300 shadow-lg' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {session.isNext && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
                        <span className={`font-semibold ${session.isNext ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {session.label}
                        </span>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${session.isNext ? 'text-yellow-700' : 'text-red-500'}`}>
                        {session.dt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pontos restantes */}
            <div className="bg-white rounded-xl p-6 border border-red-200 shadow-md">
              <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-400" />
                Pontos Restantes
              </h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-yellow-600 font-bold text-lg">Campeonato de Pilotos</span>
                    <span className="text-3xl font-bold text-yellow-700">{pontosPilotos}</span>
                  </div>
                  <p className="text-xs text-yellow-500">
                    {racesLeft} corridas • {sprintsLeft} sprints restantes
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-bold text-lg">Campeonato de Construtores</span>
                    <span className="text-3xl font-bold text-gray-700">{pontosConstrutores}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {racesLeft} corridas • {sprintsLeft} sprints restantes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NextRaceDetailedInfo;
