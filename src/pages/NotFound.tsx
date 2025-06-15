import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex flex-col flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-700">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
          <a href="/" className="text-red-600 hover:text-red-700 underline">
            Voltar à Home
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
