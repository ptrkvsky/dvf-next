import type { CommunesLimitrophes } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/CommunesLimnitrophes";
import type { RefObject } from "react";
import { createGeoJSONLayer } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/createGeoJSONLayer";
import { useEffect } from "react";

type Props = {
  mapInstanceRef: RefObject<L.Map | null>;
  communesLimitrophes: CommunesLimitrophes[] | undefined;
  map: L.Map | null;
};

/**
 * Hook permettant d'ajouter les communes limitrophes sous forme de calques GeoJSON sur une carte Leaflet.
 *
 * @param {object} props - Les paramètres du hook.
 * @param {RefObject<L.Map | null>} props.mapInstanceRef - Référence vers l'instance de la carte Leaflet.
 * @param {CommunesLimitrophes[] | undefined} props.communesLimitrophes - Liste des communes limitrophes à afficher.
 * @param {L.Map} props.map - Instance actuelle de la carte Leaflet.
 */
export function useLimitrophesLayers({
  mapInstanceRef,
  communesLimitrophes,
  map,
}: Props) {
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !communesLimitrophes ||
      communesLimitrophes.length === 0
    ) {
      return;
    }

    communesLimitrophes.forEach((communeLim) => {
      const layer = createGeoJSONLayer(
        {
          geojson: communeLim.geometrie,
          code_commune: communeLim.codeCommune,
        },
        "blue",
        1,
        0.1
      );
      layer?.addTo(map);
    });
  }, [mapInstanceRef, communesLimitrophes, map]);
}
