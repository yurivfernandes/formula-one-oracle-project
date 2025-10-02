import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, RefreshCw, Info, Smartphone } from "lucide-react";

const CacheManager = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Mostrar apenas em desenvolvimento ou com query param
    const isDev = import.meta.env.DEV;
    const showDebug = new URLSearchParams(window.location.search).has('debug');
    
    if (isDev || showDebug) {
      setIsVisible(true);
    }

    // Carregar informações de versão
    setAppVersion(localStorage.getItem('app-version') || 'Não definida');
    const lastUpdateTimestamp = localStorage.getItem('last-update');
    if (lastUpdateTimestamp) {
      setLastUpdate(new Date(parseInt(lastUpdateTimestamp)).toLocaleString('pt-BR'));
    }
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      console.log('🧹 Iniciando limpeza completa...');
      
      // Chamar função global de limpeza
      if (window.clearAppCache) {
        window.clearAppCache();
      } else {
        // Fallback manual
        const keysToRemove = [
          'nextRacePrediction',
          'lastPredictionRace', 
          'lastPredictionRaceName',
          'championshipPrediction',
          'constructorsPrediction'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setIsClearing(false);
    }
  };

  const handleForceUpdate = () => {
    if (window.forceUpdate) {
      window.forceUpdate();
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <Card className="border-red-200 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-red-600" />
            Cache & Versão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-gray-600">
            <div><strong>Versão:</strong> {appVersion}</div>
            {lastUpdate && (
              <div><strong>Última atualização:</strong> {lastUpdate}</div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleClearCache}
              disabled={isClearing}
              size="sm"
              variant="outline"
              className="text-xs h-8"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar Cache
                </>
              )}
            </Button>
            
            <Button
              onClick={handleForceUpdate}
              size="sm"
              variant="outline"
              className="text-xs h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Forçar Atualização
            </Button>
            
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="text-xs h-6"
            >
              Fechar
            </Button>
          </div>

          <div className="text-xs text-gray-500 border-t pt-2">
            💡 Para mostrar: adicione <code>?debug</code> na URL
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheManager;