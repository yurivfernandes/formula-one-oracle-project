
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Flag, Trophy, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import QualifyingResults from "@/components/QualifyingResults";
import RaceResults from "@/components/RaceResults";

// Função para buscar informações da corrida atual
const fetchCurrentRace = async () => {
  const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
  const data = await response.json();
  const races = data.MRData.RaceTable.Races;
  
  // Encontrar a corrida atual (próxima ou em andamento)
  const now = new Date();
  const currentRace = races.find((race: any) => {
    const raceDate = new Date(race.date);
    const weekStart = new Date(raceDate);
    weekStart.setDate(raceDate.getDate() - 4); // 4 dias antes da corrida
    const weekEnd = new Date(raceDate);
    weekEnd.setDate(raceDate.getDate() + 1); // 1 dia após a corrida
    
    return now >= weekStart && now <= weekEnd;
  }) || races.find((race: any) => new Date(race.date) >= now); // Se não encontrar, pega a próxima
  
  return currentRace;
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
};

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

const RaceWeekend = () => {
  const { data: currentRace, isLoading } = useQuery({
    queryKey: ['currentRace'],
    queryFn: fetchCurrentRace,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-80 mb-8 bg-gray-800" />
          <Skeleton className="h-40 w-full bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!currentRace) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Nenhuma corrida encontrada</h1>
          <Link to="/">
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const country = countryPTBR[currentRace.Circuit.Location.country] || { nome: currentRace.Circuit.Location.country, flag: "🏁" };
  const gpName = gpNamesPTBR[currentRace.raceName] || currentRace.raceName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-900/20">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600/20 rounded-full border border-red-500/30">
              <Flag className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Fim de Semana de Corrida
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold text-red-400">{gpName}</h2>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{currentRace.Circuit.circuitName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs para Classificação e Resultado */}
        <Tabs defaultValue="qualifying" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-black border border-red-800/30">
            <TabsTrigger 
              value="qualifying" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Classificação
            </TabsTrigger>
            <TabsTrigger 
              value="race" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
            >
              <Flag className="w-4 h-4 mr-2" />
              Corrida
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qualifying" className="mt-6">
            <QualifyingResults round={currentRace.round} />
          </TabsContent>

          <TabsContent value="race" className="mt-6">
            <RaceResults round={currentRace.round} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RaceWeekend;
