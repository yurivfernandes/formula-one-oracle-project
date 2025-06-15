
import { Calculator, Info, BarChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PredictionExplanation = () => {
  return (
    <div className="rounded-xl border border-red-800/40 p-0 mb-6 overflow-hidden shadow-lg bg-gradient-to-br from-black via-red-950/80 to-black">
      <div className="p-6 pb-2">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Info className="mr-2 h-5 w-5 text-red-500" />
          Como Funciona Nossa Predição
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-black/50 border-red-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center text-sm">
                <Calculator className="mr-2 h-4 w-4 text-red-400" />
                Cálculo Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300 text-xs leading-relaxed">
                Utilizamos a média de pontos por corrida atual do piloto e projetamos para as corridas restantes, considerando o histórico de performance.
                <br />
                <span className="text-red-400 font-semibold">Pontuação em jogo:</span> Considera tanto corridas principais quanto sprints restantes para uma projeção mais precisa!
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-red-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center text-sm">
                <TrendingUp className="mr-2 h-4 w-4 text-red-400" />
                Análise de Tendência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300 text-xs leading-relaxed">
                Analisamos os últimos 3 anos para identificar se o piloto está em ascensão, declínio ou estável, ajustando a predição.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-red-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center text-sm">
                <BarChart className="mr-2 h-4 w-4 text-red-400" />
                Dados Históricos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300 text-xs leading-relaxed">
                Comparamos com a média histórica dos últimos 10 anos para garantir predições realistas e coerentes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-red-900/40 via-black/40 to-red-900/40 rounded-b-xl border-t border-red-800/20">
        <p className="text-red-200 text-xs">
          <strong className="text-red-400">Importante:</strong> As predições são baseadas em dados históricos e tendências atuais.
          Sempre considerando a pontuação total restante, tanto nas <b>corridas principais</b> quanto nas <b>sprints</b>. 
          Fatores como mudanças regulamentares, clima, acidentes e desenvolvimento técnico podem alterar significativamente os resultados finais.
        </p>
      </div>
    </div>
  );
};

export default PredictionExplanation;
