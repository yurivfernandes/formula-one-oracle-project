
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Award } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";

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
const getCountryPTBR = (country: string) =>
  countryPTBR[country] || { nome: country, flag: "🏁" };

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
    return <Skeleton className="h-28 w-full bg-black/30 rounded-xl mb-6" />;
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
    nome: nextRaceObj.raceName,
    pais: getCountryPTBR(nextRaceObj.Circuit.Location.country),
    data: format(parseISO(nextRaceObj.date), "PPP", { locale: ptBR }),
    hora: nextRaceObj.time ? formatDateTime(nextRaceObj.date, nextRaceObj.time) : "-",
  };

  return (
    <div className="mb-8">
      <div className="bg-black/40 border border-red-800/40 rounded-xl px-5 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-7 h-7 text-red-500" />
            <span className="text-white font-medium text-base">
              Próxima Corrida:
            </span>
            <div className="flex items-center gap-2 text-lg font-bold text-red-400">
              <span>{proxima.pais.flag}</span>
              <span>{proxima.nome}</span>
              <span className="text-gray-300 text-base font-normal ml-2">{proxima.data}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-red-300 font-semibold">
              Horário da Corrida: 
              <span className="ml-2 text-white">{proxima.hora}</span>
            </span>
          </div>
          {loadingSchedule ? (
            <Skeleton className="h-10 w-60 bg-black/20 mt-2" />
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              {sessions.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="font-medium min-w-[120px]">{s.label}:</span>
                  <span>{s.dt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-red-800/30">
            <Award className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col text-white text-xs">
              <span>
                <b>Pontos pilotos restantes: </b>
                <span className="text-red-400 text-base font-bold">{pontosPilotos}</span>
              </span>
              <span className="text-gray-400">
                ({racesLeft} corridas e {sprintsLeft} sprints)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-red-800/30">
            <Award className="w-5 h-5 text-gray-200" />
            <div className="flex flex-col text-white text-xs">
              <span>
                <b>Pontos construtores restantes: </b>
                <span className="text-red-400 text-base font-bold">{pontosConstrutores}</span>
              </span>
              <span className="text-gray-400">
                ({racesLeft} corridas e {sprintsLeft} sprints)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default NextRaceDetailedInfo;
