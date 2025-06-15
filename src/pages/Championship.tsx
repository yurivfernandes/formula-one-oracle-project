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
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="text-red-700 hover:text-red-500 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Home
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold text-red-700 mb-2">
              Campeonato Mundial de F1 2025
            </h1>
            <p className="text-gray-600 text-lg">
              Classificações atualizadas dos pilotos e construtores
            </p>
          </div>
          {/* Championship Tables */}
          <Tabs defaultValue="drivers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-red-800/30">
              <TabsTrigger 
                value="drivers" 
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Pilotos
              </TabsTrigger>
              <TabsTrigger 
                value="constructors"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                Construtores
              </TabsTrigger>
              <TabsTrigger 
                value="racebyrace"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Corrida a Corrida
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="drivers" className="mt-8">
              <DriversStandings />
            </TabsContent>
            
            <TabsContent value="constructors" className="mt-8">
              <ConstructorsStandings />
            </TabsContent>

            <TabsContent value="racebyrace" className="mt-8">
              <RaceByRaceStandings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Championship;
