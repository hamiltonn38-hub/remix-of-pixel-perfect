import { useQuery } from "@tanstack/react-query";
import { getMunicipioIBGE } from "@/lib/ibgeApi";

export function useIbgeData(municipio: string, estado: string) {
  return useQuery({
    queryKey: ["ibge", municipio, estado],
    queryFn: () => getMunicipioIBGE(municipio, estado),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (IBGE data doesn't change often)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
