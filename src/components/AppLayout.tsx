import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import MunicipioSelector from "@/components/MunicipioSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="lg:hidden w-10" /> {/* spacer for mobile menu */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <MunicipioSelector />
            <ThemeToggle />
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
