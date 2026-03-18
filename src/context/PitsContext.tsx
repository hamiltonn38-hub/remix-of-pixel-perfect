import React, { createContext, useContext, useState, useEffect } from "react";
import { Municipio, municipios } from "@/data/mockData";
import { getMunicipioIBGE } from "@/lib/ibgeApi";
import { getEstacaoMaisProxima, getChuvaHistorica, EstacaoINMET, AgregadoAnualINMET } from "@/lib/inmetApi";

interface PitsContextType {
  selectedMunicipio: Municipio;
  setSelectedMunicipio: (m: Municipio) => void;
  allMunicipios: Municipio[];
  ibgeData: Record<string, { populacao?: number | null; area_km2?: number | null; mesorregiao?: string; latitude?: number | null; longitude?: number | null }>;
  ibgeLoading: boolean;
  inmetData: Record<string, { estacao?: EstacaoINMET; historico: AgregadoAnualINMET[] }>;
  inmetLoading: boolean;
}

const PitsContext = createContext<PitsContextType | null>(null);

export function PitsProvider({ children }: { children: React.ReactNode }) {
  const [selectedMunicipio, setSelectedMunicipio] = useState(municipios[0]);
  const [ibgeData, setIbgeData] = useState<PitsContextType["ibgeData"]>({});
  const [ibgeLoading, setIbgeLoading] = useState(false);
  const [inmetData, setInmetData] = useState<PitsContextType["inmetData"]>({});
  const [inmetLoading, setInmetLoading] = useState(false);

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
            latitude: data.latitude,
            longitude: data.longitude,
          },
        }));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIbgeLoading(false); });

    return () => { cancelled = true; };
  }, [selectedMunicipio, ibgeData]);

  // Fetch INMET data
  useEffect(() => {
    const m = selectedMunicipio;
    const ibge = ibgeData[m.municipio];
    
    // Check if we need to fetch INMET
    if (inmetData[m.municipio] || !ibge?.latitude || !ibge?.longitude) return;

    let cancelled = false;
    setInmetLoading(true);

    async function fetchINMET() {
      try {
        const estacao = await getEstacaoMaisProxima(ibge!.latitude!, ibge!.longitude!, m.estado);
        if (!estacao) {
          if (!cancelled) setInmetData(prev => ({ ...prev, [m.municipio]: { historico: [] } }));
          return;
        }

        const historico = await getChuvaHistorica(estacao.CD_ESTACAO, 2019, 2024);
        
        if (!cancelled) {
          setInmetData(prev => ({
            ...prev,
            [m.municipio]: { estacao, historico }
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setInmetLoading(false);
      }
    }

    fetchINMET();

    return () => { cancelled = true; };
  }, [selectedMunicipio, ibgeData, inmetData]);

  return (
    <PitsContext.Provider value={{ selectedMunicipio, setSelectedMunicipio, allMunicipios: municipios, ibgeData, ibgeLoading, inmetData, inmetLoading }}>
      {children}
    </PitsContext.Provider>
  );
}

export function usePits() {
  const ctx = useContext(PitsContext);
  if (!ctx) throw new Error("usePits must be used within PitsProvider");
  return ctx;
}
