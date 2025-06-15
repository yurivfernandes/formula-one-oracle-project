import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Award, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
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
  // A API do Ergast já traz horários detalhados por corrida
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
    <div className="bg-black/40 border border-red-800/40 rounded-xl px-5 py-6 text-center text-white font-semibold mb-6">
      Temporada finalizada
    </div>
  );

  // Buscar detalhes/horários do round da próxima corrida
  const { data: nextRaceFull, isLoading: loadingSchedule } = useQuery({
    queryKey: ["raceSchedule", nextRaceObj.round],
    queryFn: () => fetchSchedule(nextRaceObj.round),
    enabled: Boolean(nextRaceObj),
  });

  // Cálculo pontos restantes pilotos/construtores (igual Prediction)
  const currentRoundNum = parseInt(nextRaceObj.round ?? CURRENT_ROUND + 1);

  const racesLeft = races?.filter((race: any) => parseInt(race.round) >= currentRoundNum).length ?? 0;
  const sprintsLeft = sprints?.filter((s: any) => parseInt(s.round) >= currentRoundNum).length ?? 0;

  const pontosGrandPrix = racesLeft * 25;
  const pontosSprint = sprintsLeft * 8;
  const pontosPilotos = pontosGrandPrix + pontosSprint;
  const pontosConstrutores =
    racesLeft * (25 + 18) +
    sprintsLeft * (8 + 7);

  // Função para mostrar data/hora no fuso de Brasília (GMT-3)
  const formatDateTime = (date: string, time: string | undefined) => {
    try {
      if (!date) return "-";
      let iso = date;
      if (time) iso += "T" + time;
      // ISO da Ergast é UTC Z
      const d = parseISO(iso);
      // formatar para fuso horário de Brasília (America/Sao_Paulo)
      return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  // Treinos livres, qualy, sprint, corrida etc.
  const sessions: { label: string, dt: string }[] = [];
  if (nextRaceFull) {
    if (nextRaceFull.FirstPractice)
      sessions.push({
        label: "Treino Livre 1",
        dt: formatDateTime(nextRaceFull.FirstPractice.date, nextRaceFull.FirstPractice.time),
      });
    if (nextRaceFull.SecondPractice)
      sessions.push({
        label: "Treino Livre 2",
        dt: formatDateTime(nextRaceFull.SecondPractice.date, nextRaceFull.SecondPractice.time),
      });
    if (nextRaceFull.ThirdPractice)
      sessions.push({
        label: "Treino Livre 3",
        dt: formatDateTime(nextRaceFull.ThirdPractice.date, nextRaceFull.ThirdPractice.time),
      });
    if (nextRaceFull.Sprint)
      sessions.push({
        label: "Sprint",
        dt: formatDateTime(nextRaceFull.Sprint.date, nextRaceFull.Sprint.time),
      });
    if (nextRaceFull.Qualifying)
      sessions.push({
        label: "Qualy",
        dt: formatDateTime(nextRaceFull.Qualifying.date, nextRaceFull.Qualifying.time),
      });
    if (nextRaceFull.date && nextRaceFull.time)
      sessions.push({
        label: "Corrida",
        dt: formatDateTime(nextRaceFull.date, nextRaceFull.time),
      });
  }

  const proxima = {
    nome: getGPNamePTBR(nextRaceObj.raceName),
    pais: getCountryPTBR(nextRaceObj.Circuit.Location.country),
    data: format(parseISO(nextRaceObj.date), "PPP", { locale: ptBR }),
    hora: nextRaceObj.time ? formatDateTime(nextRaceObj.date, nextRaceObj.time) : "-",
    circuito: nextRaceObj.Circuit.circuitName
  };

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-black/60 to-red-950/40 border border-red-800/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header com nome do GP e país */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Próxima Corrida
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{proxima.pais.flag}</span>
                    <div>
                      <p className="text-xl font-bold text-red-400">{proxima.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{proxima.circuito}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white mb-1">{proxima.data}</p>
              <div className="flex items-center gap-2 justify-end">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-red-300 font-medium">{proxima.hora}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Cronograma das sessões */}
            <div className="bg-black/30 rounded-lg p-4 border border-red-800/30">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Cronograma do Fim de Semana
              </h4>
              {loadingSchedule ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <Skeleton key={i} className="h-8 w-full bg-black/20" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-black/40 rounded border border-red-800/20">
                      <span className="font-medium text-white text-sm">{s.label}</span>
                      <span className="text-red-300 text-sm font-mono">{s.dt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pontos restantes */}
            <div className="bg-black/30 rounded-lg p-4 border border-red-800/30">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Pontos Restantes na Temporada
              </h4>
              <div className="space-y-4">
                <div className="bg-black/40 rounded p-3 border border-yellow-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-semibold">Campeonato de Pilotos</span>
                    <span className="text-2xl font-bold text-yellow-400">{pontosPilotos}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {racesLeft} corridas restantes • {sprintsLeft} sprints restantes
                  </p>
                </div>
                
                <div className="bg-black/40 rounded p-3 border border-gray-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-semibold">Campeonato de Construtores</span>
                    <span className="text-2xl font-bold text-gray-300">{pontosConstrutores}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {racesLeft} corridas restantes • {sprintsLeft} sprints restantes
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
