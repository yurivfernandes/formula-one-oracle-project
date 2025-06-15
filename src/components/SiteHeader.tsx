
// Cabeçalho padrão para todas as telas — branco com detalhes em vermelho e cinza
import { Flag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/championship", label: "Campeonato" },
  { to: "/prediction", label: "Predição" },
  { to: "/race-weekend", label: "GP do Canadá" }
];

export default function SiteHeader() {
  const location = useLocation();
  return (
    <nav className="bg-white border-b border-red-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Flag className="h-8 w-8 text-red-600 group-hover:scale-110 transition-all" />
            <span className="text-2xl font-bold text-red-700 group-hover:text-red-500 transition-colors">
              F1 Analytics
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {NAV_LINKS.map(nav => (
              <Link
                key={nav.to}
                to={nav.to}
                className={`px-2 py-1 rounded text-base ${
                  location.pathname.startsWith(nav.to)
                    ? "text-red-600 font-semibold bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                } transition-colors`}
              >
                {nav.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
