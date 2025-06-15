
import { Link } from "react-router-dom";
import { Flag, Calendar, Clock, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useQuery } from "@tanstack/react-query";

const fetchNextRace = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  const races = data.MRData.RaceTable.Races;
  const now = new Date();
  return races.find((race: any) => {
    const raceDate = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
    return raceDate >= now;
  });
};

const RaceWeekend = () => {
  const { data: nextRace, isLoading } = useQuery({
    queryKey: ["nextRaceWeekend"],
    queryFn: fetchNextRace,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
        <SiteHeader />
        <main className="flex flex-col flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-center text-gray-600">Carregando informações do GP...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!nextRace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
        <SiteHeader />
        <main className="flex flex-col flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold text-red-700 mb-4">Temporada Finalizada</h1>
            <p className="text-gray-600 text-lg">Não há próximas corridas programadas.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const gpNames: { [key: string]: string } = {
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

  const nextGPName = gpNames[nextRace.raceName] || nextRace.raceName;
  const nextGPDate = new Date(nextRace.date).toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long' 
  });
  const nextGPTrack = nextRace.Circuit.circuitName;
  const circuitLength = nextRace.Circuit.length || "4.361 km";
  const raceLaps = nextRace.Circuit.laps || "70";
  const raceDistance = nextRace.Circuit.distance || "305.27 km";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <section className="bg-gradient-to-r from-red-600 to-red-800 py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">
              {nextGPName}
            </h1>
            <p className="text-red-100 text-xl">
              Informações e horários do fim de semana de corrida
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <NextRaceDetailedInfo />
          </div>
        </section>

        <section className="bg-white py-16 border-t border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-red-700 mb-12 text-center">
              Programação do Fim de Semana
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-8 border border-red-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <Calendar className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-700">
                    Sexta-Feira
                  </h3>
                </div>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-semibold">Treino Livre 1: 14:30 - 15:30</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-semibold">Treino Livre 2: 18:00 - 19:00</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-8 border border-red-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <Calendar className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-700">
                    Sábado
                  </h3>
                </div>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-semibold">Treino Livre 3: 13:30 - 14:30</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-semibold">Qualificação: 17:00 - 18:00</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-lg p-8 border border-yellow-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-700">
                    Domingo
                  </h3>
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center">
                    <Flag className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-bold text-lg">Corrida: 15:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-red-700 mb-12 text-center">
              Informações da Pista
            </h2>
            <div className="bg-white rounded-xl shadow-xl p-8 border border-red-100">
              <div className="flex items-center mb-8">
                <MapPin className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-3xl font-bold text-gray-700">
                  {nextGPTrack}
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                  <Car className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-700">{circuitLength}</div>
                  <div className="text-gray-600 font-semibold">Comprimento da Pista</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                  <Flag className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-700">{raceLaps}</div>
                  <div className="text-gray-600 font-semibold">Número de Voltas</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                  <Clock className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-700">{raceDistance}</div>
                  <div className="text-gray-600 font-semibold">Distância da Corrida</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default RaceWeekend;
