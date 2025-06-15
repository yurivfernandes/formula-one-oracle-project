
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Award, MapPin, Zap } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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

const NextRaceDetailedInfo = () => {
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });
  const { data: sprints, isLoading: loadingSprints } = useQuery({
    queryKey: ["sprintRaces", 2025],
    queryFn: fetchSprints,
  });

  if (loadingRaces || loadingSprints) {
    return <Skeleton className="h-40 w-full bg-black/30 rounded-xl mb-8" />;
  }

  // Definir próxima corrida
  const now = new Date();
  const nextRaceObj = races?.find((race: any) => {
    const dt = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
    return dt >= now;
  });
  if (!nextRaceObj) return (
    <div className="bg-gradient-to-r from-red-900/40 to-black/60 border border-red-500/30 rounded-xl px-5 py-6 text-center text-white font-semibold mb-6">
      🏁 Temporada finalizada
    </div>
  );

  // Buscar detalhes/horários do round da próxima corrida
  const { data: nextRaceFull, isLoading: loadingSchedule } = useQuery({
    queryKey: ["raceSchedule", nextRaceObj.round],
    queryFn: () => fetchSchedule(nextRaceObj.round),
    enabled: Boolean(nextRaceObj),
  });

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

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-red-950/60 via-black/80 to-red-900/40 border border-red-500/50 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8">
          {/* Header principal */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/20 rounded-full border border-red-500/30">
                  <CalendarDays className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                    Próxima Corrida
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl drop-shadow-lg">{proxima.pais.flag}</span>
                    <div>
                      <p className="text-2xl font-bold text-red-400 mb-1">{proxima.nome}</p>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{proxima.circuito}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Próxima sessão destacada */}
            {nextSession && (
              <div className="bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-400/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 font-bold text-lg">PRÓXIMA SESSÃO</span>
                </div>
                <div className="text-white font-bold text-xl">{nextSession.label}</div>
                <div className="flex items-center gap-2 text-red-300 text-lg font-semibold">
                  <Clock className="w-5 h-5" />
                  {nextSession.dt}
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cronograma completo */}
            <div className="bg-gradient-to-br from-black/40 to-red-950/20 rounded-xl p-6 border border-red-600/30">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-red-400" />
                Cronograma Completo
              </h3>
              {loadingSchedule ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <Skeleton key={i} className="h-12 w-full bg-black/30" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-all duration-300 ${
                        session.isNext 
                          ? 'bg-gradient-to-r from-red-600/40 to-red-500/20 border-red-400/60 shadow-lg shadow-red-500/20' 
                          : 'bg-black/30 border-red-800/30 hover:bg-black/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {session.isNext && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                        <span className={`font-semibold ${session.isNext ? 'text-yellow-400' : 'text-white'}`}>
                          {session.label}
                        </span>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${session.isNext ? 'text-yellow-300' : 'text-red-300'}`}>
                        {session.dt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pontos restantes */}
            <div className="bg-gradient-to-br from-black/40 to-red-950/20 rounded-xl p-6 border border-red-600/30">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-400" />
                Pontos Restantes
              </h3>
              <div className="space-y-4">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NextRaceDetailedInfo;

