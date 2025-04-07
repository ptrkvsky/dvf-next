/**
 * Exclut les valeurs aberrantes des prix en utilisant la méthode de l'IQR (Interquartile Range).
 *
 * @param {number[]} prices - Liste des prix au m².
 * @returns {number[]} - Liste des prix sans valeurs aberrantes.
 */
export function removeOutliers(prices: number[]): number[] {
  if (prices.length < 4) return prices; // Pas assez de données pour détecter des valeurs aberrantes

  // Trier les prix
  const sortedPrices = [...prices].sort((a, b) => a - b);

  // Calculer les quartiles
  const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
  const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
  const iqr = q3 - q1;

  // Définir les seuils pour exclure les valeurs aberrantes
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filtrer les prix en supprimant les valeurs aberrantes
  return sortedPrices.filter(
    (price) => price >= lowerBound && price <= upperBound
  );
}
