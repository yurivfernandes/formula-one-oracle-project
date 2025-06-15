
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
    <nav className="bg-black/50 backdrop-blur-sm border-b border-red-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <Flag className="h-8 w-8 text-red-500 mr-3 group-hover:scale-110 transition-all" />
              <span className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">F1 Analytics</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {NAV_LINKS.map(nav => (
              <Link
                key={nav.to}
                to={nav.to}
                className={`${
                  location.pathname.startsWith(nav.to)
                    ? "text-red-400"
                    : "text-white hover:text-red-400"
                } transition-colors font-medium`}
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
