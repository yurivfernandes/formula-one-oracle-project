
import { Link } from "react-router-dom";
import { Trophy, Flag, Calendar, TrendingUp, Github, Linkedin } from "lucide-react";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";
import canadaImg from "/canada-f1.jpg"; // Opcional, só se o usuário enviar a imagem depois
import { Button } from "@/components/ui/button";

// Hero principal do site
const SiteHero = () => (
  <section className="bg-gradient-to-b from-red-950/90 via-black to-red-900 py-24">
    <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
      <Flag className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
        F1 Analytics
      </h1>
      <p className="text-xl text-gray-200 mb-6 max-w-xl">
        Análises modernas, dados históricos e previsões inteligentes para cada corrida de <span className="text-red-500 font-bold">Fórmula 1</span>.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/championship">
          <Button className="bg-red-600 hover:bg-red-700 shadow-lg">Ver Campeonato</Button>
        </Link>
        <Link to="/race-weekend">
          <Button variant="outline" className="border-red-600 text-red-400">Próximo GP</Button>
        </Link>
      </div>
    </div>
  </section>
);

const Index = () => {
  const currentGPName = "GP do Canadá";

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
              <Link to="/" className="text-white hover:text-red-400 transition-colors font-medium">Home</Link>
              <Link to="/championship" className="text-white hover:text-red-400 transition-colors font-medium">Campeonato</Link>
              <Link to="/prediction" className="text-white hover:text-red-400 transition-colors font-medium">Predição</Link>
              <Link to="/race-weekend" className="text-white hover:text-red-400 transition-colors font-medium">{currentGPName}</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero principal do site */}
      <SiteHero />

      {/* Hero da Próxima Corrida - Versão Herozona */}
      <section
        className="relative flex items-center justify-center min-h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `url('/canada-f1.jpg'), linear-gradient(to bottom right, #991b1b, #111)`,
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,.91)] via-black/80 to-red-900/60" />
        <div className="relative z-10 w-full flex flex-col items-center py-12 gap-6">
          <NextRaceDetailedInfo hero />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"></div>

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

      {/* Só atualizar os anos de história para 75 */}
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

      {/* Footer com ícones monocromáticos */}
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
                <Link to="/" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">Home</Link>
                <Link to="/championship" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">Campeonato</Link>
                <Link to="/prediction" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">Predição</Link>
                <Link to="/race-weekend" className="block text-gray-400 hover:text-red-400 transition-colors text-sm">{currentGPName}</Link>
              </div>
            </div>
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-4">Desenvolvedor</h3>
              <p className="text-gray-400 text-sm mb-2">
                Desenvolvido por <span className="text-red-400 font-semibold">Yuri Fernandes</span>
              </p>
              <div className="flex gap-3 mt-2">
                {/* Whatsapp como ícone monocromático */}
                <a
                  href="https://wa.me/5531987798823"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="16" fill="currentColor" className="text-gray-400" />
                    <path
                      d="M22.27 18.13c-.39-.19-2.3-1.13-2.66-1.25-.36-.13-.62-.19-.89.19-.26.39-1.02 1.25-1.25 1.51-.23.26-.46.29-.84.09-.39-.19-1.65-.61-3.13-1.95-1.15-1.02-1.93-2.27-2.16-2.66-.23-.39-.03-.6.17-.79.17-.17.39-.45.58-.68.2-.23.26-.39.39-.65.13-.26.06-.48 0-.67-.07-.19-.89-2.13-1.22-2.91-.32-.78-.66-.67-.89-.67-.23 0-.48-.01-.74 0-.26.01-.67.09-1.03.46s-1.35 1.33-1.28 3.23c.06 1.6 1.28 3.51 2.91 5.02 1.99 1.84 3.91 2.11 5.1 2.11.35 0 .67-.03.96-.06.55-.06 1.86-.75 2.13-1.48.27-.72.27-1.37.19-1.51-.08-.14-.27-.22-.56-.36z"
                      fill="#fff"
                    />
                  </svg>
                </a>
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

