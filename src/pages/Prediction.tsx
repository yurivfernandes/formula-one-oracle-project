
import { Link } from "react-router-dom";
import { Flag, ArrowLeft, TrendingUp, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChampionshipPrediction from "@/components/ChampionshipPrediction";
import TrendsAnalysis from "@/components/TrendsAnalysis";
import AIAnalysis from "@/components/AIAnalysis";

const Prediction = () => {
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
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Campeonato
              </Link>
              <Link 
                to="/prediction" 
                className="text-red-400 font-medium"
              >
                Predição
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button 
              variant="ghost"
              className="text-white hover:text-red-400 mb-4 border border-red-800/60 hover:bg-red-900/30"
              style={{
                // Remove qualquer possível foco azul residual
                boxShadow: "0 0 0 2px rgba(244,63,94,0.8)"
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-red-400" />
              Voltar para Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Predição do Campeonato F1 2025
          </h1>
          <p className="text-gray-300 text-lg">
            Análise baseada em dados históricos dos últimos 10 anos
          </p>
        </div>

        {/* Prediction Content */}
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
          
          <TabsContent value="championship" className="mt-8">
            <ChampionshipPrediction />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-8">
            <TrendsAnalysis />
          </TabsContent>

          <TabsContent value="analysis" className="mt-8">
            <AIAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Prediction;
