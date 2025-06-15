
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Target, Flag } from "lucide-react";
import DriversStandings from "@/components/DriversStandings";
import ConstructorsStandings from "@/components/ConstructorsStandings";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";
import RaceByRaceStandings from "@/components/RaceByRaceStandings";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
            F1 Brasil Hub
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Seu centro completo de informações da Fórmula 1
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link to="/championship">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Campeonato
              </Button>
            </Link>
            <Link to="/prediction">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Predições
              </Button>
            </Link>
            <Link to="/simulation">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" />
                Simulação
              </Button>
            </Link>
            <Link to="/race-weekend">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Fim de Semana
              </Button>
            </Link>
          </div>
        </div>

        {/* Next Race Detailed Info */}
        <NextRaceDetailedInfo />

        {/* Current Standings */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <DriversStandings />
          <ConstructorsStandings />
        </div>

        {/* Race by Race Standings */}
        <RaceByRaceStandings />
      </div>
    </div>
  );
};

export default Index;
