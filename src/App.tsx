import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Championship from "./pages/Championship";
import Prediction from "./pages/Prediction";
import RaceSimulation from "./pages/RaceSimulation";
import RaceWeekend from "./pages/RaceWeekend";
import NotFound from "./pages/NotFound";
import LiveTimingPage from "./pages/LiveTiming";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/championship" element={<Championship />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/simulation" element={<RaceSimulation />} />
          <Route path="/race-weekend" element={<RaceWeekend />} />
          <Route path="/race-weekend/live" element={<LiveTimingPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
