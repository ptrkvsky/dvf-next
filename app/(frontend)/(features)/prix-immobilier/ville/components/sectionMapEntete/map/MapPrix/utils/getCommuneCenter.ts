import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import type { Commune } from "@prisma/client";

/** 🔹 Récupère le centre approximatif d'une commune */
export function getCommuneCenter(
  commune: Commune,
  geometrie: GeoJSONGeometry | null
): [number, number] {
  try {
    if (!geometrie) {
      // Géométrie manquante : normal si les données GeoJSON ne sont pas encore importées
      // Utilisation du centre par défaut (Alpes-Maritimes)
      return [43.7, 7.2];
    }

    let coordinates: [number, number][] = [];

    if (geometrie.type === "Polygon") {
      coordinates = geometrie.coordinates[0]; // Outer ring of the polygon
    } else if (geometrie.type === "MultiPolygon") {
      coordinates = geometrie.coordinates[0][0]; // Outer ring of the first polygon
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      // Coordonnées invalides : utilisation du centre par défaut
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
