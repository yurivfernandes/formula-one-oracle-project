import { Button } from "@/components/ui/button";
import { Share2, Heart, Users, Zap } from "lucide-react";

const ShareSection = () => {
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
        // Fallback para navegadores que não suportam Web Share API
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
      // Fallback: copia para clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copiado para a área de transferência!');
      } catch (clipboardError) {
        console.log('Erro ao copiar:', clipboardError);
      }
    }
  };

  return (
    <section className="bg-gradient-to-br from-red-600 to-red-800 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Compartilhe a Paixão pela F1! 🏎️
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Seus amigos também merecem ter acesso às melhores análises e previsões da Fórmula 1. 
            Espalhe a emoção das corridas!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <Heart className="h-8 w-8 text-red-200 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Para Fanáticos</h3>
            <p className="text-red-100 text-sm">
              Perfeito para amigos que vivem e respiram F1
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <Zap className="h-8 w-8 text-red-200 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Dados em Tempo Real</h3>
            <p className="text-red-100 text-sm">
              Análises que impressionam até os experts
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <Share2 className="h-8 w-8 text-red-200 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Fácil de Usar</h3>
            <p className="text-red-100 text-sm">
              Interface intuitiva para todos os níveis
            </p>
          </div>
        </div>

        <Button 
          onClick={handleShare}
          size="lg"
          className="bg-white text-red-600 hover:bg-gray-100 shadow-lg text-lg px-8 py-3"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Compartilhar F1 Analytics
        </Button>
        
        <p className="text-red-200 text-sm mt-4">
          Ajude-nos a crescer a comunidade de fãs da F1! 🏆
        </p>
      </div>
    </section>
  );
};

export default ShareSection;
