import { GeoJSONGeometrySchema } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import { prisma } from "@/app/(frontend)/libs/prisma";

export async function getGeometryFromCommune(codeCommune: string) {
  try {
    const [geometrie] = await prisma.$queryRaw<{ geojson: string }[]>`
  SELECT ST_AsGeoJSON(geometrie) as geojson FROM "Commune" WHERE code_commune = ${codeCommune};`;
    const geojson = JSON.parse(geometrie?.geojson);

    const parsedGeojson = GeoJSONGeometrySchema.parse(geojson);
    if (!parsedGeojson) {
      console.error(
        "❌ Erreur lors de la récupération de la géométrie:",
        parsedGeojson
      );
      return null;
    }

    const validGeometry = GeoJSONGeometrySchema.safeParse(parsedGeojson);
    if (!validGeometry.success) {
      console.error(
        "❌ Erreur lors de la validation de la géométrie:",
        validGeometry.error
      );
      return null;
    }

    return validGeometry.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commune:", error);
    return null;
  }
}
