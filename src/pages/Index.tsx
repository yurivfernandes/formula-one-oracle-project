
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, TrendingUp, Flag, Github, Linkedin } from "lucide-react";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";

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
        <a href="/championship">
          <Button className="bg-red-600 hover:bg-red-700 shadow-lg">Ver Campeonato</Button>
        </a>
        <a href="/race-weekend">
          <Button variant="outline" className="border-red-600 text-red-400">Próximo GP</Button>
        </a>
      </div>
    </div>
  </section>
);

const HISTORY_CARDS = [
  {
    icon: Calendar,
    title: "1950 - O Início",
    text: "O primeiro Campeonato Mundial de Fórmula 1 foi realizado em 1950, com Giuseppe Farina se tornando o primeiro campeão mundial."
  },
  {
    icon: Trophy,
    title: "Lendas",
    text: "Ayrton Senna, Michael Schumacher, Lewis Hamilton e Max Verstappen marcaram épocas com suas performances excepcionais."
  },
  {
    icon: TrendingUp,
    title: "Era Moderna",
    text: "Com tecnologia avançada e análise de dados, a F1 atual é mais competitiva e emocionante do que nunca."
  }
];

const Index = () => {
  const currentGPName = "GP do Canadá";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <SiteHero />

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
              {HISTORY_CARDS.map(card => (
                <div key={card.title} className="bg-gradient-to-br from-red-900/50 to-black/50 p-8 rounded-lg border border-red-800/30 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
                  <card.icon className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-300">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

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
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
