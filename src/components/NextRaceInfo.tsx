
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Award } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Skeleton } from "@/components/ui/skeleton";

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

const getGPNamePTBR = (raceName: string) =>
  gpNamesPTBR[raceName] || raceName;

const GRAND_PRIX_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]; // Top 10
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1]; // Top 8

const fetchRaces = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
};


// Importar rounds de sprint do JSON centralizado
import sprintRoundsJson from "../data/sprint-rounds-2025.json";
const SPRINT_ROUNDS_2025: number[] = sprintRoundsJson.map((item: { round: number }) => item.round);

const NextRaceInfo = () => {
  const { data: races, isLoading: loadingRaces } = useQuery({
    queryKey: ["races", 2025],
    queryFn: fetchRaces,
  });

  if (loadingRaces) {
    return <Skeleton className="h-20 w-full bg-black/30 rounded-xl mb-4" />;
  }

  const now = new Date();

  // Próxima corrida considerando a data e hora
  const nextRace = races?.find((race: any) => {
    const raceDateTime = new Date(
      `${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`
    );
    return raceDateTime >= now;
  });

  // Determinar round atual baseado na próxima corrida
  const currentRoundNum = nextRace ? parseInt(nextRace.round) : 25;


  // Corridas restantes incluem a próxima e todas posteriores
  const racesLeft = races?.filter((race: any) => parseInt(race.round) >= currentRoundNum).length ?? 0;
  // Sprints restantes: rounds de sprint >= currentRoundNum
  const sprintsLeft = SPRINT_ROUNDS_2025.filter(round => round >= currentRoundNum).length;

  // Pontos restantes corridas principais e sprint
  const pontosGrandPrix = racesLeft * 25;
  const pontosSprint = sprintsLeft * 8;
  const pontosPilotos = pontosGrandPrix + pontosSprint;
  const pontosConstrutores =
    racesLeft * (25 + 18) +
    sprintsLeft * (8 + 7);

  // Info da próxima corrida:
  const proxima = nextRace
    ? {
        nome: getGPNamePTBR(nextRace.raceName),
        pais: getCountryPTBR(nextRace.Circuit.Location.country),
        data: format(parseISO(nextRace.date), "PPP", { locale: ptBR }),
      }
    : null;

  return (
    <div className="mb-6">
      <div className="bg-white border border-red-200 rounded-xl px-5 py-4 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-red-500" />
          <div>
            <span className="text-gray-700 font-medium text-sm">Próxima Corrida:</span>
            <div className="flex items-center gap-2 text-lg font-bold text-red-700">
              {proxima ? (
                <>
                  <span>{proxima.pais.flag}</span>
                  <span>{proxima.nome}</span>
                  <span className="text-gray-500 text-base font-normal ml-2">
                    {proxima.data}
                  </span>
                </>
              ) : (
                <span className="text-gray-900">Temporada finalizada</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-100">
            <Award className="w-5 h-5 text-yellow-500" />
            <div className="flex flex-col text-yellow-900 text-xs">
              <span>
                <b>Pontos pilotos restantes: </b>
                <span className="text-red-700 text-base font-bold">{pontosPilotos}</span>
              </span>
              <span className="text-yellow-700">
                ({racesLeft} corridas e {sprintsLeft} sprints)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Award className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col text-gray-700 text-xs">
              <span>
                <b>Pontos construtores restantes: </b>
                <span className="text-red-700 text-base font-bold">{pontosConstrutores}</span>
              </span>
              <span className="text-gray-500">
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

