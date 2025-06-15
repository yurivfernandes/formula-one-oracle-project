import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Flag, ArrowLeft, Trophy, Clock, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import QualifyingResults from "@/components/QualifyingResults";
import RaceResults from "@/components/RaceResults";

const fetchCurrentRace = async () => {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
  const data = await res.json();
  const races = data.MRData.RaceTable.Races;
  
  const now = new Date();
  const currentRace = races.find((race: any) => {
    const raceDate = new Date(`${race.date}T${race.time || "12:00:00Z"}`);
    const raceDateOnly = new Date(race.date);
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const raceOnlyDate = new Date(raceDateOnly.getFullYear(), raceDateOnly.getMonth(), raceDateOnly.getDate());
    
    // Se a corrida é hoje ou no futuro próximo (até 2 dias depois)
    const diffDays = (raceOnlyDate.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= -2 && diffDays <= 7;
  });
  
  return currentRace || races[9]; // Fallback para GP do Canadá (round 10)
};

const RaceWeekend = () => {
  const { data: currentRace, isLoading } = useQuery({
    queryKey: ["currentRace"],
    queryFn: fetchCurrentRace,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900">
        <nav className="bg-black/50 backdrop-blur-sm border-b border-red-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-red-500 mr-3" />
                <span className="text-2xl font-bold text-white">F1 Analytics</span>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-white hover:text-red-400 transition-colors font-medium">
                  Home
                </Link>
                <Link to="/championship" className="text-white hover:text-red-400 transition-colors font-medium">
                  Campeonato
                </Link>
                <Link to="/prediction" className="text-white hover:text-red-400 transition-colors font-medium">
                  Predição
                </Link>
                <Link to="/race-weekend" className="text-red-400 font-medium">
                  Fim de Semana
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-40 w-full bg-black/30 rounded-xl mb-8" />
        </div>
      </div>
    );
  }

  if (!currentRace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Nenhuma corrida encontrada</h1>
            <Link to="/">
              <Button className="bg-red-600 hover:bg-red-700">
                Voltar à Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const raceDate = new Date(currentRace.date);
  const hasRaceHappened = new Date() > new Date(`${currentRace.date}T${currentRace.time || "12:00:00Z"}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Flag className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-2xl font-bold text-white">F1 Analytics</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-red-400 transition-colors font-medium">
                Home
              </Link>
              <Link to="/championship" className="text-white hover:text-red-400 transition-colors font-medium">
                Campeonato
              </Link>
              <Link to="/prediction" className="text-white hover:text-red-400 transition-colors font-medium">
                Predição
              </Link>
              <Link to="/race-weekend" className="text-red-400 font-medium">
                {currentRace?.raceName ? `GP do Canadá` : `Próximo GP`}
              </Link>
              <Link to="/race-weekend/live" className="text-yellow-400 font-medium flex items-center gap-1">
                <Zap className="w-5 h-5" /> Live Timing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-6 border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {currentRace.raceName}
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              {currentRace.Circuit.circuitName}
            </p>
            <div className="flex items-center justify-center gap-4 text-red-400">
              <Calendar className="h-5 w-5" />
              <span>
                {raceDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Results Sections */}
        <div className="space-y-8">
          <QualifyingResults round={currentRace.round} />
          {hasRaceHappened && <RaceResults round={currentRace.round} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-red-800/30 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-4">F1 Analytics</h3>
              <p className="text-gray-400 text-sm">
                Análise completa dos dados da Fórmula 1 com previsões inteligentes para o campeonato mundial.
              </p>
            </div>
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-4">Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">
                  Home
                </Link>
                <Link to="/championship" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">
                  Campeonato
                </Link>
                <Link to="/prediction" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">
                  Predição
                </Link>
                <Link to="/race-weekend" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">
                  Fim de Semana
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-4">Desenvolvedor</h3>
              <p className="text-gray-400 text-sm mb-2">
                Desenvolvido por <span className="text-red-400 font-semibold">Yuri Fernandes</span>
              </p>
              <a 
                href="https://wa.me/5531987798823" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors text-sm"
              >
                📱 WhatsApp: (31) 98779-8823
              </a>
            </div>
          </div>
          <div className="border-t border-red-800/30 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 F1 Analytics. Dados e estatísticas da Fórmula 1.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RaceWeekend;
