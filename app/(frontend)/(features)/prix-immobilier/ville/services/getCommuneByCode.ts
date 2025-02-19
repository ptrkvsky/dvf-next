import { prisma } from "@/app/(frontend)/libs/prisma";

export async function getCommuneByCode(codeCommune: string) {
  try {
    const commune = await prisma.commune.findUnique({
      where: {
        code_commune: codeCommune,
      },
    });
    return commune;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commune:", error);
    return null;
  }
}
