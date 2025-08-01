
import { Link } from "react-router-dom";
import { Flag, Calendar, Clock, MapPin, Car, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";
import RaceWeekendExtras from "@/components/RaceWeekendExtras";
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
      <div className="min-h-screen bg-white flex flex-col">
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
      <div className="min-h-screen bg-white flex flex-col">
        <SiteHeader />
        <main className="flex flex-col flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Temporada Finalizada</h1>
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
  const nextGPTrack = nextRace.Circuit.circuitName;

  // Get track information dynamically from the current race
  const trackInfo = {
    length: nextRace.Circuit.length || "4.361 km",
    laps: nextRace.Circuit.laps || "70",
    distance: nextRace.Circuit.distance || "305.27 km",
    turns: nextRace.Circuit.turns || "14",
    drsZones: nextRace.Circuit.drsZones || "2"
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        {/* Hero Section */}
        <section className="bg-gray-900 py-20 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl font-light mb-6 tracking-tight">
              {nextGPName}
            </h1>
            <p className="text-gray-300 text-lg font-light">
              {nextGPTrack}
            </p>
          </div>
        </section>

        {/* Track Information Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Informações da Pista
              </h2>
              <div className="w-20 h-0.5 bg-red-600 mx-auto"></div>
            </div>
            
            {/* Track Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-2">{trackInfo.length}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Comprimento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-2">{trackInfo.laps}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Voltas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-2">{trackInfo.distance}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Distância Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-2">{trackInfo.turns}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Curvas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 mb-2">{trackInfo.drsZones}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Zonas DRS</div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Race Detailed Info - inclui cronograma, layout da pista e meteorologia */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <NextRaceDetailedInfo />
          </div>
        </section>

        {/* Informações Adicionais - Layout da Pista e Meteorologia */}
        <RaceWeekendExtras nextRace={nextRace} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default RaceWeekend;
