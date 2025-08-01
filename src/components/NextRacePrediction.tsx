import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Flag, Brain, Loader2, RefreshCw } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { openAIService } from "@/services/openai";
import { useRaceTracker } from "./hooks/useRaceTracker";

interface Driver {
  position: number;
  name: string;
  team: string;
  nationality: string;
}

interface NextRacePredictionData {
  qualifying: Driver[];
  race: Driver[];
  lastUpdated: string;
  nextRace: string;
  lastRaceCompleted: string;
}

const NextRacePrediction = () => {
  const [predictionData, setPredictionData] = useState<NextRacePredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { canGenerateNewPrediction, currentRaceData, lastCompletedRace } = useRaceTracker();

  useEffect(() => {
    // Carregar dados salvos no localStorage
    const savedData = localStorage.getItem('nextRacePrediction');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPredictionData(parsed);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }, []);

  // Determinar se pode gerar novos palpites - lógica mais rígida para economizar créditos
  const canGenerate = (() => {
    // Se não tem predição alguma, pode gerar
    if (!predictionData) return true;
    
    // Se tem dados da corrida atual e a predição foi feita para uma corrida diferente
    if (currentRaceData && predictionData.nextRace !== currentRaceData.raceName) {
      return true;
    }
    
    // Se foi gerada há mais de 7 dias (para casos extremos)
    const lastUpdate = new Date(predictionData.lastUpdated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (lastUpdate < weekAgo) return true;
    
    // Caso contrário, NÃO pode gerar (economizar créditos)
    return false;
  })();

  const getCurrentSeasonSummary = async (): Promise<string> => {
    try {
      // Usar a mesma API que os outros componentes usam para 2025
      const driversResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverstandings.json');
      const constructorsResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json');
      const racesResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
      
      let drivers = [];
      let constructors = [];
      let races = [];
      let nextRace = null;

      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        drivers = driversData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
      }

      if (constructorsResponse.ok) {
        const constructorsData = await constructorsResponse.json();
        constructors = constructorsData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
      }

      if (racesResponse.ok) {
        const racesData = await racesResponse.json();
        races = racesData.MRData.RaceTable.Races || [];
        
        // Encontrar próxima corrida
        const now = new Date();
        nextRace = races.find((race: any) => {
          const raceDate = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
          return raceDate >= now;
        });
      }

      // Buscar últimos resultados de corridas (para contexto)
      const resultsResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/results.json?limit=100');
      let lastRaces = [];
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        lastRaces = resultsData.MRData.RaceTable.Races || [];
      }

      // Montar resumo da temporada
      const driversText = drivers.length > 0 
        ? drivers.slice(0, 10).map((d: any, i: number) => 
            `${i + 1}. ${d.Driver.givenName} ${d.Driver.familyName} (${d.Constructors[0].name}) - ${d.points} pts - ${d.wins} vitórias`
          ).join('\n')
        : 'Dados de pilotos não disponíveis';

      const constructorsText = constructors.length > 0
        ? constructors.slice(0, 5).map((c: any, i: number) => 
            `${i + 1}. ${c.Constructor.name} - ${c.points} pts - ${c.wins} vitórias`
          ).join('\n')
        : 'Dados de construtores não disponíveis';

      const lastRacesText = lastRaces.length > 0
        ? lastRaces.slice(-3).map((race: any) => {
            const results = race.Results?.slice(0, 3) || [];
            return `${race.raceName}: 1º ${results[0]?.Driver?.familyName || 'N/A'} 2º ${results[1]?.Driver?.familyName || 'N/A'} 3º ${results[2]?.Driver?.familyName || 'N/A'}`;
          }).join('\n')
        : 'Resultados recentes não disponíveis';

      const nextRaceText = nextRace 
        ? `${nextRace.raceName} - ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}`
        : 'Próxima corrida não identificada';

      return `TEMPORADA F1 2025 - RESUMO ATUAL:

CLASSIFICAÇÃO PILOTOS (Top 10):
${driversText}

CLASSIFICAÇÃO CONSTRUTORES (Top 5):
${constructorsText}

CORRIDAS REALIZADAS: ${lastRaces.length}
PRÓXIMA CORRIDA: ${nextRaceText}

ÚLTIMOS 3 RESULTADOS:
${lastRacesText}`;

    } catch (error) {
      console.error('Erro ao buscar dados da temporada:', error);
      throw new Error('Não foi possível obter dados atuais da temporada');
    }
  };

  const generatePrediction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!openAIService.isConfigured()) {
        throw new Error('Serviço OpenAI não configurado');
      }

      const seasonSummary = await getCurrentSeasonSummary();
      
      const prompt = `${seasonSummary}

INSTRUÇÕES: Faça APENAS os palpites para a próxima corrida. Seja CONCISO. Não explique.

Retorne EXATAMENTE neste formato:

CLASSIFICAÇÃO:
1. Max Verstappen (Red Bull)
2. Lewis Hamilton (Mercedes)
[...continue até 20]

CORRIDA:
1. Max Verstappen (Red Bull)
2. Lewis Hamilton (Mercedes)
[...continue até 20]

Use os pilotos atuais da temporada. Formato obrigatório.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em F1. Analise e faça palpites precisos. Seja CONCISO.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar predição');
      }

      const data = await response.json();
      const predictionText = data.choices[0].message.content;

      // Processar resposta do GPT
      const parsedData = parsePredictionText(predictionText);
      
      if (parsedData && parsedData.qualifying && parsedData.race) {
        const newPredictionData: NextRacePredictionData = {
          qualifying: parsedData.qualifying,
          race: parsedData.race,
          nextRace: currentRaceData?.raceName || parsedData.nextRace || 'Próxima Corrida',
          lastRaceCompleted: parsedData.lastRaceCompleted || 'Última Corrida',
          lastUpdated: new Date().toISOString(),
        };

        setPredictionData(newPredictionData);
        localStorage.setItem('nextRacePrediction', JSON.stringify(newPredictionData));
        
        // Salvar que a predição foi gerada para esta corrida específica (economizar créditos)
        if (currentRaceData) {
          localStorage.setItem('lastPredictionRace', currentRaceData.round);
          localStorage.setItem('lastPredictionRaceName', currentRaceData.raceName);
        }
      }

    } catch (err) {
      console.error('Erro ao gerar predição:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const parsePredictionText = (text: string): Partial<NextRacePredictionData> | null => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const qualifying: Driver[] = [];
      const race: Driver[] = [];
      
      let currentSection = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Detectar seções
        if (trimmedLine.includes('CLASSIFICAÇÃO') || trimmedLine.includes('QUALIFYING')) {
          currentSection = 'qualifying';
          continue;
        }
        if (trimmedLine.includes('CORRIDA') || trimmedLine.includes('RACE') || trimmedLine.includes('RESULTADO')) {
          currentSection = 'race';
          continue;
        }

        // Processar linha de piloto - formato flexível
        const match = trimmedLine.match(/(\d+)\.?\s*([^(]+?)\s*\(([^)]+)\)/);
        if (match && currentSection) {
          const [, position, name, team] = match;
          const driver: Driver = {
            position: parseInt(position),
            name: name.trim(),
            team: team.trim(),
            nationality: '',
          };

          if (currentSection === 'qualifying' && qualifying.length < 20) {
            qualifying.push(driver);
          } else if (currentSection === 'race' && race.length < 20) {
            race.push(driver);
          }
        }
      }

      console.log('Parsed data:', { qualifying: qualifying.length, race: race.length });

      if (qualifying.length >= 10 && race.length >= 10) {
        return {
          qualifying: qualifying.slice(0, 20),
          race: race.slice(0, 20),
          nextRace: currentRaceData?.raceName || 'Próxima Corrida',
          lastRaceCompleted: lastCompletedRace || 'Última Corrida',
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao processar texto da predição:', error);
      return null;
    }
  };

  const renderDriverTable = (drivers: Driver[], type: 'qualifying' | 'race') => (
    <div className="overflow-x-auto">
      <Table className="min-w-[500px] sm:min-w-[600px]">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
            <TableHead className="w-10 sm:w-16 font-bold text-xs sm:text-sm">Pos</TableHead>
            <TableHead className="font-bold text-xs sm:text-sm min-w-[100px] sm:min-w-[140px]">Piloto</TableHead>
            <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">Equipe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver, index) => (
            <TableRow 
              key={`${type}-${driver.position}`}
              className={`hover:bg-gray-50 transition-colors ${
                index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" :
                index === 1 ? "bg-gradient-to-r from-gray-50 to-gray-100" :
                index === 2 ? "bg-gradient-to-r from-orange-50 to-orange-100" :
                ""
              }`}
            >
              <TableCell className="font-medium">
                <div className={`flex items-center justify-center w-6 h-6 sm:w-10 sm:h-10 rounded-full text-white text-xs sm:text-sm font-bold ${
                  index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                  index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-600" :
                  index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                  "bg-gradient-to-br from-red-500 to-red-700"
                }`}>
                  {driver.position}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-xs sm:text-lg">
                {driver.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 sm:gap-2">
                  <TeamLogo teamName={driver.team} className="w-6 h-4 sm:w-28 sm:h-14" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="border-red-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-700 text-lg sm:text-2xl">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
            Palpites IA - Próxima Corrida (by OpenAI)
          </CardTitle>
          {canGenerate && (
            <Button
              onClick={generatePrediction}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando dados...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Palpites IA (by OpenAI)
                </>
              )}
            </Button>
          )}
        </div>
        {predictionData && (
          <p className="text-sm text-gray-600 mt-2">
            Palpites para: {predictionData.nextRace} | 
            Última atualização: {new Date(predictionData.lastUpdated).toLocaleDateString('pt-BR')}
          </p>
        )}
        {currentRaceData && !predictionData && (
          <p className="text-sm text-gray-600 mt-2">
            Próxima corrida: {currentRaceData.raceName} - {new Date(currentRaceData.date).toLocaleDateString('pt-BR')}
          </p>
        )}
        {!canGenerate && predictionData && (
          <p className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
            💰 Palpites já gerados para "{predictionData.nextRace}" - Regeneração bloqueada até a próxima corrida.
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Loading state */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <div>
                <p className="font-medium text-gray-700">Gerando palpites com IA...</p>
                <p className="text-sm text-gray-500">Analisando dados da temporada 2025</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Erro ao gerar predição:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!predictionData && !isLoading && !error && (
          <div className="p-8 text-center text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Palpites de IA Indisponíveis</h3>
            <p className="mb-2">Nenhuma predição foi gerada ainda.</p>
            {canGenerate ? (
              <p className="text-sm text-green-600">
                ✅ Pronto para gerar palpites! Clique em "Gerar Palpites IA"
              </p>
            ) : (
              <p className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                � Palpites já foram gerados para a corrida atual. Regeneração bloqueada para economizar créditos da API.
              </p>
            )}
          </div>
        )}

        {predictionData && (
          <div className="p-4">
            <Tabs defaultValue="qualifying" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2 bg-red-50 border border-red-200 h-8 sm:h-10">
                <TabsTrigger value="qualifying" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
                  <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Classificação
                </TabsTrigger>
                <TabsTrigger value="race" className="text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Corrida
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="qualifying">
                {renderDriverTable(predictionData.qualifying, 'qualifying')}
              </TabsContent>
              <TabsContent value="race">
                {renderDriverTable(predictionData.race, 'race')}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextRacePrediction;
