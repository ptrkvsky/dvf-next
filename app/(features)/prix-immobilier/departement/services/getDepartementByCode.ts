import { prisma } from '@/app/libs/prisma';

export async function getDepartementByCode(codeDepartement: string) {
  try {
    const departement = await prisma.departement.findUnique({
      where: {
        code_departement: codeDepartement,
      },
    });
    return departement;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du département:', error);
    return null;
  }
}
