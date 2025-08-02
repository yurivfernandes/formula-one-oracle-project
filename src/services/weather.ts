// Serviço para integração com API de meteorologia
// Usando OpenWeatherMap API (gratuita)

export interface WeatherData {
  day: string;
  date: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  humidity: number;
  windSpeed: number;
  condition: string; // Pode incluir 'unavailable' para dados indisponíveis
  description: string;
  chanceOfRain: number;
  icon: string;
}

// Mapeamento de cidades dos circuitos de F1 para coordenadas
const F1_CIRCUITS_COORDINATES: { [key: string]: { lat: number; lon: number; city: string } } = {
  "Melbourne": { lat: -37.8136, lon: 144.9631, city: "Melbourne" },
  "Shanghai": { lat: 31.2304, lon: 121.4737, city: "Shanghai" },
  "Suzuka": { lat: 34.8431, lon: 136.5394, city: "Suzuka" },
  "Sakhir": { lat: 26.0325, lon: 50.5106, city: "Manama" },
  "Jeddah": { lat: 21.4858, lon: 39.1925, city: "Jeddah" },
  "Miami": { lat: 25.7617, lon: -80.1918, city: "Miami" },
  "Imola": { lat: 44.3553, lon: 11.7139, city: "Imola" },
  "Monte-Carlo": { lat: 43.7384, lon: 7.4246, city: "Monaco" },
  "Barcelona": { lat: 41.3851, lon: 2.1734, city: "Barcelona" },
  "Montreal": { lat: 45.5017, lon: -73.5673, city: "Montreal" },
  "Spielberg": { lat: 47.2197, lon: 14.7647, city: "Spielberg" },
  "Silverstone": { lat: 52.0786, lon: -1.0169, city: "Silverstone" },
  "Budapest": { lat: 47.4979, lon: 19.0402, city: "Budapest" },
  "Spa-Francorchamps": { lat: 50.4372, lon: 5.9714, city: "Spa" },
  "Zandvoort": { lat: 52.3738, lon: 4.5404, city: "Zandvoort" },
  "Monza": { lat: 45.6156, lon: 9.2811, city: "Monza" },
  "Baku": { lat: 40.4093, lon: 49.8671, city: "Baku" },
  "Singapore": { lat: 1.2966, lon: 103.8764, city: "Singapore" },
  "Austin": { lat: 30.1328, lon: -97.6411, city: "Austin" },
  "Mexico City": { lat: 19.4326, lon: -99.1332, city: "Mexico City" },
  "São Paulo": { lat: -23.7036, lon: -46.6997, city: "São Paulo" },
  "Las Vegas": { lat: 36.1699, lon: -115.1398, city: "Las Vegas" },
  "Lusail": { lat: 25.4919, lon: 51.4547, city: "Doha" },
  "Abu Dhabi": { lat: 24.4539, lon: 54.6031, city: "Abu Dhabi" }
};

// Função para obter coordenadas de uma cidade
const getCoordinates = (cityName: string): { lat: number; lon: number } => {
  // Primeiro tenta encontrar nas coordenadas dos circuitos
  const circuit = F1_CIRCUITS_COORDINATES[cityName];
  if (circuit) {
    return { lat: circuit.lat, lon: circuit.lon };
  }

  // Coordenadas padrão caso não encontre (Londres)
  console.warn(`Coordenadas não encontradas para ${cityName}, usando Londres como padrão`);
  return { lat: 51.5074, lon: -0.1278 };
};

