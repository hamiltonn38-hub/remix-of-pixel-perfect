import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PitsProvider } from "@/context/PitsContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Modulo1 from "@/pages/Modulo1";
import Modulo2 from "@/pages/Modulo2";
import Modulo3 from "@/pages/Modulo3";
import Modulo4 from "@/pages/Modulo4";
import IPSEPage from "@/pages/IPSEPage";
import Simulador from "@/pages/Simulador";
import Relatorios from "@/pages/Relatorios";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PitsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/modulo-1" element={<Modulo1 />} />
              <Route path="/modulo-2" element={<Modulo2 />} />
              <Route path="/modulo-3" element={<Modulo3 />} />
              <Route path="/modulo-4" element={<Modulo4 />} />
              <Route path="/ipse" element={<IPSEPage />} />
              <Route path="/simulador" element={<Simulador />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PitsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
