import { useState, useEffect } from 'react';

interface RaceData {
  round: string;
  raceName: string;
  date: string;
  completed: boolean;
}

interface RaceTracker {
  lastCompletedRace: string | null;
  lastPredictionRace: string | null;
  canGenerateNewPrediction: boolean;
  currentRaceData: RaceData | null;
}

export const useRaceTracker = (): RaceTracker => {
  const [lastCompletedRace, setLastCompletedRace] = useState<string | null>(null);
  const [lastPredictionRace, setLastPredictionRace] = useState<string | null>(null);
  const [currentRaceData, setCurrentRaceData] = useState<RaceData | null>(null);

  useEffect(() => {
    // Carregar dados salvos
    const savedLastRace = localStorage.getItem('lastCompletedRace');
    const savedLastPrediction = localStorage.getItem('lastPredictionRace');
    
    setLastCompletedRace(savedLastRace);
    setLastPredictionRace(savedLastPrediction);

    // Verificar status das corridas
    checkRaceStatus();
  }, []);

  const checkRaceStatus = async () => {
    try {
      // Buscar corridas da temporada atual usando a mesma API dos outros componentes
      const response = await fetch('https://api.jolpi.ca/ergast/f1/2025/races/');
      const data = await response.json();
      const races = data.MRData.RaceTable.Races || [];

      // Encontrar a corrida mais recente que já passou
      const now = new Date();
      let latestCompletedRace: RaceData | null = null;
      let nextRace: RaceData | null = null;

      for (const race of races) {
        const raceDate = new Date(`${race.date}${race.time ? "T" + race.time : "T12:00:00Z"}`);
        
        if (raceDate <= now) {
          // Corrida já aconteceu
          latestCompletedRace = {
            round: race.round,
            raceName: race.raceName,
            date: race.date,
            completed: true
          };
        } else if (!nextRace) {
          // Próxima corrida
          nextRace = {
            round: race.round,
            raceName: race.raceName,
            date: race.date,
            completed: false
          };
          break;
        }
      }

      // Atualizar dados da corrida atual
      setCurrentRaceData(nextRace || latestCompletedRace);

      // Verificar se houve uma nova corrida completada
      if (latestCompletedRace && latestCompletedRace.round !== lastCompletedRace) {
        const newLastRace = latestCompletedRace.round;
        setLastCompletedRace(newLastRace);
        localStorage.setItem('lastCompletedRace', newLastRace);
        
        console.log('Nova corrida detectada:', latestCompletedRace.raceName);
      }

    } catch (error) {
      console.error('Erro ao verificar status das corridas:', error);
    }
  };

  const markPredictionGenerated = (raceRound: string) => {
    setLastPredictionRace(raceRound);
    localStorage.setItem('lastPredictionRace', raceRound);
  };

  const canGenerateNewPrediction = lastCompletedRace !== lastPredictionRace || lastCompletedRace === null;

  return {
    lastCompletedRace,
    lastPredictionRace,
    canGenerateNewPrediction,
    currentRaceData,
  };
};

export default useRaceTracker;
