import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PitsProvider } from "@/context/PitsContext";
import AppLayout from "@/components/AppLayout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Modulo1 = lazy(() => import("@/pages/Modulo1"));
const Modulo2 = lazy(() => import("@/pages/Modulo2"));
const Modulo3 = lazy(() => import("@/pages/Modulo3"));
const Modulo4 = lazy(() => import("@/pages/Modulo4"));
const IPSEPage = lazy(() => import("@/pages/IPSEPage"));
const Simulador = lazy(() => import("@/pages/Simulador"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PitsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center p-12 text-muted-foreground">Carregando aplicação...</div>}>
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
          </Suspense>
        </BrowserRouter>
      </PitsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
