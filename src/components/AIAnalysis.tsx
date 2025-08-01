
import React, { useEffect, useState } from "react";
import { openAIService } from "../services/openai";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";

// Utilitário para obter a data do último GP realizado
function getLastCompletedRaceDate(races: any[]): string | null {
	if (!races || races.length === 0) return null;
	const now = new Date();
	const completed = races.filter((r: any) => new Date(r.date) < now);
	if (completed.length === 0) return null;
	// Pega a data da última corrida realizada
	return completed[completed.length - 1].date;
}

const AIAnalysis = () => {
	const { drivers, constructors, isLoading } = useChampionshipPrediction();
	const [analysis, setAnalysis] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Buscar corridas para saber a data do último GP
	const [races, setRaces] = useState<any[]>([]);
	useEffect(() => {
		fetch("https://api.jolpi.ca/ergast/f1/2025/races/")
			.then(res => res.json())
			.then(data => setRaces(data.MRData.RaceTable.Races || []));
	}, []);

	useEffect(() => {
		if (!drivers || !constructors || drivers.length === 0 || constructors.length === 0 || races.length === 0) return;
		const lastRaceDate = getLastCompletedRaceDate(races);
		if (!lastRaceDate) return;
		const cacheKey = `ai_analysis_2025_${lastRaceDate}`;
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			setAnalysis(cached);
			return;
		}
		setLoading(true);
		setError(null);
		// Chama a OpenAI apenas se não houver cache para o último GP
		openAIService.generatePrediction(
			drivers.map(d => ({
				Driver: d.driver,
				Constructors: [d.constructor],
				points: d.currentPoints,
				wins: d.driver?.wins || 0
			})),
			constructors.map(c => ({
				Constructor: c.constructor,
				points: c.currentPoints,
				wins: c.constructor?.wins || 0
			})),
			races
		)
			.then(result => {
				setAnalysis(result);
				localStorage.setItem(cacheKey, result);
			})
			.catch(e => {
				setError(e.message || "Erro ao gerar análise de IA");
			})
			.finally(() => setLoading(false));
	}, [drivers, constructors, races]);

	return (
		<div className="bg-white rounded-xl border border-red-200 shadow-xl p-6">
			<h2 className="text-2xl font-bold text-red-700 mb-4">Análise de IA (OpenAI)</h2>
			{loading && <p className="text-gray-500">Gerando análise preditiva com IA...</p>}
			{error && <p className="text-red-500">{error}</p>}
			{analysis && (
				<div className="prose max-w-none text-gray-900 whitespace-pre-line">
					{analysis}
				</div>
			)}
			{!loading && !analysis && !error && (
				<p className="text-gray-500">Nenhuma análise disponível ainda.</p>
			)}
		</div>
	);
};

export default AIAnalysis;
