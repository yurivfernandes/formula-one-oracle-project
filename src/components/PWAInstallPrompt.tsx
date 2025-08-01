import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const { useState, useEffect } = React;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar dispositivo móvel e iOS
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsMobile(mobile);
      setIsIOS(ios);
    };

    checkMobile();
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isNavigatorStandalone;
      setIsInstalled(isInstalled);
    };

    checkIfInstalled();

    // Event listener para o prompt de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar o prompt apenas se não estiver instalado
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // Event listener para quando a app é instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Analytics ou notificação
      console.log('PWA foi instalada com sucesso!');
    };

    // Para iOS, mostrar instruções personalizadas
    const shouldShowiOSPrompt = () => {
      if (!isIOS) return false;
      if (isInstalled) return false;
      
      // Verificar se já foi dispensado recentemente
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < dayInMs * 7) { // 7 dias
          return false;
        }
      }
      
      return true;
    };

    // Mostrar prompt para iOS após um delay
    if (shouldShowiOSPrompt()) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // Mostrar após 3 segundos
      
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar a PWA');
      } else {
        console.log('Usuário rejeitou instalar a PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erro ao tentar instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Salvar no localStorage baseado no tipo de dispositivo
    const dismissKey = isIOS ? 'ios-install-dismissed' : 'pwa-install-dismissed';
    localStorage.setItem(dismissKey, Date.now().toString());
  };

  // Não mostrar se já estiver instalado
  if (isInstalled) {
    return null;
  }

  // Não mostrar se não houver prompt E não for iOS
  if (!showInstallPrompt || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // Componente para iOS
  const IOSInstallPrompt = () => (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              📱 Adicionar à Tela Inicial
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-2">
              Para melhor experiência, adicione F1 Analytics à sua tela inicial:
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span>1️⃣</span>
                <span>Toque no botão de compartilhar</span>
                <span className="text-blue-500">⬆️</span>
              </div>
              <div className="flex items-center gap-2">
                <span>2️⃣</span>
                <span>Selecione "Adicionar à Tela Inicial"</span>
                <span>➕</span>
              </div>
              <div className="flex items-center gap-2">
                <span>3️⃣</span>
                <span>Confirme tocando em "Adicionar"</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );

  // Se for iOS, mostrar prompt personalizado
  if (isIOS) {
    return <IOSInstallPrompt />;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Instalar F1 Analytics
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Adicione à tela inicial para acesso rápido e experiência offline
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
          >
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook para verificar se é PWA
export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isNavigatorStandalone);
    };

    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    checkPWAStatus();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { isInstalled, isInstallable };
};

export default PWAInstallPrompt;
