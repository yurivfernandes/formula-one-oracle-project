

import React, { useEffect, useState } from "react";
import { openAIService } from "../services/openai";
import { useChampionshipPrediction } from "./hooks/useChampionshipPrediction";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

function getLastCompletedRaceDate(races: any[]): string | null {
	if (!races || races.length === 0) return null;
	const now = new Date();
	const completed = races.filter((r: any) => new Date(r.date) < now);
	if (completed.length === 0) return null;
	return completed[completed.length - 1].date;
}

const AIAnalysis = () => {
	const { drivers, constructors } = useChampionshipPrediction();
	const [analysis, setAnalysis] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [races, setRaces] = useState<any[]>([]);
	const [canGenerate, setCanGenerate] = useState(false);

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
			setCanGenerate(false);
		} else {
			setAnalysis(null);
			setCanGenerate(true);
		}
	}, [drivers, constructors, races]);

	const handleGenerate = async () => {
		if (!drivers || !constructors || drivers.length === 0 || constructors.length === 0 || races.length === 0) return;
		const lastRaceDate = getLastCompletedRaceDate(races);
		if (!lastRaceDate) return;
		const cacheKey = `ai_analysis_2025_${lastRaceDate}`;
		setLoading(true);
		setError(null);
		try {
			const result = await openAIService.generatePrediction(
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
			);
			setAnalysis(result);
			localStorage.setItem(cacheKey, result);
			setCanGenerate(false);
		} catch (e: any) {
			setError(e.message || "Erro ao gerar análise de IA");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-xl border border-red-200 shadow-xl p-4 sm:p-6">
			<div className="flex items-center gap-2 mb-4">
				<Sparkles className="w-7 h-7 text-red-500 animate-pulse" />
				<h2 className="text-xl sm:text-2xl font-bold text-red-700">Análise de IA (OpenAI)</h2>
			</div>
			{canGenerate && !loading && (
				<Button onClick={handleGenerate} className="mb-4 bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2">
					<Sparkles className="w-5 h-5" />
					Gerar análise preditiva com IA
				</Button>
			)}
			{loading && (
				<div className="flex items-center gap-2 text-gray-500">
					<Loader2 className="animate-spin w-5 h-5" />
					Gerando análise preditiva com IA...
				</div>
			)}
			{error && <p className="text-red-500 mt-2">{error}</p>}
			{analysis && (
				<div className="prose max-w-none text-gray-900 prose-h2:text-red-700 prose-strong:text-red-700 prose-li:mb-2">
					<ReactMarkdown>{analysis}</ReactMarkdown>
				</div>
			)}
			{!loading && !analysis && !error && !canGenerate && (
				<p className="text-gray-500">Nenhuma análise disponível ainda.</p>
			)}
		</div>
	);
};

export default AIAnalysis;
