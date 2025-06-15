import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, TrendingUp, Flag, Github, Linkedin } from "lucide-react";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";

// Hero principal do site
const SiteHero = () => (
  <section className="bg-white pt-20 pb-16 border-b border-red-100">
    <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
      <Flag className="h-16 w-16 text-red-600 mb-4" />
      <h1 className="text-5xl sm:text-6xl font-bold text-red-700 mb-6 leading-tight">
        F1 Analytics
      </h1>
      <p className="text-xl text-gray-700 mb-6 max-w-xl">
        Análises modernas, dados históricos e previsões inteligentes para cada corrida de <span className="text-red-700 font-bold">Fórmula 1</span>.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/championship">
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">Ver Campeonato</Button>
        </a>
        <a href="/race-weekend">
          <Button variant="outline" className="border-red-600 text-red-700">Próximo GP</Button>
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
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <SiteHero />

        <section
          className="relative flex items-center justify-center min-h-[400px] bg-cover bg-center border-b border-red-100"
          style={{
            backgroundImage: `url('/canada-f1.jpg')`,
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 bg-white/75" />
          <div className="relative z-10 w-full flex flex-col items-center py-10 gap-6">
            <NextRaceDetailedInfo hero />
          </div>
        </section>

        <div className="bg-gray-50 py-20 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-red-700 mb-4">
                História da Fórmula 1
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Desde 1950, a Fórmula 1 representa o ápice do automobilismo mundial
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {HISTORY_CARDS.map(card => (
                <div key={card.title} className="bg-white p-8 rounded-lg border border-red-100 shadow hover:scale-105 transition-all duration-300">
                  <card.icon className="h-12 w-12 text-red-600 mb-4" />
                  <h3 className="text-2xl font-bold text-red-700 mb-4">{card.title}</h3>
                  <p className="text-gray-600">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-gray-50 p-6 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-700 mb-2">75</div>
                <div className="text-gray-700">Anos de História</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-700 mb-2">24</div>
                <div className="text-gray-700">Corridas por Temporada</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-700 mb-2">10</div>
                <div className="text-gray-700">Equipes</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-red-100">
                <div className="text-3xl font-bold text-red-700 mb-2">20</div>
                <div className="text-gray-700">Pilotos</div>
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
