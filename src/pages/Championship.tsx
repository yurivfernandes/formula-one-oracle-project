
import { Link } from "react-router-dom";
import { Flag, ArrowLeft, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriversStandings from "@/components/DriversStandings";
import ConstructorsStandings from "@/components/ConstructorsStandings";

const Championship = () => {
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
              <Link 
                to="/" 
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                to="/championship" 
                className="text-red-400 font-medium"
              >
                Campeonato
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-red-400 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Campeonato Mundial de F1 2025
          </h1>
          <p className="text-gray-300 text-lg">
            Classificações atualizadas dos pilotos e construtores
          </p>
        </div>

        {/* Championship Tables */}
        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-red-800/30">
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
          </TabsList>
          
          <TabsContent value="drivers" className="mt-8">
            <DriversStandings />
          </TabsContent>
          
          <TabsContent value="constructors" className="mt-8">
            <ConstructorsStandings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Championship;
