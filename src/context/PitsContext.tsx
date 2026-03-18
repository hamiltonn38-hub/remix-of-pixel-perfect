import React, { createContext, useContext, useState, useEffect } from "react";
import { Municipio, municipios } from "@/data/mockData";
import { getMunicipioIBGE } from "@/lib/ibgeApi";

interface PitsContextType {
  selectedMunicipio: Municipio;
  setSelectedMunicipio: (m: Municipio) => void;
  allMunicipios: Municipio[];
  ibgeData: Record<string, { populacao?: number | null; area_km2?: number | null; mesorregiao?: string }>;
  ibgeLoading: boolean;
}

const PitsContext = createContext<PitsContextType | null>(null);

export function PitsProvider({ children }: { children: React.ReactNode }) {
  const [selectedMunicipio, setSelectedMunicipio] = useState(municipios[0]);
  const [ibgeData, setIbgeData] = useState<PitsContextType["ibgeData"]>({});
  const [ibgeLoading, setIbgeLoading] = useState(false);

  // Fetch IBGE data for selected municipality
  useEffect(() => {
    const m = selectedMunicipio;
    if (ibgeData[m.municipio]) return;

    let cancelled = false;
    setIbgeLoading(true);

    getMunicipioIBGE(m.municipio, m.estado)
      .then((data) => {
        if (cancelled || !data) return;
        setIbgeData((prev) => ({
          ...prev,
          [m.municipio]: {
            populacao: data.populacao,
            area_km2: data.area_km2,
            mesorregiao: data.mesorregiao,
          },
        }));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIbgeLoading(false); });

    return () => { cancelled = true; };
  }, [selectedMunicipio, ibgeData]);

  return (
    <PitsContext.Provider value={{ selectedMunicipio, setSelectedMunicipio, allMunicipios: municipios, ibgeData, ibgeLoading }}>
      {children}
    </PitsContext.Provider>
  );
}

export function usePits() {
  const ctx = useContext(PitsContext);
  if (!ctx) throw new Error("usePits must be used within PitsProvider");
  return ctx;
}
