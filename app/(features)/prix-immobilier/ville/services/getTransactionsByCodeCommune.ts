import { prisma } from '@/app/libs/prisma';

export async function getTransactionsByCodeCommune(codeCommune: string) {
  return await prisma.transaction.findMany({
    where: { code_commune: codeCommune },
    select: {
      latitude: true,
      longitude: true,
      valeur_fonciere: true,
      surface_reelle_bati: true,
      nombre_pieces_principales: true,
    },
  });
}
