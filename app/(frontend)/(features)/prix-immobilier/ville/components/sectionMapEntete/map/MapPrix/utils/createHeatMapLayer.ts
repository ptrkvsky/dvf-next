import type { Transaction } from "@prisma/client";

export function createHeatmapLayer(transactions: Transaction[]) {
  const heatData = transactions.map((t) => {
    const prixM2 = t.surface_reelle_bati
      ? t.valeur_fonciere / t.surface_reelle_bati
      : 0;
    const intensity = Math.min(prixM2 / 10000, 1);
    return [t.latitude, t.longitude, intensity];
  });

  // @ts-expect-error Leaflet heatmap plugin types not available
  return L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: {
      0.0: "green",
      0.3: "lime",
      0.5: "yellow",
      0.7: "orange",
      1.0: "red",
    },
  });
}
