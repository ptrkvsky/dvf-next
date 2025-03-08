import type { FormattedStats } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/FormatedStats";
import type { Transaction } from "@prisma/client";
import { TransactionSchema } from "@/app/(frontend)/(features)/prix-immobilier/schemas/transaction";
import { FormattedStatsSchema } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/FormatedStats";
import { z } from "zod";

const TransactionsResponseSchema = z.object({
  transactions: z.array(TransactionSchema).transform((transactions) =>
    transactions.map((t) => ({
      ...t,
      date_mutation: new Date(t.date_mutation),
    }))
  ),
  stats: FormattedStatsSchema,
});

/** 🔹 Récupère les transactions immobilières */
export async function getTransactionsWithStatsByCodeCommune(
  code_commune: string
): Promise<{
  transactions: Transaction[];
  stats: FormattedStats;
}> {
  try {
    const res = await fetch(
      `/api/transactions?code_commune=${code_commune}&limit=1000`
    );
    if (!res.ok) throw new Error("Échec récupération transactions");
    const data = await res.json();

    const parsedData = TransactionsResponseSchema.parse(data);
    return parsedData;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des transactions:", error);
    throw new Error("Échec récupération transactions");
  }
}
