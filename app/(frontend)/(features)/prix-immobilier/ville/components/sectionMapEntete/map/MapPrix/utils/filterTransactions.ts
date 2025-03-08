import type { Transaction } from "@prisma/client";

export function filterTransactions(
  transactions: Transaction[],
  typeFiltre: string
): Transaction[] {
  return typeFiltre === "tous"
    ? transactions
    : transactions.filter(
        (t) => t.type_local && t.type_local.toLowerCase() === typeFiltre
      );
}
