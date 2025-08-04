import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCcw, Trash2 } from 'lucide-react';

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

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      // Limpar localStorage relacionado ao PWA install
      localStorage.removeItem('ios-install-dismissed');
      localStorage.removeItem('mobile-install-dismissed');
      localStorage.removeItem('desktop-install-dismissed');
      
      // Usar a função global definida no HTML
      if (window.clearAppCache) {
        window.clearAppCache();
      } else {
        // Fallback: limpar cache manualmente
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(name => caches.delete(name))
          );
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar apenas quando há atualização ou em casos específicos de desenvolvimento
  const isDevelopment = import.meta.env.DEV;
  const showDevTools = isDevelopment && (window.location.search.includes('debug') || window.location.hostname === 'localhost');
  
  if (!isUpdateAvailable && !showDevTools) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {isUpdateAvailable && (
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
      )}

      {showDevTools && (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm mb-3 font-semibold">🛠️ Dev Tools</p>
          <div className="flex gap-2">
            <Button
              onClick={handleForceUpdate}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              {isLoading ? 'Carregando...' : 'Forçar Atualização'}
            </Button>
            <Button
              onClick={handleClearCache}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Limpar Cache
            </Button>
          </div>
        </div>
      )}
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
