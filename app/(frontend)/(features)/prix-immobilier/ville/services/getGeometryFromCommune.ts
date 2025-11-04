import { prisma } from "@/app/(frontend)/libs/prisma";
import { validateGeoJSONGeometry } from "@/app/(frontend)/utils/validateGeoJSONGeometry";

export async function getGeometryFromCommune(codeCommune: string) {
  try {
    const [geometrie] = await prisma.$queryRaw<{ geojson: string | null }[]>`
        SELECT ST_AsGeoJSON(geometrie) as geojson FROM "Commune" WHERE code_commune = ${codeCommune};
    `;
    
    // Si la géométrie est null ou undefined, retourner null directement
    if (!geometrie?.geojson) {
      return null;
    }
    
    const validGeometry = validateGeoJSONGeometry(geometrie.geojson);
    return validGeometry;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commune:", error);
    return null;
  }
}
