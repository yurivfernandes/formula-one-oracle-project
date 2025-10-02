import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

export function UpdateManager() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar se há service worker e se há atualizações
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            setIsUpdateAvailable(true);
          });
        }
      });
    }
  }, []);

  const handleForceUpdate = async () => {
    setIsLoading(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar apenas quando há atualização disponível
  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-600 text-white p-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-semibold">Nova versão disponível!</span>
        </div>
        <p className="text-sm mb-3 opacity-90">
          Atualize para ter acesso aos recursos mais recentes.
        </p>
        <Button
          onClick={handleForceUpdate}
          disabled={isLoading}
          className="w-full bg-white text-red-600 hover:bg-gray-100"
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Agora'}
        </Button>
      </div>
    </div>
  );
}

// Tipos para as funções globais
declare global {
  interface Window {
    clearAppCache?: () => void;
    forceUpdate?: () => void;
    updateApp?: () => void;
    dismissUpdate?: () => void;
    resetInstallPrompt?: () => void;
  }
}
