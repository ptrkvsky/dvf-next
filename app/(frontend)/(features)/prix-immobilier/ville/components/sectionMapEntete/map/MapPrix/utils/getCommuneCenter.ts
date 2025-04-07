import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import type { Commune } from "@prisma/client";

/** 🔹 Récupère le centre approximatif d'une commune */
export function getCommuneCenter(
  commune: Commune,
  geometrie: GeoJSONGeometry | null
): [number, number] {
  try {
    if (!geometrie) {
      console.warn(
        `⚠️ 'geometrie' est undefined pour la commune ${commune.code_commune}`
      );
      return [43.7, 7.2]; // Valeur par défaut en cas d'erreur
    }

    let coordinates: [number, number][] = [];

    if (geometrie.type === "Polygon") {
      coordinates = geometrie.coordinates[0]; // Outer ring of the polygon
    } else if (geometrie.type === "MultiPolygon") {
      coordinates = geometrie.coordinates[0][0]; // Outer ring of the first polygon
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      console.warn(
        `⚠️ Coordonnées invalides pour la commune ${commune.code_commune}`
      );
      return [43.7, 7.2];
    }

    // Calcul du centre des coordonnées
    const [lonSum, latSum] = coordinates.reduce(
      ([lon, lat], [currLon, currLat]) => [lon + currLon, lat + currLat],
      [0, 0]
    );

    return [latSum / coordinates.length, lonSum / coordinates.length];
  } catch (error) {
    console.error(
      `❌ Erreur récupération centre GeoJSON pour la commune ${commune.code_commune}:`,
      error
    );
    return [43.7, 7.2]; // Valeur par défaut en cas d'erreur
  }
}
