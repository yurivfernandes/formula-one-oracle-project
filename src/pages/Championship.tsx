import { Link } from "react-router-dom";
import { Flag, ArrowLeft, Trophy, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriversStandings from "@/components/DriversStandings";
import ConstructorsStandings from "@/components/ConstructorsStandings";
import RaceByRaceStandings from "@/components/RaceByRaceStandings";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Championship = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex flex-col flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 py-2 sm:py-8 w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <Link to="/">
              <Button variant="ghost" className="text-red-700 hover:text-red-500 mb-2 sm:mb-4 w-full sm:w-auto text-sm">
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Voltar para Home
              </Button>
            </Link>
            
            <h1 className="text-lg sm:text-4xl font-bold text-red-700 mb-1 sm:mb-2 text-center sm:text-left">
              Campeonato Mundial de F1 2025
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg text-center sm:text-left">
              Classificações atualizadas dos pilotos e construtores
            </p>
          </div>
          {/* Championship Tables */}
          <Tabs defaultValue="drivers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-red-800/30 mb-2 sm:mb-8 h-8 sm:h-10">
              <TabsTrigger 
                value="drivers" 
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs px-1 sm:px-3"
              >
                <Trophy className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Pilotos</span>
                <span className="sm:hidden">Pilotos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="constructors"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs px-1 sm:px-3"
              >
                <Users className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Construtores</span>
                <span className="sm:hidden">Equipes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="racebyrace"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs px-1 sm:px-3"
              >
                <Calendar className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Corrida a Corrida</span>
                <span className="sm:hidden">Corridas</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="drivers" className="mt-2 sm:mt-8">
              <DriversStandings />
            </TabsContent>
            
            <TabsContent value="constructors" className="mt-2 sm:mt-8">
              <ConstructorsStandings />
            </TabsContent>

            <TabsContent value="racebyrace" className="mt-2 sm:mt-8">
              <RaceByRaceStandings />
              {/* Debug visual: tabela de teste */}
              <div className="mt-12">
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Championship;
