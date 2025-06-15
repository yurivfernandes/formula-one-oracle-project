
import { Link } from "react-router-dom";
import { Flag, ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RaceSimulation = () => {
  const [currentRace, setCurrentRace] = useState(11);
  const [isSimulating, setIsSimulating] = useState(false);

  const races = [
    "Bahrein", "Arábia Saudita", "Austrália", "Japão", "China", 
    "Miami", "Emilia Romagna", "Mônaco", "Canadá", "Espanha",
    "Áustria", "Reino Unido", "Hungria", "Bélgica", "Holanda",
    "Itália", "Azerbaijão", "Singapura", "Estados Unidos", "México",
    "Brasil", "Las Vegas", "Qatar", "Abu Dhabi"
  ];

  const simulateRace = () => {
    setIsSimulating(true);
    // Simular delay de processamento
    setTimeout(() => {
      setCurrentRace(prev => Math.min(prev + 1, races.length));
      setIsSimulating(false);
    }, 2000);
  };

  const resetSimulation = () => {
    setCurrentRace(11);
  };

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
                className="text-white hover:text-red-400 transition-colors font-medium"
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
          <Link to="/prediction">
            <Button variant="ghost" className="text-white hover:text-red-400 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Predição
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Simulação Corrida a Corrida
          </h1>
          <p className="text-gray-300 text-lg">
            Simule o desenvolvimento do campeonato corrida por corrida
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controles da Simulação */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-red-800/30">
              <CardHeader>
                <CardTitle className="text-white">Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2">
                    Corrida Atual: <span className="text-white font-bold">{currentRace}</span>
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Próxima Corrida: <span className="text-red-400">{races[currentRace - 1] || "Temporada Finalizada"}</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={simulateRace}
                    disabled={isSimulating || currentRace > races.length}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isSimulating ? (
                      <>Simulando...</>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Simular Próxima Corrida
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={resetSimulation}
                    variant="outline" 
                    className="w-full border-red-800/30 text-white hover:bg-red-900/20"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendário de Corridas */}
            <Card className="bg-gray-900 border-red-800/30 mt-4">
              <CardHeader>
                <CardTitle className="text-white">Calendário 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {races.map((race, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        index + 1 < currentRace ? 'bg-green-900/30' :
                        index + 1 === currentRace ? 'bg-red-900/30' :
                        'bg-gray-800/30'
                      }`}
                    >
                      <span className="text-white text-sm">{race}</span>
                      <Badge variant={
                        index + 1 < currentRace ? 'default' :
                        index + 1 === currentRace ? 'destructive' :
                        'outline'
                      }>
                        {index + 1 < currentRace ? 'Concluída' :
                         index + 1 === currentRace ? 'Atual' :
                         'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados da Simulação */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-red-800/30">
              <CardHeader>
                <CardTitle className="text-white">Classificação Simulada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    {currentRace === 11 
                      ? "Clique em 'Simular Próxima Corrida' para começar"
                      : currentRace > races.length
                      ? "Temporada finalizada! Confira os resultados finais."
                      : `Classificação após ${currentRace - 1} corridas simuladas`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceSimulation;
