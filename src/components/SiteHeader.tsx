
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/championship", label: "Campeonato", shortLabel: "Camp." },
  { to: "/prediction", label: "Predição", shortLabel: "Pred." },
  { to: "/race-weekend", label: "Próximo GP", shortLabel: "GP" }
];

export default function SiteHeader() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-red-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link to="/" className="flex items-center group" aria-label="Home">
            <img 
              src="/Logo F1 Analytics.svg" 
              alt="F1 Analytics Logo" 
              className="h-8 sm:h-10 w-auto group-hover:scale-110 transition-all duration-300" 
            />
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {NAV_LINKS.map(nav => (
              <Link
                key={nav.to}
                to={nav.to}
                className={`px-2 py-1 rounded text-xs sm:text-base ${
                  location.pathname.startsWith(nav.to)
                    ? "text-red-600 font-semibold bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                } transition-colors`}
              >
                <span className="hidden sm:inline">{nav.label}</span>
                <span className="sm:hidden">{nav.shortLabel}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
