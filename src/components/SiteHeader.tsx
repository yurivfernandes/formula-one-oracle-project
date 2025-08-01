
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/championship", label: "Campeonato" },
  { to: "/prediction", label: "Predição" },
  { to: "/race-weekend", label: "Próximo GP" }
];

export default function SiteHeader() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-red-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center group" aria-label="Home">
            <img 
              src="/Logo F1 Analytics.svg" 
              alt="F1 Analytics Logo" 
              className="h-10 w-auto group-hover:scale-110 transition-all duration-300" 
            />
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
