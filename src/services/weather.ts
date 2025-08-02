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
  condition: string;
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

// Função para buscar dados meteorológicos reais
export const fetchWeatherData = async (cityName: string, country: string = '', raceDateTime?: string): Promise<WeatherData[]> => {
  try {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.warn('API Key do OpenWeatherMap não configurada, usando dados simulados');
      return generateMockWeatherData();
    }

    const { lat, lon } = getCoordinates(cityName);
    
    // Busca previsão de 5 dias com dados a cada 3 horas
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // Agrupa dados por dia com lógica inteligente baseada no horário da corrida
    const dailyData: { [key: string]: any } = {};
    const raceDate = raceDateTime ? new Date(raceDateTime) : null;
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = item;
      } else {
        const currentBest = new Date(dailyData[dateKey].dt * 1000);
        let targetHour = 12; // Padrão meio-dia
        
        // Se for o dia da corrida e temos horário da corrida, usa esse horário
        if (raceDate && dateKey === raceDate.toISOString().split('T')[0]) {
          targetHour = raceDate.getUTCHours();
          console.log(`🏎️ Usando horário da corrida para ${dateKey}: ${targetHour}:00 UTC`);
        }
        
        // Prefere dados mais próximos do horário alvo
        if (Math.abs(date.getHours() - targetHour) < Math.abs(currentBest.getHours() - targetHour)) {
          dailyData[dateKey] = item;
        }
      }
    });

    // Converte para formato esperado pelos próximos 3 dias
    const days = ['Sexta-feira', 'Sábado', 'Domingo'];
    const weatherDays: WeatherData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateKey = targetDate.toISOString().split('T')[0];
      
      const dayData = dailyData[dateKey];
      
      if (dayData) {
        const translated = translateWeatherCondition(dayData.weather[0].main, dayData.weather[0].description);
        
        weatherDays.push({
          day: days[i] || `Dia ${i + 1}`,
          date: targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          temperature: Math.round(dayData.main.temp),
          temperatureMin: Math.round(dayData.main.temp_min),
          temperatureMax: Math.round(dayData.main.temp_max),
          humidity: dayData.main.humidity,
          windSpeed: Math.round(dayData.wind?.speed * 3.6) || 0, // Converte m/s para km/h
          condition: translated.condition,
          description: translated.description,
          chanceOfRain: Math.round((dayData.pop || 0) * 100), // Probability of precipitation
          icon: dayData.weather[0].icon
        });
      } else {
        // Dados de fallback se não houver dados da API para esse dia
        weatherDays.push({
          day: days[i] || `Dia ${i + 1}`,
          date: targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          temperature: 22,
          temperatureMin: 18,
          temperatureMax: 26,
          humidity: 65,
          windSpeed: 12,
          condition: 'partly-cloudy',
          description: 'Parcialmente nublado',
          chanceOfRain: 30,
          icon: '02d'
        });
      }
    }

    return weatherDays;
    
  } catch (error) {
    console.error('Erro ao buscar dados meteorológicos:', error);
    return generateMockWeatherData();
  }
};

// Função para gerar dados simulados (fallback)
const generateMockWeatherData = (): WeatherData[] => {
  const days = ['Sexta-feira', 'Sábado', 'Domingo'];
  const today = new Date();
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    
    return {
      day,
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
      temperatureMin: Math.floor(Math.random() * 10) + 10, // 10-20°C
      temperatureMax: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      condition: Math.random() > 0.7 ? "cloudy" : Math.random() > 0.5 ? "sunny" : "partly-cloudy",
      description: Math.random() > 0.7 ? "Nublado" : Math.random() > 0.5 ? "Ensolarado" : "Parcialmente nublado",
      chanceOfRain: Math.floor(Math.random() * 60) + 10, // 10-70%
      icon: '02d'
    };
  });
};
