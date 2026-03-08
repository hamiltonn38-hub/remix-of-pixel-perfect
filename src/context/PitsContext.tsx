import React, { createContext, useContext, useState } from "react";
import { Municipio, municipios } from "@/data/mockData";

interface PitsContextType {
  selectedMunicipio: Municipio;
  setSelectedMunicipio: (m: Municipio) => void;
  allMunicipios: Municipio[];
}

const PitsContext = createContext<PitsContextType | null>(null);

export function PitsProvider({ children }: { children: React.ReactNode }) {
  const [selectedMunicipio, setSelectedMunicipio] = useState(municipios[0]);

  return (
    <PitsContext.Provider value={{ selectedMunicipio, setSelectedMunicipio, allMunicipios: municipios }}>
      {children}
    </PitsContext.Provider>
  );
}

export function usePits() {
  const ctx = useContext(PitsContext);
  if (!ctx) throw new Error("usePits must be used within PitsProvider");
  return ctx;
}
