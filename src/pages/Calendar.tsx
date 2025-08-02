import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Calendar as CalendarIcon, Clock, MapPin, Flag, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useF1Calendar, convertUTCToBrazilTime, getRaceStatus, findNextRace, getCountryFlag, F1Race } from "@/hooks/useF1Calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Função para traduzir nomes de corridas para português
const translateRaceName = (raceName: string): string => {
  const translations: Record<string, string> = {
    "Australian Grand Prix": "GP da Austrália",
    "Chinese Grand Prix": "GP da China",
    "Japanese Grand Prix": "GP do Japão",
    "Bahrain Grand Prix": "GP do Bahrein",
    "Saudi Arabian Grand Prix": "GP da Arábia Saudita",
    "Miami Grand Prix": "GP de Miami",
    "Emilia Romagna Grand Prix": "GP da Emilia-Romagna",
    "Monaco Grand Prix": "GP de Mônaco",
    "Spanish Grand Prix": "GP da Espanha",
    "Canadian Grand Prix": "GP do Canadá",
    "Austrian Grand Prix": "GP da Áustria",
    "British Grand Prix": "GP da Grã-Bretanha",
    "Belgian Grand Prix": "GP da Bélgica",
    "Hungarian Grand Prix": "GP da Hungria",
    "Dutch Grand Prix": "GP da Holanda",
    "Italian Grand Prix": "GP da Itália",
    "Azerbaijan Grand Prix": "GP do Azerbaijão",
    "Singapore Grand Prix": "GP de Singapura",
    "United States Grand Prix": "GP dos Estados Unidos",
    "Mexico City Grand Prix": "GP do México",
    "São Paulo Grand Prix": "GP do Brasil",
    "Las Vegas Grand Prix": "GP de Las Vegas",
    "Qatar Grand Prix": "GP do Catar",
    "Abu Dhabi Grand Prix": "GP de Abu Dhabi"
  };
  
  return translations[raceName] || raceName;
};

