import { useQuery } from "@tanstack/react-query";
import { MapPin, Info, Flag, Clock, Zap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackLayoutProps {
  circuitId: string;
  circuitName: string;
  location: {
    locality: string;
    country: string;
  };
}

// Informações detalhadas dos circuitos (dados reais)
const CIRCUIT_INFO: { [key: string]: {
  length: string;
  laps: number;
  raceDistance: string;
  lapRecord: string;
  recordHolder: string;
  recordYear: string;
  turns: number;
  drsZones: number;
  firstGrandPrix: string;
  description: string;
}} = {
  "villeneuve": {
    length: "4.361 km",
    laps: 70,
    raceDistance: "305.27 km", 
    lapRecord: "1:13.078",
    recordHolder: "Valtteri Bottas",
    recordYear: "2019",
    turns: 14,
    drsZones: 2,
    firstGrandPrix: "1978",
    description: "Um circuito semi-permanente construído em uma ilha artificial no Rio São Lourenço. Conhecido por suas longas retas e oportunidades de ultrapassagem."
  },
  "silverstone": {
    length: "5.891 km",
    laps: 52,
    raceDistance: "306.18 km",
    lapRecord: "1:27.097",
    recordHolder: "Max Verstappen", 
    recordYear: "2020",
    turns: 18,
    drsZones: 2,
    firstGrandPrix: "1950",
    description: "Casa do primeiro GP de F1 da história. Conhecido por suas curvas de alta velocidade como Copse, Maggotts e Becketts."
  },
  "monza": {
    length: "5.793 km",
    laps: 53,
    raceDistance: "306.72 km",
    lapRecord: "1:21.046",
    recordHolder: "Rubens Barrichello",
    recordYear: "2004", 
    turns: 11,
    drsZones: 3,
    firstGrandPrix: "1950",
    description: "O 'Templo da Velocidade'. Famous por suas longas retas e ultrapassagens emocionantes, especialmente na primeira chicane."
  },
  "spa": {
    length: "7.004 km",
    laps: 44,
    raceDistance: "308.18 km",
    lapRecord: "1:46.286",
    recordHolder: "Valtteri Bottas",
    recordYear: "2018",
    turns: 19,
    drsZones: 3,
    firstGrandPrix: "1950",
    description: "O circuito mais longo do calendário. Legendário pela subida Eau Rouge/Raidillon e condições climáticas imprevisíveis."
  }
  // Adicionar mais circuitos conforme necessário
};

const getCircuitInfo = (circuitId: string) => {
  return CIRCUIT_INFO[circuitId] || {
    length: "4.361 km",
    laps: 70,
    raceDistance: "305.27 km",
    lapRecord: "1:15.000",
    recordHolder: "Piloto",
    recordYear: "2024",
    turns: 14,
    drsZones: 2,
    firstGrandPrix: "1950",
    description: "Informações do circuito serão atualizadas em breve."
  };
};

const TrackLayout = ({ circuitId, circuitName, location }: TrackLayoutProps) => {
  const circuitInfo = getCircuitInfo(circuitId);
  
  return (
    <Card className="bg-white border border-gray-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-full">
            <Flag className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Informações do Circuito</h3>
            <p className="text-sm text-gray-600">{circuitName}</p>
          </div>
        </div>
        
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Comprimento</span>
            </div>
            <p className="text-xl font-bold text-red-800">{circuitInfo.length}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Voltas</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{circuitInfo.laps}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Curvas</span>
            </div>
            <p className="text-xl font-bold text-green-800">{circuitInfo.turns}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">DRS</span>
            </div>
            <p className="text-xl font-bold text-purple-800">{circuitInfo.drsZones} zonas</p>
          </div>
        </div>

        {/* Recorde de volta */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recorde de Volta
          </h4>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-yellow-900">{circuitInfo.lapRecord}</p>
              <p className="text-sm text-yellow-700">{circuitInfo.recordHolder} ({circuitInfo.recordYear})</p>
            </div>
          </div>
        </div>
        
        {/* Localização */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>
            <span className="font-medium">{location.locality}</span>, {location.country}
          </span>
          <span className="ml-auto text-xs text-gray-500">Primeiro GP: {circuitInfo.firstGrandPrix}</span>
        </div>

        {/* Descrição */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Sobre o Circuito</h4>
              <p className="text-xs text-blue-700">
                {circuitInfo.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackLayout;
