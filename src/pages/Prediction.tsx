import { Link } from "react-router-dom";
import { Flag, ArrowLeft, TrendingUp, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChampionshipPrediction from "@/components/ChampionshipPrediction";
import ConstructorsPrediction from "@/components/ConstructorsPrediction";
import TrendsAnalysis from "@/components/TrendsAnalysis";
import TeamTrends from "@/components/TeamTrends";
import AIAnalysis from "@/components/AIAnalysis";
import NextRaceInfo from "@/components/NextRaceInfo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Prediction = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex flex-col flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 py-2 sm:py-8 w-full">
          {/* Informativo da próxima corrida e pontos restantes */}
          <NextRaceInfo />
          <div className="mb-4 sm:mb-8">
            <Link to="/">
              <Button 
                variant="ghost"
                className="text-red-700 hover:text-red-500 mb-2 sm:mb-3 border border-red-200 hover:bg-red-50 w-full sm:w-auto text-sm"
                style={{boxShadow: "0 0 0 2px rgba(185,28,28,0.16)"}}
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                Voltar para Home
              </Button>
            </Link>
            <h1 className="text-lg sm:text-4xl font-bold text-red-700 mb-1 sm:mb-2 text-center sm:text-left">
              Predição do Campeonato F1 2025
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg text-center sm:text-left">
              Análise baseada em dados históricos dos últimos 10 anos
            </p>
          </div>
          <Tabs defaultValue="championship" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-red-800/30 mb-2 sm:mb-8 h-8 sm:h-10">
              <TabsTrigger 
                value="championship" 
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 text-xs px-1 sm:px-3"
              >
                <Target className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                <span className="hidden sm:inline">Predição Final</span>
                <span className="sm:hidden">Predição</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trends"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 text-xs px-1 sm:px-3"
              >
                <TrendingUp className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                <span className="hidden sm:inline">Tendências</span>
                <span className="sm:hidden">Trends</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analysis"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 text-xs px-1 sm:px-3"
              >
                <Brain className="mr-0.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                <span className="hidden sm:inline">Análise IA</span>
                <span className="sm:hidden">IA</span>
              </TabsTrigger>
            </TabsList>
            {/* Sub-abas para pilotos/construtores na predição final */}
            <TabsContent value="championship" className="mt-2 sm:mt-8">
              <Tabs defaultValue="drivers" className="w-full">
                <TabsList className="mb-2 sm:mb-4 grid w-full grid-cols-2 bg-red-50 border border-red-200 h-8 sm:h-10">
                  <TabsTrigger value="drivers" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">Pilotos</TabsTrigger>
                  <TabsTrigger value="constructors" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">Construtores</TabsTrigger>
                </TabsList>
                <TabsContent value="drivers">
                  <ChampionshipPrediction />
                </TabsContent>
                <TabsContent value="constructors">
                  <ConstructorsPrediction />
                </TabsContent>
              </Tabs>
            </TabsContent>
            {/* Tendências: sub-abas para pilotos e equipes */}
            <TabsContent value="trends" className="mt-2 sm:mt-8">
              <Tabs defaultValue="drivers-trends" className="w-full">
                <TabsList className="mb-2 sm:mb-4 grid w-full grid-cols-2 bg-red-50 border border-red-200 h-8 sm:h-10">
                  <TabsTrigger value="drivers-trends" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">Tendências Pilotos</TabsTrigger>
                  <TabsTrigger value="teams-trends" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">Tendências Equipes</TabsTrigger>
                </TabsList>
                <TabsContent value="drivers-trends">
                  <TrendsAnalysis />
                </TabsContent>
                <TabsContent value="teams-trends">
                  <TeamTrends />
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="analysis" className="mt-2 sm:mt-8">
              <AIAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Prediction;