// Função para traduzir nomes de países
const translateCountry = (country: string): string => {
  const translations: Record<string, string> = {
    "Australia": "Austrália",
    "China": "China",
    "Japan": "Japão",
    "Bahrain": "Bahrein",
    "Saudi Arabia": "Arábia Saudita",
    "USA": "Estados Unidos",
    "Italy": "Itália",
    "Monaco": "Mônaco",
    "Spain": "Espanha",
    "Canada": "Canadá",
    "Austria": "Áustria",
    "UK": "Reino Unido",
    "Belgium": "Bélgica",
    "Hungary": "Hungria",
    "Netherlands": "Holanda",
    "Azerbaijan": "Azerbaijão",
    "Singapore": "Singapura",
    "Mexico": "México",
    "Brazil": "Brasil",
    "Qatar": "Catar",
    "UAE": "Emirados Árabes Unidos"
  };
  
  return translations[country] || country;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "finalizada":
      return <Badge className="bg-green-100 text-green-700 border-green-200">Finalizada</Badge>;
    case "proxima":
      return <Badge className="bg-red-600 text-white">Próxima Corrida</Badge>;
    case "futura":
      return <Badge variant="outline" className="border-blue-600 text-blue-700">Futura</Badge>;
    default:
      return null;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const ScheduleModal = ({ race }: { race: F1Race }) => {
  const raceName = translateRaceName(race.raceName);
  const country = translateCountry(race.Circuit.Location.country);
  
  // Constrói o schedule baseado nos dados da API
  const buildSchedule = () => {
    const schedule: any = {};
    
    // Se tem Sprint, é fim de semana Sprint
    if (race.Sprint) {
      // Sexta-feira: FP1 + Sprint Qualifying
      if (race.FirstPractice && race.SprintQualifying) {
        schedule.friday = [
          { 
            session: "Treino Livre 1", 
            time: convertUTCToBrazilTime(race.FirstPractice.time), 
            duration: "90 min" 
          },
          { 
            session: "Classificação Sprint", 
            time: convertUTCToBrazilTime(race.SprintQualifying.time), 
            duration: "60 min" 
          }
        ];
      }
      
      // Sábado: Sprint + Qualifying
      if (race.Sprint && race.Qualifying) {
        schedule.saturday = [
          { 
            session: "Corrida Sprint", 
            time: convertUTCToBrazilTime(race.Sprint.time), 
            duration: "30 min" 
          },
          { 
            session: "Classificação", 
            time: convertUTCToBrazilTime(race.Qualifying.time), 
            duration: "60 min" 
          }
        ];
      }
    } else {
      // Fim de semana tradicional
      // Sexta-feira: FP1 + FP2
      if (race.FirstPractice && race.SecondPractice) {
        schedule.friday = [
          { 
            session: "Treino Livre 1", 
            time: convertUTCToBrazilTime(race.FirstPractice.time), 
            duration: "90 min" 
          },
          { 
            session: "Treino Livre 2", 
            time: convertUTCToBrazilTime(race.SecondPractice.time), 
            duration: "90 min" 
          }
        ];
      }
      
      // Sábado: FP3 + Qualifying
      if (race.ThirdPractice && race.Qualifying) {
        schedule.saturday = [
          { 
            session: "Treino Livre 3", 
            time: convertUTCToBrazilTime(race.ThirdPractice.time), 
            duration: "60 min" 
          },
          { 
            session: "Classificação", 
            time: convertUTCToBrazilTime(race.Qualifying.time), 
            duration: "60 min" 
          }
        ];
      }
    }
    
    // Domingo: Corrida
    schedule.sunday = [
      { 
        session: "Corrida", 
        time: convertUTCToBrazilTime(race.time), 
        duration: "2h" 
      }
    ];
    
    return schedule;
  };
  
  const schedule = buildSchedule();

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-red-700 text-xl">
          {raceName} - Agenda do Fim de Semana
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            {race.Circuit.circuitName}, {race.Circuit.Location.locality}, {country}
          </p>
          <p className="text-sm text-gray-500">{formatDate(race.date)}</p>
        </div>

        <div className="grid gap-4">
          {schedule.friday && (
            <div>
              <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Sexta-feira
              </h3>
              <div className="space-y-2">
                {schedule.friday.map((session: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{session.session}</span>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                      <div>{session.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schedule.saturday && (
            <div>
              <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Sábado
              </h3>
              <div className="space-y-2">
                {schedule.saturday.map((session: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{session.session}</span>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                      <div>{session.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schedule.sunday && (
            <div>
              <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                <Flag className="h-4 w-4 mr-2" />
                Domingo
              </h3>
              <div className="space-y-2">
                {schedule.sunday.map((session: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-200">
                    <span className="font-semibold text-red-700">{session.session}</span>
                    <div className="text-right text-sm text-red-600">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                      <div>{session.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          * Horários em horário de Brasília (GMT-3)
        </div>
      </div>
    </DialogContent>
  );
};

const Calendar = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("todas");
  const { data: races, isLoading, error } = useF1Calendar();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-600">Carregando calendário F1...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertDescription>
              Erro ao carregar o calendário. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!races) {
    return null;
  }

  // Adiciona status às corridas baseado na data
  const racesWithStatus = races.map(race => ({
    ...race,
    status: getRaceStatus(race.date),
    translatedName: translateRaceName(race.raceName),
    translatedCountry: translateCountry(race.Circuit.Location.country),
    countryFlag: getCountryFlag(race.Circuit.Location.country)
  }));

  // Encontra a próxima corrida e atualiza os status
  const nextRace = findNextRace(races);
  const racesWithCorrectStatus = racesWithStatus.map(race => {
    let finalStatus = race.status;
    
    // Apenas a próxima corrida real fica com status "proxima"
    if (nextRace && race.round === nextRace.round) {
      finalStatus = 'proxima';
    } else if (race.status === 'proxima') {
      // Se não é a próxima corrida real, muda para futura
      finalStatus = 'futura';
    }
    
    return { ...race, status: finalStatus };
  });

  const filteredRaces = selectedStatus === "todas" 
    ? racesWithCorrectStatus 
    : racesWithCorrectStatus.filter(race => race.status === selectedStatus);

  const statusCounts = {
    todas: racesWithCorrectStatus.length,
    finalizada: racesWithCorrectStatus.filter(r => r.status === "finalizada").length,
    proxima: racesWithCorrectStatus.filter(r => r.status === "proxima").length,
    futura: racesWithCorrectStatus.filter(r => r.status === "futura").length,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-red-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
                <CalendarIcon className="h-10 w-10 mr-3" />
                Calendário F1 2025
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Todas as etapas da temporada com horários completos dos fins de semana de corrida
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 bg-gray-50 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-red-700">{statusCounts.todas}</div>
                <div className="text-sm text-gray-600">Total de Corridas</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-green-700">{statusCounts.finalizada}</div>
                <div className="text-sm text-gray-600">Finalizadas</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-red-700">{statusCounts.proxima}</div>
                <div className="text-sm text-gray-600">Próxima Corrida</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-blue-700">{statusCounts.futura}</div>
                <div className="text-sm text-gray-600">Futuras</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-white border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedStatus === "todas" ? "default" : "outline"}
                onClick={() => setSelectedStatus("todas")}
                className={selectedStatus === "todas" ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-700 hover:bg-red-50"}
              >
                Todas ({statusCounts.todas})
              </Button>
              <Button
                variant={selectedStatus === "finalizada" ? "default" : "outline"}
                onClick={() => setSelectedStatus("finalizada")}
                className={selectedStatus === "finalizada" ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-700 hover:bg-green-50"}
              >
                Finalizadas ({statusCounts.finalizada})
              </Button>
              <Button
                variant={selectedStatus === "proxima" ? "default" : "outline"}
                onClick={() => setSelectedStatus("proxima")}
                className={selectedStatus === "proxima" ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-700 hover:bg-red-50"}
              >
                Próxima ({statusCounts.proxima})
              </Button>
              <Button
                variant={selectedStatus === "futura" ? "default" : "outline"}
                onClick={() => setSelectedStatus("futura")}
                className={selectedStatus === "futura" ? "bg-blue-600 hover:bg-blue-700" : "border-blue-600 text-blue-700 hover:bg-blue-50"}
              >
                Futuras ({statusCounts.futura})
              </Button>
            </div>
          </div>
        </section>

        {/* Calendar Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRaces.map((race) => (
                <Card key={race.round} className="hover:shadow-lg transition-shadow border-red-100">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                        <span className="text-2xl">{race.countryFlag}</span>
                        {race.translatedName}
                      </CardTitle>
                      {getStatusBadge(race.status)}
                    </div>
                    <CardDescription className="text-sm">
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {race.Circuit.Location.locality}, {race.translatedCountry}
                      </div>
                      <div className="text-gray-500 text-xs">{race.Circuit.circuitName}</div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data:</span>
                        <span className="font-medium">{formatDate(race.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rodada:</span>
                        <span className="font-medium">Rodada {race.round}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <Clock className="h-4 w-4 mr-2" />
                            Ver Agenda Completa
                          </Button>
                        </DialogTrigger>
                        <ScheduleModal race={race} />
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRaces.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma corrida encontrada</h3>
                <p className="text-gray-500">Tente ajustar os filtros para ver mais resultados.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Calendar;
