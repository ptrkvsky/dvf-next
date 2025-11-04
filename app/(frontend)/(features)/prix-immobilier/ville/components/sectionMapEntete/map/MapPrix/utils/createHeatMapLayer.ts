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
  // Filtrer les transactions avec coordonnées valides
  const transactionsValides = transactions.filter(
    (t) =>
      t.latitude != null &&
      t.longitude != null &&
      t.surface_reelle_bati != null &&
      t.surface_reelle_bati > 0 &&
      t.valeur_fonciere != null &&
      t.valeur_fonciere > 0
  );

  if (transactionsValides.length === 0) {
    console.warn("⚠️ Aucune transaction valide pour la heatmap");
    // Retourner une heatmap vide mais valide
    return L.heatLayer([], { radius: 20, blur: 15 });
  }

  const prices = transactionsValides.map(
    (t) => t.valeur_fonciere / t.surface_reelle_bati!
  );

  // Filtrer les prix raisonnables (entre 100€/m² et 50000€/m²)
  const prixRaisonables = prices.filter(
    (p) => p >= 100 && p <= 50000 && isFinite(p) && !isNaN(p)
  );

  if (prixRaisonables.length === 0) {
    console.warn("⚠️ Aucun prix raisonnable pour la heatmap");
    return L.heatLayer([], { radius: 20, blur: 15 });
  }

  const filteredPrices = removeOutliers(prixRaisonables);
  const minPrice = Math.min(...filteredPrices);
  const maxPrice = Math.max(...filteredPrices);
  const priceRange = maxPrice - minPrice || 1;

  const heatData = transactionsValides
    .map((t) => {
      const prixM2 = t.valeur_fonciere / t.surface_reelle_bati!;

      // Filtrer les prix aberrants et les valeurs invalides
      if (
        prixM2 < minPrice ||
        prixM2 > maxPrice ||
        !isFinite(prixM2) ||
        isNaN(prixM2)
      )
        return null;

      // Calculer l'intensité normalisée entre 0.1 et 1.0 pour garantir la visibilité
      const normalizedIntensity =
        priceRange > 0 ? (prixM2 - minPrice) / priceRange : 0.5;
      const intensity = Math.max(0.1, Math.min(1.0, normalizedIntensity));

      // Format: [lat, lng, intensity] pour leaflet.heat
      return [t.latitude!, t.longitude!, intensity];
    })
    .filter((point): point is [number, number, number] => point !== null);

  // Définition initiale des paramètres en fonction du niveau de zoom
  let currentZoom = map.getZoom();
  const radius = getDynamicRadius(currentZoom);
  const blur = getDynamicBlur(currentZoom);

  // Création du heatmap layer avec des paramètres optimisés pour la visibilité
  const heatLayer = L.heatLayer(heatData, {
    radius,
    blur,
    maxZoom: 20,
    gradient: {
      0.0: "#90ee90", // Vert clair même pour les intensités minimales (au lieu de transparent)
      0.2: "#90ee90", // vert clair
      0.4: "#ffff00", // jaune
      0.6: "#ffa500", // orange
      0.8: "#ff4500", // rouge vif
      1.0: "#ff0000", // rouge foncé
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
