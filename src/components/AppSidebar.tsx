import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Leaf, Recycle, Users, BarChart3,
  Gauge, SlidersHorizontal, FileText, Menu, X, Droplets,
} from "lucide-react";
import SobreModal from "@/components/SobreModal";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/modulo-1", label: "I — Biofísico-Ecológico", icon: Leaf },
  { path: "/modulo-2", label: "II — Integração Produtiva", icon: Recycle },
  { path: "/modulo-3", label: "III — Governança Participativa", icon: Users },
  { path: "/modulo-4", label: "IV — Monitoramento", icon: BarChart3 },
  { path: "/ipse", label: "IPSE", icon: Gauge },
  { path: "/simulador", label: "Simulador de Cenários", icon: SlidersHorizontal },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
];

export default function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-sidebar text-sidebar-foreground p-2 rounded-lg shadow-lg"
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Header */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Droplets className="text-sidebar-primary" size={28} />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">PITS</h1>
              <p className="text-[10px] text-sidebar-foreground/60 leading-tight">
                Plataforma de Inteligência<br />Territorial Socioenergética
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <SobreModal />
          <p className="text-[10px] text-sidebar-foreground/30 mt-2">Framework HAMILTON • FUNDECI/2025.0016</p>
        </div>
      </aside>
    </>
  );
}
