import { prisma } from "@/app/(frontend)/libs/prisma";
import { validateGeoJSONGeometry } from "@/app/(frontend)/utils/validateGeoJSONGeometry";

export async function getGeometryFromCommune(codeCommune: string) {
  try {
    const [geometrie] = await prisma.$queryRaw<{ geojson: string }[]>`
        SELECT ST_AsGeoJSON(geometrie) as geojson FROM "Commune" WHERE code_commune = ${codeCommune};
    `;
    const validGeometry = validateGeoJSONGeometry(geometrie?.geojson);
    if (!validGeometry) return null;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commune:", error);
    return null;
  }
}
