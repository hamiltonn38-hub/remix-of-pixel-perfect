import { useQuery } from "@tanstack/react-query";
import { fetchAlertasMunicipio } from "@/lib/mapbiomasAlertaApi";

export function useAlertasData(codigoIBGE: string | undefined) {
  return useQuery({
    queryKey: ["mapbiomasAlertas", codigoIBGE],
    queryFn: async () => {
      if (!codigoIBGE) return [];
      return fetchAlertasMunicipio(codigoIBGE);
    },
    enabled: !!codigoIBGE, // only run if we have an IBGE code
    staleTime: 1000 * 60 * 30, // 30 mins
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
