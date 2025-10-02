import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Trophy, Flag, Brain, Loader2, RefreshCw } from "lucide-react";
import StandardTable from "./StandardTable";
import TeamLogo from "./TeamLogo";
import QualifyingResults from "./QualifyingResults";
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
  const [qualifyingAvailable, setQualifyingAvailable] = useState<boolean>(false);
  const [realQualifying, setRealQualifying] = useState<any[] | null>(null);
  
  const { canGenerateNewPrediction, currentRaceData, lastCompletedRace } = useRaceTracker();

  // Função para analisar abandonos de pilotos na temporada
  const analyzeRetirements = (races: any[]): string => {
    const retirementCount: { [key: string]: number } = {};
    const retirementReasons: { [key: string]: string[] } = {};
    
    races.forEach(race => {
      if (race.Results) {
        race.Results.forEach((result: any) => {
          const driverName = result.Driver.familyName;
          
          // Se não terminou a corrida ou foi DNF/DSQ
          if (result.status !== "Finished" && result.status !== "+1 Lap" && result.status !== "+2 Laps") {
            retirementCount[driverName] = (retirementCount[driverName] || 0) + 1;
            
            if (!retirementReasons[driverName]) {
              retirementReasons[driverName] = [];
            }
            retirementReasons[driverName].push(result.status);
          }
        });
      }
    });

    // Ordenar por número de abandonos
    const sortedRetirements = Object.entries(retirementCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 pilotos com mais problemas

    if (sortedRetirements.length === 0) {
      return "Temporada com alta confiabilidade - poucos abandonos registrados";
    }

    return sortedRetirements.map(([driver, count]) => {
      const reasons = retirementReasons[driver].slice(0, 2).join(", ");
      return `${driver}: ${count} DNFs (${reasons})`;
    }).join('\n');
  };

  // Função para simular previsão do tempo baseada na localização
  const getWeatherForecast = async (race: any): Promise<string> => {
    if (!race) return "Dados climáticos indisponíveis";
    
    // Simular dados climáticos baseados na localização e época do ano
    const location = race.Circuit.Location;
    const month = new Date(race.date).getMonth();
    
    // Simular condições baseadas em padrões climáticos realistas
    const isWinterTrack = location.country === "Australia" || location.country === "Brazil";
    const isDesertTrack = location.country === "UAE" || location.country === "Saudi Arabia" || location.country === "Bahrain";
    const isEuropeanSummer = (month >= 4 && month <= 8) && (location.country === "Italy" || location.country === "Spain" || location.country === "France");
    
    let weather = {
      temperature: 25,
      humidity: 60,
      windSpeed: 15,
      rainChance: 20,
      condition: "partly-cloudy"
    };

    if (isDesertTrack) {
      weather = { temperature: 35, humidity: 30, windSpeed: 10, rainChance: 5, condition: "sunny" };
    } else if (isWinterTrack && month < 3) {
      weather = { temperature: 28, humidity: 70, windSpeed: 20, rainChance: 40, condition: "cloudy" };
    } else if (isEuropeanSummer) {
      weather = { temperature: 30, humidity: 45, windSpeed: 12, rainChance: 15, condition: "sunny" };
    } else if (location.country === "United Kingdom" || location.country === "Belgium") {
      weather = { temperature: 18, humidity: 80, windSpeed: 25, rainChance: 60, condition: "cloudy" };
    }

    return `PREVISÃO PARA ${location.locality}, ${location.country}:
Temperatura: ${weather.temperature}°C
Umidade: ${weather.humidity}%
Vento: ${weather.windSpeed} km/h
Chance de chuva: ${weather.rainChance}%
Condição: ${weather.condition === "sunny" ? "Ensolarado" : weather.condition === "cloudy" ? "Nublado" : "Parcialmente nublado"}

IMPACTO NA CORRIDA: ${weather.rainChance > 40 ? "Alto risco de chuva - estratégia de pneus crucial" : weather.temperature > 30 ? "Calor intenso - gerenciamento térmico importante" : "Condições estáveis previstas"}`;
  };

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

  useEffect(() => {
    // Verificar se há classificação disponível quando currentRaceData muda
    const fetchQualifying = async () => {
      if (currentRaceData) {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${currentRaceData.round}/qualifying.json`);
        const data = await res.json();
        const results = data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
        setQualifyingAvailable(results.length > 0);
        setRealQualifying(results.length > 0 ? results : null);
      } else {
        setQualifyingAvailable(false);
        setRealQualifying(null);
      }
    };
    fetchQualifying();
  }, [currentRaceData]);

  // Função para verificar se há classificação disponível para a próxima corrida
  const checkQualifyingAvailable = async (): Promise<boolean> => {
    if (!currentRaceData) return false;
    
    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/qualifying.json?limit=300`);
      if (!response.ok) return false;
      
      const data = await response.json();
      const qualifyingData = data.MRData.RaceTable.Races || [];
      
      // Verificar se há classificação para a corrida atual
      const currentQualifying = qualifyingData.find((q: any) => q.round === currentRaceData.round);
      return !!currentQualifying?.Results && currentQualifying.Results.length > 0;
    } catch (error) {
      console.error('Erro ao verificar classificação:', error);
      return false;
    }
  };

  // Determinar se pode gerar novos palpites - melhorado para atualização imediata pós-classificação
  // Permitir atualizar palpites apenas uma vez após a classificação
  const canGenerate = (() => {
    if (!predictionData) return true;
    // Só permite atualizar se a predição não foi feita para a corrida atual
    if (currentRaceData && predictionData.nextRace !== currentRaceData.raceName) {
      // Só permite se a classificação já aconteceu
      if (qualifyingAvailable && realQualifying && realQualifying.length > 0) {
        return true;
      }
      // Se não tem classificação, segue regra antiga
      return !qualifyingAvailable;
    }
    // Não permite atualizar novamente após já ter gerado para a corrida atual
    return false;
  })();

  // Função para buscar pilotos atuais de 2025
  const fetchCurrentDrivers = async () => {
    try {
      const response = await fetch('https://api.jolpi.ca/ergast/f1/current/drivers.json');
      if (!response.ok) return [];
      const data = await response.json();
      return data.MRData.DriverTable.Drivers || [];
    } catch (error) {
      console.error('Erro ao buscar pilotos atuais:', error);
      return [];
    }
  };

  const getCurrentSeasonSummary = async (): Promise<string> => {
    try {
      // Buscar pilotos atuais de 2025
      const currentDrivers = await fetchCurrentDrivers();
      const driversListPrompt = currentDrivers.length > 0 
        ? `PILOTOS OFICIAIS DA TEMPORADA 2025 (${currentDrivers.length} pilotos):\n` +
          currentDrivers.map((driver: any, index: number) => 
            `${index + 1}. ${driver.givenName} ${driver.familyName} (#${driver.permanentNumber}, ${driver.code}) - ${driver.nationality}`
          ).join('\n') +
          `\n\n🚨 IMPORTANTE: Use APENAS estes pilotos nas suas predições. NÃO inclua pilotos que saíram da F1.\n\n`
        : '';

      // Usar a mesma API que os outros componentes usam para 2025
      const driversResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/driverstandings.json');
      const constructorsResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json');
      const racesResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
      const qualifyingResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/qualifying.json?limit=300');
      
      let drivers = [];
      let constructors = [];
      let races = [];
      let nextRace = null;
      let qualifyingData = [];

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

      if (qualifyingResponse.ok) {
        const qualifyingResponseData = await qualifyingResponse.json();
        qualifyingData = qualifyingResponseData.MRData.RaceTable.Races || [];
      }

      // Buscar últimos resultados de corridas (para contexto e análise de abandonos)
      const resultsResponse = await fetch('https://api.jolpi.ca/ergast/f1/2025/results.json?limit=300');
      let lastRaces = [];
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        lastRaces = resultsData.MRData.RaceTable.Races || [];
      }

      // Analisar abandonos por piloto durante a temporada
      const retirementAnalysis = analyzeRetirements(lastRaces);
      
      // Buscar dados climáticos simulados para a próxima corrida
      const weatherData = await getWeatherForecast(nextRace);

      // Verificar se há classificação para a próxima corrida
      const currentQualifying = nextRace ? qualifyingData.find((q: any) => q.round === nextRace.round) : null;

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

      // Montar dados de classificação se disponível
      const qualifyingText = currentQualifying?.Results ? 
        `CLASSIFICAÇÃO ATUAL (${nextRace.raceName}):\n` + 
        currentQualifying.Results.slice(0, 10).map((result: any, i: number) => 
          `${i + 1}. ${result.Driver.familyName} (${result.Constructor.name}) - ${result.Q3 || result.Q2 || result.Q1}`
        ).join('\n') : 'Classificação ainda não realizada';

      return `TEMPORADA F1 2025 - RESUMO COMPLETO PARA PALPITES:

${driversListPrompt}CLASSIFICAÇÃO PILOTOS (Top 10):
${driversText}

CLASSIFICAÇÃO CONSTRUTORES (Top 5):
${constructorsText}

CORRIDAS REALIZADAS: ${lastRaces.length}
PRÓXIMA CORRIDA: ${nextRaceText}

${qualifyingText}

ÚLTIMOS 3 RESULTADOS:
${lastRacesText}

ANÁLISE DE ABANDONOS NA TEMPORADA:
${retirementAnalysis}

PREVISÃO CLIMÁTICA PARA A CORRIDA:
${weatherData}

INSTRUÇÕES PARA ANÁLISE: Use todos esses dados para fazer palpites mais precisos. Considere:
- 🚨 OBRIGATÓRIO: Use SOMENTE os pilotos listados na seção "PILOTOS OFICIAIS DA TEMPORADA 2025"
- Performance recente dos pilotos e equipes
- Histórico de abandonos (confiabilidade)
- Condições climáticas previstas
- Posições de largada (se classificação disponível)
- Características do circuito em diferentes condições

⚠️ ATENÇÃO: NÃO inclua Pérez, Ricciardo, Bottas, Zhou ou outros pilotos que não estão na lista oficial de 2025!`;

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
      let prompt = seasonSummary + "\n\n";
      if (qualifyingAvailable && realQualifying && realQualifying.length > 0 && currentRaceData) {
        // Montar texto da classificação real
        const realQualyText = realQualifying.slice(0, 20).map((q: any, i: number) =>
          `${i + 1}. ${q.Driver.givenName} ${q.Driver.familyName} (${q.Constructor.name})`
        ).join('\n');
        prompt += `A CLASSIFICAÇÃO REAL PARA O GP (${currentRaceData.raceName}) JÁ ACONTECEU. A ORDEM DE LARGADA É:\n${realQualyText}\n\n`;
        prompt += `INSTRUÇÃO: NÃO FAÇA PALPITE DE CLASSIFICAÇÃO. Use a ordem de largada acima como base para prever apenas o resultado final da corrida, considerando performance, clima, abandonos e estratégia.\n`;
        prompt += `Retorne EXATAMENTE neste formato (sem explicações):\n\nCORRIDA:\n1. Nome Piloto (Equipe)\n2. Nome Piloto (Equipe)\n[...continue até 20]\n`;
      } else {
        prompt += `INSTRUÇÕES PARA PALPITES ESTRATÉGICOS: \n\n`;
        prompt += `Analise TODOS os dados fornecidos:\n`;
        prompt += `✅ Performance atual dos pilotos no campeonato\n`;
        prompt += `✅ Histórico de abandonos/confiabilidade de cada piloto\n`;
        prompt += `✅ Condições climáticas previstas para a corrida\n`;
        prompt += `✅ Dados de classificação (se disponível)\n`;
        prompt += `✅ Características do circuito\n`;
        prompt += `✅ Forma recente das equipes\n\n`;
        prompt += `IMPORTANTE: \n- Se há dados de classificação, use-os como base principal\n- Considere abandonos frequentes de alguns pilotos\n- Adapte estratégia conforme condições climáticas\n- Priorize pilotos mais consistentes em condições adversas\n\n`;
        prompt += `Retorne EXATAMENTE neste formato (sem explicações):\n\nCLASSIFICAÇÃO:\n1. Nome Piloto (Equipe)\n2. Nome Piloto (Equipe)\n[...continue até 20]\n\nCORRIDA:\n1. Nome Piloto (Equipe)\n2. Nome Piloto (Equipe)\n[...continue até 20]\n`;
      }

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
              content: 'Você é um especialista em análise de F1 com foco em dados estratégicos: clima, abandonos, confiabilidade, forma atual e características de circuito. Analise profundamente todos os dados fornecidos para fazer palpites precisos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3, // Reduzido para palpites mais consistentes
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
    <StandardTable
      title={type === 'qualifying' ? 'Palpite - Classificação' : 'Palpite - Resultado da Corrida'}
      subtitle={`Top ${Math.min(drivers.length, 20)} pilotos previsto pela IA`}
      headers={["Pos", "Piloto", "Equipe"]}
      className="bg-white border border-red-200"
    >
      {drivers.map((driver, index) => (
        <TableRow 
          key={`${type}-${driver.position}`}
          className={`border-red-800/30 hover:bg-red-900/5 transition-colors ${
            index === 0 ? "bg-yellow-50" :
            index === 1 ? "bg-gray-50" :
            index === 2 ? "bg-orange-50" :
            ""
          }`}
        >
          <TableCell className="w-10 sm:w-12">
            <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              index === 0 ? "bg-yellow-500 text-black" :
              index === 1 ? "bg-gray-400 text-black" :
              index === 2 ? "bg-amber-700 text-white" :
              "bg-gray-200 text-gray-900"
            }`}>
              {driver.position}
            </span>
          </TableCell>
          <TableCell className="font-semibold min-w-[120px] sm:min-w-[180px]">
            <span className="text-xs sm:text-base">{driver.name}</span>
          </TableCell>
          <TableCell className="min-w-[80px] sm:min-w-[120px]">
            <TeamLogo teamName={driver.team} className="w-8 h-5 sm:w-12 sm:h-8" />
          </TableCell>
        </TableRow>
      ))}
    </StandardTable>
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
                  {predictionData ? 'Atualizar Palpites' : 'Gerar Palpites IA'} (by OpenAI)
                </>
              )}
            </Button>
          )}
        </div>
        {predictionData && (
          <p className="text-sm text-gray-600 mt-2">
            Palpites para: {predictionData.nextRace} | 
            Última atualização: {new Date(predictionData.lastUpdated).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
        {currentRaceData && !predictionData && (
          <p className="text-sm text-gray-600 mt-2">
            Próxima corrida: {currentRaceData.raceName} - {new Date(currentRaceData.date).toLocaleDateString('pt-BR')}
          </p>
        )}
        {!canGenerate && predictionData && (
          <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
            ⏰ Palpites atuais para "{predictionData.nextRace}" - 
            {qualifyingAvailable ? 'Poderá atualizar após 2h (classificação disponível)' : 'Aguardando classificação para atualização'}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
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
              {qualifyingAvailable && realQualifying && realQualifying.length > 0 && currentRaceData ? (
                <QualifyingResults round={currentRaceData.round} />
              ) : (
                renderDriverTable(predictionData.qualifying, 'qualifying')
              )}
            </TabsContent>
            <TabsContent value="race">
              {renderDriverTable(predictionData.race, 'race')}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default NextRacePrediction;
