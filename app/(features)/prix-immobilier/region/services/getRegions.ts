import fs from "node:fs/promises";
import path from "node:path";
import { RegionsSchema } from "@/app/(features)/prix-immobilier/region/types/region";

// export async function getRegions(take = 1) {
//   try {
//     const regions = await prisma.region.findMany({
//       select: {
//         nom_region: true,
//         code_region: true,
//       },
//       orderBy: {
//         nom_region: "asc",
//       },
//       take,
//     });
//     return regions;
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des régions:", error);
//     return [];
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function getRegions() {
  try {
    // Lire le fichier JSON
    const filePath = path.join(process.cwd(), "public", "data", "regions.json");
    const data = await fs.readFile(filePath, "utf-8");
    const regions = JSON.parse(data);

    const parsed = RegionsSchema.safeParse(regions);

    if (!parsed.success) {
      console.error(
        "❌ Erreur de validation des régions:",
        parsed.error.format()
      );
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des régions:", error);
    return [];
  }
}
