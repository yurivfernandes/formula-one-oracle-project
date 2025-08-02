
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/championship", label: "Campeonato", shortLabel: "Camp." },
  { to: "/calendar", label: "Calendário", shortLabel: "Cal." },
  { to: "/race-weekend", label: "Próximo GP", shortLabel: "GP" },
  { to: "/prediction", label: "Predição", shortLabel: "Pred." }
];

export default function SiteHeader() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {NAV_LINKS.map(nav => (
              <Link
                key={nav.to}
                to={nav.to}
                className={`px-3 py-2 rounded text-base ${
                  location.pathname.startsWith(nav.to)
                    ? "text-red-600 font-semibold bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                } transition-colors`}
              >
                {nav.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-red-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAV_LINKS.map(nav => (
                <Link
                  key={nav.to}
                  to={nav.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname.startsWith(nav.to)
                      ? "text-red-600 bg-red-50"
                      : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                  } transition-colors`}
                >
                  {nav.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
