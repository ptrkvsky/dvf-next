/**
 * Obtient une couleur en fonction du prix au m² relatif à la commune.
 * La couleur est normalisée en fonction des prix minimum et maximum d'une zone donnée.
 *
 * @param {number} price - Le prix au m².
 * @param {number} minPrice - Le prix au m² minimum de la zone.
 * @param {number} maxPrice - Le prix au m² maximum de la zone.
 * @returns {string} - Une couleur normalisée en fonction du prix.
 */
export function getColorForPrice(
  price: number,
  minPrice: number,
  maxPrice: number
): string {
  if (!price || minPrice === maxPrice) return "#CCCCCC"; // Gris pour les zones sans données

  // Normalisation du prix entre 0 et 1
  const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);

  if (normalizedPrice >= 0.8) return "#FF4500"; // Rouge-orange pour les zones très chères
  if (normalizedPrice >= 0.6) return "#FF8C00"; // Orange foncé
  if (normalizedPrice >= 0.4) return "#FFA500"; // Orange
  if (normalizedPrice >= 0.2) return "#FFD700"; // Or
  return "#32CD32"; // Vert lime pour les zones moins chères
}