// Função para traduzir condições meteorológicas
const translateWeatherCondition = (condition: string, description: string): { condition: string; description: string } => {
  const conditionMap: { [key: string]: { condition: string; description: string } } = {
    'clear': { condition: 'sunny', description: 'Ensolarado' },
    'clouds': { condition: 'cloudy', description: 'Nublado' },
    'few clouds': { condition: 'partly-cloudy', description: 'Parcialmente nublado' },
    'scattered clouds': { condition: 'partly-cloudy', description: 'Parcialmente nublado' },
    'broken clouds': { condition: 'cloudy', description: 'Nublado' },
    'overcast clouds': { condition: 'cloudy', description: 'Muito nublado' },
    'rain': { condition: 'rainy', description: 'Chuvoso' },
    'drizzle': { condition: 'rainy', description: 'Garoa' },
    'thunderstorm': { condition: 'rainy', description: 'Tempestade' },
    'snow': { condition: 'snowy', description: 'Neve' },
    'mist': { condition: 'cloudy', description: 'Neblina' },
    'fog': { condition: 'cloudy', description: 'Névoa' }
  };

  const lowerCondition = condition.toLowerCase();
  const lowerDescription = description.toLowerCase();

  // Procura por palavras-chave na condição
  for (const [key, value] of Object.entries(conditionMap)) {
    if (lowerCondition.includes(key) || lowerDescription.includes(key)) {
      return value;
    }
  }

  // Padrão se não encontrar
  return { condition: 'partly-cloudy', description: 'Parcialmente nublado' };
};

