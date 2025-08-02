import { useQuery } from "@tanstack/react-query";

export interface F1Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
  FirstPractice?: {
    date: string;
    time: string;
  };
  SecondPractice?: {
    date: string;
    time: string;
  };
  ThirdPractice?: {
    date: string;
    time: string;
  };
  Qualifying?: {
    date: string;
    time: string;
  };
  Sprint?: {
    date: string;
    time: string;
  };
  SprintQualifying?: {
    date: string;
    time: string;
  };
}

export interface F1CalendarResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      season: string;
      Races: F1Race[];
    };
  };
}

// Função para converter UTC para horário de Brasília (GMT-3)
export const convertUTCToBrazilTime = (utcTime: string): string => {
  // Remove o 'Z' do final se existir
  const cleanTime = utcTime.replace('Z', '');
  const [hours, minutes, seconds] = cleanTime.split(':').map(Number);
  
  // Converte para horário de Brasília (subtrai 3 horas)
  let brazilHours = hours - 3;
  
  // Ajusta se a hora ficar negativa
  if (brazilHours < 0) {
    brazilHours = 24 + brazilHours;
  }
  
  return `${brazilHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Função para determinar o status da corrida baseado na data atual
export const getRaceStatus = (raceDate: string): 'finalizada' | 'proxima' | 'futura' => {
  const today = new Date();
  const race = new Date(raceDate);
  
  // Normaliza as datas para comparação (apenas dia/mês/ano)
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const raceNormalized = new Date(race.getFullYear(), race.getMonth(), race.getDate());
  
  // Considera como "próxima" apenas a corrida mais próxima no futuro
  if (raceNormalized < todayNormalized) {
    return 'finalizada';
  } else if (raceNormalized.getTime() === todayNormalized.getTime()) {
    return 'proxima'; // Corrida acontecendo hoje
  } else {
    return 'futura';
  }
};

// Função para encontrar a próxima corrida
export const findNextRace = (races: F1Race[]): F1Race | null => {
  const today = new Date();
  const futureRaces = races.filter(race => new Date(race.date) >= today);
  
  if (futureRaces.length === 0) return null;
  
  // Ordena por data e retorna a primeira (mais próxima)
  futureRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return futureRaces[0];
};

// Função para obter emoji da bandeira do país
export const getCountryFlag = (country: string): string => {
  const flags: Record<string, string> = {
    "Australia": "🇦🇺",
    "China": "🇨🇳", 
    "Japan": "🇯🇵",
    "Bahrain": "🇧🇭",
    "Saudi Arabia": "🇸🇦",
    "USA": "🇺🇸",
    "Italy": "🇮🇹",
    "Monaco": "🇲🇨",
    "Spain": "🇪🇸",
    "Canada": "🇨🇦",
    "Austria": "🇦🇹",
    "UK": "🇬🇧",
    "Belgium": "🇧🇪",
    "Hungary": "🇭🇺",
    "Netherlands": "🇳🇱",
    "Azerbaijan": "🇦🇿",
    "Singapore": "🇸🇬",
    "Mexico": "🇲🇽",
    "Brazil": "🇧🇷",
    "Qatar": "🇶🇦",
    "UAE": "🇦🇪"
  };
  
  return flags[country] || "🏁";
};

export const useF1Calendar = () => {
  return useQuery({
    queryKey: ['f1-calendar', '2025'],
    queryFn: async (): Promise<F1Race[]> => {
      const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races');
      if (!response.ok) {
        throw new Error('Falha ao buscar calendário F1');
      }
      const data: F1CalendarResponse = await response.json();
      return data.MRData.RaceTable.Races;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
  });
};
