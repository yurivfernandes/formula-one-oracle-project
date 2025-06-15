
import { Link } from "react-router-dom";
import { Flag, Calendar, Clock, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextRaceDetailedInfo from "@/components/NextRaceDetailedInfo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const RaceWeekend = () => {
  const nextGPName = "GP do Canadá";
  const nextGPDate = "16 de Junho";
  const nextGPTrack = "Circuito Gilles Villeneuve";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <section className="bg-white py-12 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-red-700 mb-4">
              {nextGPName}
            </h1>
            <p className="text-gray-600 text-lg">
              Informações e horários do fim de semana de corrida
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <NextRaceDetailedInfo />
          </div>
        </section>

        <section className="bg-gray-50 py-12 border-t border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-red-700 mb-8 text-center">
              Programação do Fim de Semana
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-red-100">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Sexta-Feira, {nextGPDate}
                  </h3>
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-red-500 mr-1" />
                    <span>Treino Livre 1: 14:30 - 15:30</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-red-500 mr-1" />
                    <span>Treino Livre 2: 18:00 - 19:00</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-red-100">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Sábado, {nextGPDate}
                  </h3>
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-red-500 mr-1" />
                    <span>Treino Livre 3: 13:30 - 14:30</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-red-500 mr-1" />
                    <span>Qualificação: 17:00 - 18:00</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-red-100">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Domingo, {nextGPDate}
                  </h3>
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-red-500 mr-1" />
                    <span>Corrida: 15:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-red-700 mb-8 text-center">
              Informações da Pista
            </h2>
            <div className="bg-white rounded-lg shadow p-6 border border-red-100">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-700">
                  {nextGPTrack}
                </h3>
              </div>
              <div className="text-gray-600">
                <div className="flex items-center mb-2">
                  <Car className="h-4 w-4 text-red-500 mr-1" />
                  <span>Comprimento da Pista: 4.361 km</span>
                </div>
                <div className="flex items-center mb-2">
                  <Flag className="h-4 w-4 text-red-500 mr-1" />
                  <span>Número de Voltas: 70</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-red-500 mr-1" />
                  <span>Distância da Corrida: 305.27 km</span>
                </div>
              </div>
            </div>
            {/* Botão para live timing removido conforme solicitado */}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default RaceWeekend;