// Função para buscar dados meteorológicos reais baseados nos horários das sessões F1
export const fetchWeatherData = async (
  cityName: string, 
  country: string = '', 
  raceDateTime?: string,
  scheduleData?: any
): Promise<WeatherData[]> => {
  try {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.warn('API Key do OpenWeatherMap não configurada');
      throw new Error('API Key não configurada');
    }

    const { lat, lon } = getCoordinates(cityName);
    
    // Busca previsão de 5 dias com dados a cada 3 horas
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
    );

    if (!response.ok) {
      throw new Error(`Erro na API OpenWeather: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📡 Dados da API OpenWeather recebidos para:', cityName);
    
    if (!data.list || data.list.length === 0) {
      throw new Error('Nenhum dado meteorológico disponível');
    }

    // Define os horários alvo para cada dia baseado nas sessões de F1
    const getTargetHourForDay = (dayIndex: number): number => {
      if (scheduleData) {
        switch (dayIndex) {
          case 0: // Sexta-feira - TL1
            if (scheduleData.FirstPractice?.time) {
              const time = scheduleData.FirstPractice.time;
              return parseInt(time.split(':')[0]);
            }
            return 14; // 14:00 UTC padrão
          case 1: // Sábado - Qualifying
            if (scheduleData.Qualifying?.time) {
              const time = scheduleData.Qualifying.time;
              return parseInt(time.split(':')[0]);
            }
            return 15; // 15:00 UTC padrão
          case 2: // Domingo - Corrida
            if (scheduleData.time) {
              const time = scheduleData.time;
              return parseInt(time.split(':')[0]);
            }
            return 18; // 18:00 UTC padrão
          default:
            return 14;
        }
      }
      // Horários padrão se não tiver dados do cronograma
      return [14, 15, 18][dayIndex] || 14;
    };

    // Função para verificar se uma sessão já aconteceu
    const hasSessionPassed = (sessionDate: Date, sessionHour: number): boolean => {
      const now = new Date();
      const sessionDateTime = new Date(sessionDate);
      sessionDateTime.setUTCHours(sessionHour, 0, 0, 0);
      return sessionDateTime <= now;
    };

    // Determina as datas base das sessões baseadas na data real da corrida
    const raceDate = raceDateTime ? new Date(raceDateTime) : new Date();
    
    console.log('🏁 Data da corrida recebida:', raceDateTime);
    console.log('🗓️ Data da corrida processada:', raceDate.toISOString());
    
    // Calcula sexta, sábado e domingo baseado na data da corrida
    // Se a corrida é no domingo, sexta é -2 dias, sábado é -1 dia
    const friday = new Date(raceDate);
    friday.setDate(raceDate.getDate() - 2); // 2 dias antes da corrida
    
    const saturday = new Date(raceDate);
    saturday.setDate(raceDate.getDate() - 1); // 1 dia antes da corrida
    
    const sunday = new Date(raceDate); // Dia da corrida

    const sessionDates = [friday, saturday, sunday];
    const days = ['Sexta-feira', 'Sábado', 'Domingo'];
    
    console.log('📅 Datas das sessões calculadas:', {
      sexta: friday.toISOString().split('T')[0],
      sabado: saturday.toISOString().split('T')[0],
      domingo: sunday.toISOString().split('T')[0]
    });

    // Filtra apenas sessões futuras
    const futureSessions: Array<{date: Date, day: string, index: number}> = [];
    
    for (let i = 0; i < 3; i++) {
      const sessionDate = sessionDates[i];
      const targetHour = getTargetHourForDay(i);
      
      if (!hasSessionPassed(sessionDate, targetHour)) {
        futureSessions.push({
          date: sessionDate,
          day: days[i],
          index: i
        });
        console.log(`✅ ${days[i]}: Sessão ainda não aconteceu (${targetHour}:00 UTC)`);
      } else {
        console.log(`❌ ${days[i]}: Sessão já aconteceu (${targetHour}:00 UTC)`);
      }
    }

    if (futureSessions.length === 0) {
      console.log('⚠️ Todas as sessões já aconteceram');
      return [];
    }
    
    // Verifica se as datas estão dentro do range da previsão (próximos 5 dias)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const maxForecastDate = new Date(today);
    maxForecastDate.setDate(today.getDate() + 5);
    
    console.log('📊 Range de previsão disponível:', {
      hoje: todayStr,
      maximo: maxForecastDate.toISOString().split('T')[0]
    });

    // Busca dados apenas para sessões futuras
    const weatherDays: WeatherData[] = [];

    for (const session of futureSessions) {
      const sessionDateStr = session.date.toISOString().split('T')[0];
      const targetHour = getTargetHourForDay(session.index);
      
      console.log(`🔍 Buscando dados para ${session.day} (${sessionDateStr}) às ${targetHour}:00`);
      
      // Busca o dado mais próximo do horário da sessão
      let bestMatch = null;
      let bestTimeDiff = Infinity;
      
      for (const item of data.list) {
        const itemDate = new Date(item.dt * 1000);
        const itemDateStr = itemDate.toISOString().split('T')[0];
        
        // Só considera dados do dia da sessão
        if (itemDateStr === sessionDateStr) {
          const timeDiff = Math.abs(itemDate.getUTCHours() - targetHour);
          if (timeDiff < bestTimeDiff) {
            bestTimeDiff = timeDiff;
            bestMatch = item;
          }
        }
      }

      if (bestMatch) {
        const translated = translateWeatherCondition(
          bestMatch.weather[0].main, 
          bestMatch.weather[0].description
        );
        
        console.log(`✅ ${session.day}: Encontrado dado de ${new Date(bestMatch.dt * 1000).toISOString()} para sessão às ${targetHour}:00 UTC`);
        
        weatherDays.push({
          day: session.day,
          date: session.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          temperature: Math.round(bestMatch.main.temp),
          temperatureMin: Math.round(bestMatch.main.temp_min),
          temperatureMax: Math.round(bestMatch.main.temp_max),
          humidity: bestMatch.main.humidity,
          windSpeed: Math.round((bestMatch.wind?.speed || 0) * 3.6), // Converte m/s para km/h
          condition: translated.condition,
          description: translated.description,
          chanceOfRain: Math.round((bestMatch.pop || 0) * 100),
          icon: bestMatch.weather[0].icon
        });
      } else {
        // Se não encontrar dados para o dia
        const isDateTooFar = session.date > maxForecastDate;
        const message = isDateTooFar ? 'Fora do range de previsão' : 'Dados indisponíveis';
        
        console.warn(`⚠️ ${session.day} (${sessionDateStr}): ${message}`);
        weatherDays.push({
          day: session.day,
          date: session.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          temperature: 0,
          temperatureMin: 0,
          temperatureMax: 0,
          humidity: 0,
          windSpeed: 0,
          condition: 'unavailable',
          description: message,
          chanceOfRain: 0,
          icon: ''
        });
      }
    }

    return weatherDays;
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados meteorológicos:', error);
    throw error; // Propaga o erro para que os componentes possam tratá-lo adequadamente
  }
};


