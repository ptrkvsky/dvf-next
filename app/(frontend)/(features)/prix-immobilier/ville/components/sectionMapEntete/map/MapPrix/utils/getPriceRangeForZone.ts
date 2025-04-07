import type { Transaction } from "@prisma/client";
import { removeOutliers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/removeOutliers";

/**
 * Obtient le prix minimum et maximum au m² pour une liste de transactions,
 * en excluant les valeurs aberrantes.
 *
 * @param {Transaction[]} transactions - Liste des transactions de la zone.
 * @returns {{ minPrice: number, maxPrice: number }} - Intervalle de prix au m² dans la zone.
 */
export function getPriceRangeForZone(transactions: Transaction[]): {
  minPrice: number;
  maxPrice: number;
} {
  if (transactions.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  const prices = transactions
    .map((t) =>
      t.surface_reelle_bati ? t.valeur_fonciere / t.surface_reelle_bati : 0
    )
    .filter((price) => price > 0); // Exclure les prix nulls ou négatifs

  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  // Supprimer les valeurs aberrantes
  const filteredPrices = removeOutliers(prices);

  return {
    minPrice: Math.min(...filteredPrices),
    maxPrice: Math.max(...filteredPrices),
  };
}
