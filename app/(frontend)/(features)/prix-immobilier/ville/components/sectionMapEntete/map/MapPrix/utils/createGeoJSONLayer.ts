import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import L from "leaflet";

export function createGeoJSONLayer(
  data: { geojson: GeoJSONGeometry | null; code_commune: string },
  color: string,
  weight: number,
  fillOpacity: number
): L.GeoJSON | null {
  if (!data?.geojson) {
    // GeoJSON manquant : normal si les données ne sont pas encore importées
    return null;
  }

  return L.geoJSON(data.geojson, {
    style: {
      color,
      weight: weight * 2,
      opacity: 0.8,
      fillOpacity,
    },
  });
}
