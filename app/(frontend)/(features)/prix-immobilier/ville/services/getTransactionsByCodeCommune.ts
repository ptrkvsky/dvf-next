import type { Prisma, Transaction } from "@prisma/client";
import { prisma } from "@/app/(frontend)/libs/prisma";

export async function getTransactionsByCodeCommune(
  codeCommune: string,
  where: Omit<Prisma.TransactionWhereInput, "code_commune"> = {}
): Promise<Transaction[]> {
  return await prisma.transaction.findMany({
    where: { code_commune: codeCommune, ...where },
  });
}
