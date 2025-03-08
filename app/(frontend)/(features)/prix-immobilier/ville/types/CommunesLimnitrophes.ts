import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";

export type CommunesLimitrophes = {
  codeCommune: string;
  geometrie: GeoJSONGeometry;
};
