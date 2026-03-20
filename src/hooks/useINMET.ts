import { useQuery } from "@tanstack/react-query";
import { getEstacaoMaisProxima, getChuvaHistorica } from "@/lib/inmetApi";

export function useInmetData(lat: number | undefined | null, lng: number | undefined | null, uf: string) {
  return useQuery({
    queryKey: ["inmet", lat, lng, uf],
    queryFn: async () => {
      if (!lat || !lng || !uf) return null;
      
      const estacao = await getEstacaoMaisProxima(lat, lng, uf);
      if (!estacao) {
        throw new Error("Nenhuma estação climatológica próxima encontrada.");
      }

      // Fetch history for the last 6 years
      const currentYear = new Date().getFullYear();
      const historico = await getChuvaHistorica(estacao.CD_ESTACAO, currentYear - 5, currentYear);
      return { estacao, historico };
    },
    enabled: typeof lat === 'number' && typeof lng === 'number' && typeof uf === 'string',
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
