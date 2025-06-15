
import { Calculator, Info, BarChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PredictionExplanation = () => {
  return (
    <div className="bg-red-950 rounded-xl border border-red-800/40 p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Info className="mr-2 h-5 w-5 text-red-500" />
        Como Funciona Nossa Predição
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-red-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <Calculator className="mr-2 h-4 w-4 text-red-400" />
              Cálculo Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300 text-xs leading-relaxed">
              Utilizamos a média de pontos por corrida atual do piloto e projetamos para as corridas restantes, considerando o histórico de performance.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-red-800/30">
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

        <Card className="bg-black/40 border-red-800/30">
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
      <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800/30">
        <p className="text-red-200 text-xs">
          <strong className="text-red-400">Importante:</strong> As predições são baseadas em dados históricos e tendências atuais.
          Fatores como mudanças regulamentares, clima, acidentes e desenvolvimento técnico podem alterar significativamente os resultados finais.
        </p>
      </div>
    </div>
  );
};

export default PredictionExplanation;
