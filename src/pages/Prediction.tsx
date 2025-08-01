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
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Informativo da próxima corrida e pontos restantes */}
          <NextRaceInfo />
          <div className="mb-6 sm:mb-8">
            <Link to="/">
              <Button 
                variant="ghost"
                className="text-red-700 hover:text-red-500 mb-3 border border-red-200 hover:bg-red-50 w-full sm:w-auto"
                style={{boxShadow: "0 0 0 2px rgba(185,28,28,0.16)"}}
              >
                <ArrowLeft className="mr-2 h-4 w-4 text-red-500" />
                Voltar para Home
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-red-700 mb-1 sm:mb-2 text-center sm:text-left">
              Predição do Campeonato F1 2025
            </h1>
            <p className="text-gray-600 text-base sm:text-lg text-center sm:text-left">
              Análise baseada em dados históricos dos últimos 10 anos
            </p>
          </div>
          <Tabs defaultValue="championship" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-red-800/30">
              <TabsTrigger 
                value="championship" 
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Target className="mr-2 h-4 w-4 text-red-400" />
                Predição Final
              </TabsTrigger>
              <TabsTrigger 
                value="trends"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <TrendingUp className="mr-2 h-4 w-4 text-red-400" />
                Tendências
              </TabsTrigger>
              <TabsTrigger 
                value="analysis"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Brain className="mr-2 h-4 w-4 text-red-400" />
                Análise IA
              </TabsTrigger>
            </TabsList>
            {/* Sub-abas para pilotos/construtores na predição final */}
            <TabsContent value="championship" className="mt-8">
              <Tabs defaultValue="drivers" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2 bg-red-50 border border-red-200">
                  <TabsTrigger value="drivers" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white">Pilotos</TabsTrigger>
                  <TabsTrigger value="constructors" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white">Construtores</TabsTrigger>
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
            <TabsContent value="trends" className="mt-8">
              <Tabs defaultValue="drivers-trends" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2 bg-red-50 border border-red-200">
                  <TabsTrigger value="drivers-trends" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white">Tendências Pilotos</TabsTrigger>
                  <TabsTrigger value="teams-trends" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white">Tendências Equipes</TabsTrigger>
                </TabsList>
                <TabsContent value="drivers-trends">
                  <TrendsAnalysis />
                </TabsContent>
                <TabsContent value="teams-trends">
                  <TeamTrends />
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="analysis" className="mt-8">
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
