import React, { useEffect, useState } from "react";

// Tipos básicos
interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
}
interface Result {
  points: string;
  Driver: Driver;
}
interface Race {
  round: string;
  raceName: string;
  Results?: Result[];
  SprintResults?: Result[];
}

export default function RaceResultsTest() {
  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllResults() {
      setLoading(true);
      setError(null);
      try {
        // Buscar todas as corridas (para nomes e rounds)
        const racesRes = await fetch("https://api.jolpi.ca/ergast/f1/2025/races/");
        const racesData = await racesRes.json();
        const raceList: Race[] = racesData.MRData.RaceTable.Races;

        // Buscar todos os resultados de corrida (paginado)
        let offset = 0;
        const limit = 30;
        let total = 1;
        let allRaceResults: Race[] = [];
        while (offset < total) {
          const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/results/?offset=${offset}&limit=${limit}`);
          const data = await res.json();
          total = parseInt(data.MRData.total);
          allRaceResults = allRaceResults.concat(data.MRData.RaceTable.Races);
          offset += limit;
        }

        // Buscar todos os resultados de sprint (paginado)
        offset = 0;
        total = 1;
        let allSprintResults: Race[] = [];
        while (offset < total) {
          const res = await fetch(`https://api.jolpi.ca/ergast/f1/2025/sprint/?offset=${offset}&limit=${limit}`);
          const data = await res.json();
          total = parseInt(data.MRData.total);
          allSprintResults = allSprintResults.concat(data.MRData.RaceTable.Races);
          offset += limit;
        }

        // Mapear resultados por round (merge correto de todas as páginas)
        const raceResultsByRound: { [round: string]: Result[] } = {};
        allRaceResults.forEach(r => {
          if (r.Results) {
            if (!raceResultsByRound[r.round]) raceResultsByRound[r.round] = [];
            raceResultsByRound[r.round] = raceResultsByRound[r.round].concat(r.Results);
          }
        });
        const sprintResultsByRound: { [round: string]: Result[] } = {};
        allSprintResults.forEach(r => {
          if (r.SprintResults) {
            if (!sprintResultsByRound[r.round]) sprintResultsByRound[r.round] = [];
            sprintResultsByRound[r.round] = sprintResultsByRound[r.round].concat(r.SprintResults);
          }
        });

        // Coletar todos os drivers únicos
        const driverMap: { [id: string]: Driver } = {};
        Object.values(raceResultsByRound).forEach(results => {
          results.forEach(res => { driverMap[res.Driver.driverId] = res.Driver; });
        });
        Object.values(sprintResultsByRound).forEach(results => {
          results.forEach(res => { driverMap[res.Driver.driverId] = res.Driver; });
        });
        const driverList = Object.values(driverMap);

        // Montar estrutura final para renderização
        const racesWithResults = raceList.map(race => ({
          ...race,
          Results: raceResultsByRound[race.round] || [],
          SprintResults: sprintResultsByRound[race.round] || [],
        }));

        setRaces(racesWithResults);
        setDrivers(driverList);
        setLoading(false);
      } catch (e: any) {
        setError(e.message || "Erro desconhecido");
        setLoading(false);
      }
    }
    fetchAllResults();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{overflowX: 'auto'}}>
      <h2>Tabela de Teste - Corridas e Sprints</h2>
      <table border={1} cellPadding={4} style={{borderCollapse: 'collapse', minWidth: 900}}>
        <thead>
          <tr>
            <th>Piloto</th>
            {races.map(race => (
              <th key={race.round}>
                {race.raceName}<br/>
                <span style={{fontSize: 10}}>Round {race.round}</span>
                <div>
                  {race.Results.length > 0 && <span style={{color: 'red'}}>R</span>}
                  {race.SprintResults.length > 0 && <span style={{color: 'orange', marginLeft: 4}}>S</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.driverId}>
              <td>{driver.givenName} {driver.familyName}</td>
              {races.map(race => {
                const racePts = race.Results.find(r => r.Driver.driverId === driver.driverId)?.points || "-";
                const sprintPts = race.SprintResults.find(r => r.Driver.driverId === driver.driverId)?.points || "-";
                return (
                  <td key={race.round}>
                    <div>C: <b>{racePts}</b></div>
                    <div>S: <b>{sprintPts}</b></div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
