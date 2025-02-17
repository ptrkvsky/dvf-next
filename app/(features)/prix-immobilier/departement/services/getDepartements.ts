import { prisma } from "@/app/libs/prisma";

export async function getDepartements(take = 10) {
  try {
    const regions = await prisma.departement.findMany({
      select: {
        code_departement: true,
        code_region: true,
        nom_departement: true,
      },
      orderBy: {
        nom_departement: "asc",
      },
      take,
    });
    return regions;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des départements:", error);
    return [];
  }
}
