import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import L from "leaflet";

export function createGeoJSONLayer(
  data: { geojson: GeoJSONGeometry | null; code_commune: string },
  color: string,
  weight: number,
  fillOpacity: number
): L.GeoJSON | null {
  if (!data?.geojson) {
    console.warn("⚠️ Donnée GeoJSON manquante");
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
