import type { Transaction } from "@prisma/client";
import { getColorForPrice } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/getColorForPrice";
import L from "leaflet";

export function createClusterLayer(
  transactions: Transaction[],
  priceThreshold: number[]
) {
  // @ts-expect-error - Type des plugins Leaflet
  const markers = L.markerClusterGroup({
    maxClusterRadius: 50,
    disableClusteringAtZoom: 17,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction(cluster: { getAllChildMarkers: () => any }) {
      const markers = cluster.getAllChildMarkers();
      const prixM2Liste = markers
        .map((marker: { options: { prixM2: any } }) => marker.options.prixM2)
        .filter((p: number) => p > 0);

      if (prixM2Liste.length === 0) return L.divIcon();

      const prixMoyenM2 =
        prixM2Liste.reduce((sum: any, price: any) => sum + price, 0) /
        prixM2Liste.length;
      const couleur = getColorForPrice(prixMoyenM2);

      return L.divIcon({
        html: `<div style="background-color: ${couleur}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 50%;">${Math.round(prixMoyenM2 / 1000)}k</div>`,
        className: "price-cluster",
        iconSize: [40, 40],
      });
    },
  });

  transactions.forEach((t) => {
    const prixM2 = t.surface_reelle_bati
      ? t.valeur_fonciere / t.surface_reelle_bati
      : 0;

    if (prixM2 < priceThreshold[0] || prixM2 > priceThreshold[1]) {
      return;
    }

    const couleur = getColorForPrice(prixM2);

    const icon = L.divIcon({
      className: "price-marker",
      iconSize: [30, 30],
      html: `<div style="background-color: ${couleur}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 50%; font-size: 12px;">${Math.round(prixM2 / 1000)}k</div>`,
    });

    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0; padding-bottom: 8px; border-bottom: 1px solid #ddd; text-align: center;">
          Prix: ${Math.round(prixM2).toLocaleString("fr-FR")} €/m²
        </h3>
        <p style="margin: 8px 0;">${t.type_local} - ${Math.round(t.surface_reelle_bati ?? 0)} m²</p>
        <p style="margin: 8px 0; font-weight: bold;">Montant total: ${Math.round(t.valeur_fonciere).toLocaleString("fr-FR")} €</p>
      </div>
    `;

    const markerOptions = {
      icon,
      prixM2,
    } as L.MarkerOptions;

    const marker = L.marker(
      [t.latitude ?? 0, t.longitude ?? 0],
      markerOptions
    ).bindPopup(popupContent);

    markers.addLayer(marker);
  });

  return markers;
}
