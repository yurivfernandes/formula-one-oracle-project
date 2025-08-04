import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, TrendingUp, Calendar, Zap, X } from "lucide-react";

const ShareAppDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // Para testar, descomente a linha abaixo
    localStorage.removeItem('hasSeenShareDialog');
    
    const hasSeenShareDialog = localStorage.getItem('hasSeenShareDialog');
    console.log('ShareAppDialog - hasSeenShareDialog:', hasSeenShareDialog);
    
    if (!hasSeenShareDialog) {
      console.log('ShareAppDialog - Vai mostrar popup em 3 segundos');
      const showTimer = setTimeout(() => {
        console.log('ShareAppDialog - Mostrando popup agora');
        setIsOpen(true);
        
        // Só permite fechar após mais 3 segundos
        const closeTimer = setTimeout(() => {
          console.log('ShareAppDialog - Agora pode fechar');
          setCanClose(true);
        }, 3000);
      }, 3000);
      
      return () => clearTimeout(showTimer);
    } else {
      console.log('ShareAppDialog - Popup já foi visto antes');
    }
  }, []);

  const handleClose = () => {
    if (!canClose) {
      console.log('ShareAppDialog - Tentou fechar mas ainda não pode');
      return;
    }
    console.log('ShareAppDialog - Fechando popup');
    setIsOpen(false);
    localStorage.setItem('hasSeenShareDialog', 'true');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'F1 Analytics - Análise Completa de Fórmula 1',
      text: '🏎️ Descobri este app incrível de F1! Previsões de corrida, análises de desempenho, dados históricos e muito mais! 🏆',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copiado para a área de transferência!');
      } catch (clipboardError) {
        console.log('Erro ao copiar:', clipboardError);
      }
    }

    handleClose();
  };

  const features = [
    { icon: Trophy, text: "Previsões inteligentes de corridas" },
    { icon: TrendingUp, text: "Análises de desempenho em tempo real" },
    { icon: Calendar, text: "Calendário completo da temporada" },
    { icon: Zap, text: "Dados históricos detalhados" }
  ];

  console.log('ShareAppDialog - Renderizando, isOpen:', isOpen, 'canClose:', canClose);

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? handleClose : undefined}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => {
          if (!canClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!canClose) e.preventDefault();
        }}
      >
        <DialogHeader className="relative">
          {canClose && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Share2 className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center text-red-700">
            🏎️ Compartilhe com seus amigos! 🏆
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Você está curtindo o <span className="font-bold text-red-600">F1 Analytics</span>? 
            Que tal compartilhar essa experiência incrível com seus amigos fanáticos por F1!
          </p>

          <div className="bg-red-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-red-700 text-sm">O que torna nosso app especial:</h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <feature.icon className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleShare}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button 
              variant="outline"
              onClick={handleClose}
              className="border-gray-300"
              disabled={!canClose}
            >
              {canClose ? 'Depois' : 'Aguarde...'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAppDialog;
