
import { Brain, Zap, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIAnalysis = () => {
  const insights = [
    {
      type: "performance",
      title: "McLaren em Ascensão",
      description: "A McLaren demonstra a maior evolução de performance, com Piastri e Norris consistentemente pontuando alto. O desenvolvimento do carro mostra sinais positivos para o restante da temporada.",
      confidence: 92,
      icon: <Zap className="w-5 h-5" />
    },
    {
      type: "strategy",
      title: "Red Bull Perdendo Ritmo", 
      description: "Verstappen ainda é competitivo, mas a Red Bull não demonstra a dominância dos anos anteriores. Problemas de desenvolvimento podem afetar o final da temporada.",
      confidence: 78,
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      type: "prediction",
      title: "Batalha pelo Título",
      description: "Com base nos dados atuais, temos uma das temporadas mais competitivas dos últimos anos. Piastri emerge como forte candidato ao título.",
      confidence: 85,
      icon: <Target className="w-5 h-5" />
    }
  ];

  const methodology = [
    "Análise de dados históricos dos últimos 10 anos",
    "Algoritmos de aprendizado de máquina para padrões de performance",
    "Consideração de fatores como clima, circuitos e desenvolvimento técnico",
    "Análise estatística de consistência e taxa de abandono",
    "Modelagem preditiva baseada em tendências atuais"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl border border-red-800/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Brain className="mr-3 h-6 w-6 text-red-500" />
          Análise com Inteligência Artificial
        </h2>
        
        <div className="space-y-4 mb-8">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-black/40 border-red-800/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">{insight.icon}</span>
                    {insight.title}
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {insight.confidence}% confiança
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-black/20 rounded-lg p-4 border border-red-800/20">
          <h3 className="text-lg font-semibold text-white mb-3">Metodologia da IA</h3>
          <ul className="space-y-2">
            {methodology.map((method, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start">
                <span className="text-red-400 mr-2">→</span>
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
