import { getCommunesLimitrophes } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getCommunesLimitrophes";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook personnalisé pour récupérer les communes limitrophes d'une commune donnée
 *
 * @param codeCommune - Le code INSEE de la commune
 * @returns Un objet query contenant les données des communes limitrophes et l'état de la requête
 *
 * @remarks
 * Utilise React Query pour gérer le cache et l'état de la requête.
 * Les données sont mises en cache indéfiniment et ne sont pas actualisées automatiquement.
 */
export default function useCommunesLimitrophes(codeCommune: string) {
  const query = useQuery({
    queryKey: ["communes-limitrophes", codeCommune],
    queryFn: async () => getCommunesLimitrophes(codeCommune),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  return query;
}
