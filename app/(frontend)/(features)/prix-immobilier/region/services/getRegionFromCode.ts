import { prisma } from "@/app/(frontend)/libs/prisma";

export async function getRegionFromCode(codeRegion: string) {
  try {
    const region = await prisma.region.findUnique({
      where: {
        code_region: codeRegion,
      },
      select: {
        nom_region: true,
        code_region: true,
      },
    });
    return region;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la région:", error);
    return null;
  }
}
