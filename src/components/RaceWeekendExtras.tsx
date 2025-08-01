import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WeatherInfo from "./WeatherInfo";

interface RaceWeekendExtrasProps {
  nextRace?: any;
}

const RaceWeekendExtras = ({ nextRace }: RaceWeekendExtrasProps) => {
  if (!nextRace) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Previsão do Tempo
          </h2>
          <div className="w-20 h-0.5 bg-red-600 mx-auto"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Previsão do Tempo */}
          <WeatherInfo 
            city={nextRace.Circuit.Location.locality}
            country={nextRace.Circuit.Location.country}
            raceDate={nextRace.date}
          />
        </div>
      </div>
    </section>
  );
};

export default RaceWeekendExtras;
