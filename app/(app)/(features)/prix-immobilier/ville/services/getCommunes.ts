import { prisma } from "@/app/(app)/libs/prisma";

export async function getCommunes(take = 1) {
  try {
    const regions = await prisma.commune.findMany({
      select: {
        nom_commune: true,
        code_commune: true,
      },
      orderBy: {
        nom_commune: "asc",
      },
      take,
    });
    return regions;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des communes:", error);
    return [];
  }
}
