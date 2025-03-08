import { getTransactionsWithStatsByCodeCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getTransactionsWithStatsByCodeCommune";
import { useQuery } from "@tanstack/react-query";

export function useTransactions(codeCommune: string) {
  const query = useQuery({
    queryKey: ["transactions", codeCommune],
    queryFn: async () => getTransactionsWithStatsByCodeCommune(codeCommune),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  return query;
}
