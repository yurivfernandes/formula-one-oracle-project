
// Rodapé padrão para todas as telas — branco, detalhes em vermelho/cinza
import { Github, Linkedin, MessageCircle } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/championship", label: "Campeonato" },
  { to: "/prediction", label: "Predição" },
  { to: "/race-weekend", label: "Próximo GP" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-red-200 py-6 sm:py-8 mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-red-700 font-bold text-base sm:text-lg mb-3 sm:mb-4">F1 Analytics</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Análise completa dos dados da Fórmula 1 com previsões inteligentes para o campeonato mundial.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-red-700 font-bold text-base sm:text-lg mb-3 sm:mb-4">Links</h3>
            <div className="space-y-1 sm:space-y-2">
              {FOOTER_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.to}
                  className="block text-gray-500 hover:text-red-700 transition-colors text-xs sm:text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-red-700 font-bold text-base sm:text-lg mb-3 sm:mb-4">Desenvolvedor</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-2">
              Desenvolvido por <span className="text-red-700 font-semibold">Yuri Fernandes</span>
            </p>
            <div className="flex gap-3 mt-2 justify-center md:justify-start">
              <a
                href="https://wa.me/5531987798823"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-700 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a
                href="https://github.com/yurivfernandes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-700"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/yurianalistabi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-700"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-red-100 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2025 F1 Analytics. Dados e estatísticas da Fórmula 1.
          </p>
        </div>
      </div>
    </footer>
  );
}
