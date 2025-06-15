import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Award } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";

// Bandeiras extras para países
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

// Pontuação oficial F1 (corrida principal e sprint)
const GRAND_PRIX_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; // Top 10
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1]; // Top 8

const fetchRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const fetchSprintRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/sprint/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};

const CURRENT_ROUND = 10; // Está hardcoded na lógica de predição do projeto

const NextRaceInfo = () => {
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });

  const { data: sprints, isLoading: loadingSprints } = useQuery({
    queryKey: ["sprintRaces", 2025],
    queryFn: fetchSprintRaces,
  });

  if (loadingRaces || loadingSprints) {
    return <Skeleton className="h-20 w-full bg-black/30 rounded-xl mb-4" />;
  }

  // Corrige: Seleciona a próxima corrida, inclusive se for hoje mas ainda não ocorreu (considerando horário UTC como data/hora da corrida)
  const now = new Date();
  const nextRace = races?.find((race: any) => {
    const raceDateTime = new Date(
      `${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`
    );
    return raceDateTime >= now;
  });

  // Listar rounds futuros (incluindo as que ainda não foram realizadas)
  const futureRounds = races
    ? races.filter((race: any) => {
        const raceDateTime = new Date(
          `${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`
        );
        return raceDateTime > now;
      })
    : [];
  // Sprints futuros (com round > CURRENT_ROUND)
  const futureSprints = sprints
    ? sprints.filter((s: any) => {
        const sprintDateTime = new Date(
          `${s.date}${s.time ? "T" + s.time : "T12:00:00Z"}`
        );
        return sprintDateTime > now;
      })
    : [];

  const racesLeft = futureRounds.length;
  const sprintsLeft = futureSprints.length;

  // Pontos restantes para pilotos
  const pontosGrandPrix = racesLeft * 25;
  const pontosSprint = sprintsLeft * 8;
  const pontosPilotos = pontosGrandPrix + pontosSprint;

  // Cada rodada pode ter dois pilotos por equipe marcando pontos máximos
  // Para construtores, máximo é 43 por corrida (25+18) e 16 por sprint (8+8)
  const pontosConstrutores =
    racesLeft * (25 + 18) +
    sprintsLeft * (8 + 7);

  // Info da próxima corrida:
  const proxima = nextRace
    ? {
        nome: nextRace.raceName,
        pais: getCountryPTBR(nextRace.Circuit.Location.country),
        data: format(parseISO(nextRace.date), "PPP", { locale: ptBR }),
      }
    : null;

  return (
    <div className="mb-6">
      <div className="bg-black/40 border border-red-800/40 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-red-500" />
          <div>
            <span className="text-white font-medium text-sm">Próxima Corrida:</span>
            <div className="flex items-center gap-2 text-lg font-bold text-red-400">
              {proxima ? (
                <>
                  <span>{proxima.pais.flag}</span>
                  <span>{proxima.nome}</span>
                  <span className="text-gray-300 text-base font-normal ml-2">
                    {proxima.data}
                  </span>
                </>
              ) : (
                <span className="text-white">Temporada finalizada</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
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
  );
};

export default NextRaceInfo;
