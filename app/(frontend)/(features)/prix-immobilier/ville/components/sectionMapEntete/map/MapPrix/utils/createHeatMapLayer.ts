import type { Transaction } from "@prisma/client";
import { removeOutliers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/removeOutliers";
import L from "leaflet";

/**
 * Ajuste dynamiquement le rayon en fonction du zoom.
 * Moins d'étalement à faible zoom, plus à fort zoom.
 */
function getDynamicRadius(zoom: number): number {
  if (zoom < 10) return 5; // Zoom éloigné → petit radius
  if (zoom < 12) return 8;
  if (zoom < 14) return 12;
  if (zoom < 16) return 18;
  return 25; // Zoom très proche → grand radius
}

/**
 * Ajuste dynamiquement le flou en fonction du zoom.
 */
function getDynamicBlur(zoom: number): number {
  if (zoom < 10) return 3; // Moins de flou pour zoom éloigné
  if (zoom < 12) return 5;
  if (zoom < 14) return 8;
  if (zoom < 16) return 12;
  return 15; // Plus de flou quand zoomé pour adoucir l'affichage
}

export function createHeatmapLayer(map: L.Map, transactions: Transaction[]) {
  const prices = transactions
    .map((t) =>
      t.surface_reelle_bati ? t.valeur_fonciere / t.surface_reelle_bati : 0
    )
    .filter((p) => p > 0);

  const filteredPrices = removeOutliers(prices);
  const minPrice = Math.min(...filteredPrices);
  const maxPrice = Math.max(...filteredPrices);
  const priceRange = maxPrice - minPrice || 1;

  const heatData = transactions
    .map((t) => {
      const prixM2 = t.surface_reelle_bati
        ? t.valeur_fonciere / t.surface_reelle_bati
        : 0;

      if (prixM2 < minPrice || prixM2 > maxPrice) return null;

      const intensity = (prixM2 - minPrice) / priceRange;
      return [t.latitude, t.longitude, intensity];
    })
    .filter(Boolean);

  console.log(heatData);

  // Définition initiale des paramètres en fonction du niveau de zoom
  let currentZoom = map.getZoom();
  const radius = getDynamicRadius(currentZoom);
  const blur = getDynamicBlur(currentZoom);

  // Création du heatmap layer
  const heatLayer = L.heatLayer(heatData, {
    radius,
    blur,
    maxZoom: 20,
    gradient: {
      0.0: "blue",
      0.3: "green",
      0.5: "yellow",
      0.7: "orange",
      1.0: "red",
    },
  });

  // Mise à jour dynamique du heatmap en fonction du zoom
  map.on("zoomend", () => {
    const newZoom = map.getZoom();
    if (newZoom !== currentZoom) {
      currentZoom = newZoom;
      heatLayer.setOptions({
        radius: getDynamicRadius(currentZoom),
        blur: getDynamicBlur(currentZoom),
      });
    }
  });

  return heatLayer;
}
