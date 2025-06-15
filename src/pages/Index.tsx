
import { Link } from "react-router-dom";
import { Trophy, Flag, Calendar, TrendingUp, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";

const Index = () => {
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
              <Link 
                to="/race-weekend" 
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Fim de Semana
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6 animate-pulse">
              Fórmula 1
              <span className="text-red-500"> Analytics</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Análise completa dos dados da Fórmula 1 com previsões inteligentes para o campeonato mundial
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/championship">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105">
                  Ver Campeonato 2025
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/race-weekend">
                <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105">
                  Fim de Semana de Corrida
                  <Flag className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-red-600/30 rounded-full animate-ping"></div>
      </div>

      {/* AVISO DA PRÓXIMA CORRIDA DETALHADO - Movido para depois da hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NextRaceDetailedInfo />
      </div>

      {/* History Section */}
      <div className="bg-black/30 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              História da <span className="text-red-500">Fórmula 1</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Desde 1950, a Fórmula 1 representa o ápice do automobilismo mundial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-900/50 to-black/50 p-8 rounded-lg border border-red-800/30 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <Calendar className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">1950 - O Início</h3>
              <p className="text-gray-300">
                O primeiro Campeonato Mundial de Fórmula 1 foi realizado em 1950, 
                com Giuseppe Farina se tornando o primeiro campeão mundial.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-900/50 to-black/50 p-8 rounded-lg border border-red-800/30 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <Trophy className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Lendas</h3>
              <p className="text-gray-300">
                Ayrton Senna, Michael Schumacher, Lewis Hamilton e Max Verstappen 
                marcaram épocas com suas performances excepcionais.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-900/50 to-black/50 p-8 rounded-lg border border-red-800/30 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Era Moderna</h3>
              <p className="text-gray-300">
                Com tecnologia avançada e análise de dados, a F1 atual é mais 
                competitiva e emocionante do que nunca.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-black/40 p-6 rounded-lg border border-red-800/30">
              <div className="text-3xl font-bold text-red-500 mb-2">75</div>
              <div className="text-white">Anos de História</div>
            </div>
            <div className="bg-black/40 p-6 rounded-lg border border-red-800/30">
              <div className="text-3xl font-bold text-red-500 mb-2">24</div>
              <div className="text-white">Corridas por Temporada</div>
            </div>
            <div className="bg-black/40 p-6 rounded-lg border border-red-800/30">
              <div className="text-3xl font-bold text-red-500 mb-2">10</div>
              <div className="text-white">Equipes</div>
            </div>
            <div className="bg-black/40 p-6 rounded-lg border border-red-800/30">
              <div className="text-3xl font-bold text-red-500 mb-2">20</div>
              <div className="text-white">Pilotos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-red-800/30 py-8">
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
                className="text-green-400 hover:text-green-300 transition-colors text-sm flex items-center gap-1 mb-2"
              >
                📱 WhatsApp: (31) 98779-8823
              </a>
              <div className="flex gap-3 mt-2">
                <a 
                  href="https://github.com/yurivfernandes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-400"
                  aria-label="GitHub"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/yurianalistabi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-400"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
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

export default Index;
