import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import { GeoJSONGeometrySchema } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";

/**
 * ✅ Parses and validates a GeoJSON geometry object using Zod.
 * @param geojsonString The raw GeoJSON object.
 * @returns Valid GeoJSONGeometry or null if validation fails.
 */
export function validateGeoJSONGeometry(
  geojsonString: string
): GeoJSONGeometry | null {
  try {
    const geojson = JSON.parse(geojsonString);
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
    console.error("❌ Erreur inattendue lors du parsing GeoJSON:", error);
    return null;
  }
}
