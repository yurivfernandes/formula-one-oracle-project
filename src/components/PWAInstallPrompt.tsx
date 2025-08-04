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
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar dispositivo móvel e iOS
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screenWidth = window.innerWidth <= 768;
      
      // Mais agressivo na detecção mobile
      const finalMobile = mobile || isTouch || screenWidth;
      
      setIsMobile(finalMobile);
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
      
      console.log('PWA foi instalada com sucesso!');
    };

    // Para iOS, mostrar instruções personalizadas
    const shouldShowiOSPrompt = () => {
      if (!isIOS) return false;
      if (isInstalled) return false;
      
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const dayInMs = 24 * 60 * 60 * 1000;
        // Reduzir tempo para 1 dia para teste
        if (Date.now() - dismissedTime < dayInMs * 1) { 
          return false;
        }
      }
      
      return true;
    };

    const shouldShowMobilePrompt = () => {
      if (isInstalled) return false;
      if (!isMobile) return false;
      if (isIOS) return false;
      
      const dismissed = localStorage.getItem('mobile-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const dayInMs = 24 * 60 * 60 * 1000;
        // Reduzir tempo para 1 dia para teste
        if (Date.now() - dismissedTime < dayInMs * 1) { 
          return false;
        }
      }
      
      return true;
    };

    // Mostrar prompt para desktop também (se não instalado)
    const shouldShowDesktopPrompt = () => {
      if (isInstalled) return false;
      if (isMobile) return false;
      
      const dismissed = localStorage.getItem('desktop-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const dayInMs = 24 * 60 * 60 * 1000;
        // Reduzir tempo para 1 dia para teste
        if (Date.now() - dismissedTime < dayInMs * 1) { 
          return false;
        }
      }
      
      return true;
    };

    // Mostrar prompt após interação do usuário
    if (shouldShowiOSPrompt() || shouldShowMobilePrompt() || shouldShowDesktopPrompt()) {
      let interactionDetected = false;
      
      const showPromptAfterInteraction = () => {
        if (interactionDetected) return;
        interactionDetected = true;
        
        // Mostrar após 2 segundos de interação (mais rápido)
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 2000);
      };

      // Detectar várias formas de interação
      const events = ['scroll', 'click', 'touchstart', 'keydown'];
      events.forEach(event => {
        window.addEventListener(event, showPromptAfterInteraction, { once: true });
      });
      
      // Fallback: mostrar após 10 segundos se não houver interação (mais rápido)
      const fallbackTimer = setTimeout(() => {
        if (!interactionDetected) {
          setShowInstallPrompt(true);
        }
      }, 10000);
      
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, showPromptAfterInteraction);
        });
        clearTimeout(fallbackTimer);
      };
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    // Se tem o prompt nativo do Android, usar ele
    if (deferredPrompt) {
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
    } else {
      // Se não tem prompt nativo, mostrar instruções
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowInstructions(false);
    // Salvar no localStorage baseado no tipo de dispositivo
    let dismissKey = 'mobile-install-dismissed';
    if (isIOS) {
      dismissKey = 'ios-install-dismissed';
    } else if (!isMobile) {
      dismissKey = 'desktop-install-dismissed';
    }
    localStorage.setItem(dismissKey, Date.now().toString());
  };

  // Não mostrar se já estiver instalado
  if (isInstalled) {
    return null;
  }

  // Mostrar para qualquer dispositivo se não estiver instalado
  if (!showInstallPrompt) {
    return null;
  }

  // Se estiver mostrando instruções, mostrar o modal
  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🏎️ Instalar F1 Analytics
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Para instalar o app na sua tela inicial:
            </p>
            
            {isIOS ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                  <span>Toque no botão <strong>Compartilhar</strong> ⬆️</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                  <span>Selecione <strong>"Adicionar à Tela Inicial"</strong> ➕</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                  <span>Confirme tocando em <strong>"Adicionar"</strong></span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                  <span>Abra o menu do navegador <strong>(⋮)</strong></span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                  <span>Toque em <strong>"Adicionar à tela inicial"</strong></span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                  <span>Confirme a instalação</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6">
            <Button
              onClick={handleDismiss}
              className="w-full"
              variant="outline"
            >
              Entendi! 👍
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Botão vermelho simples
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInstallClick}
        className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Instalar App
      </Button>
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
