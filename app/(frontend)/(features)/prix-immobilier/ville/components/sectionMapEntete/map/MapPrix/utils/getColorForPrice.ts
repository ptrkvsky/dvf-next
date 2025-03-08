/** 🔹 Obtient une couleur en fonction du prix */
export function getColorForPrice(price: number): string {
  if (!price) return "#CCCCCC"; // Gris pour les zones sans données

  if (price >= 8000) return "#FF4500"; // Rouge-orange pour les zones très chères
  if (price >= 7000) return "#FF8C00"; // Orange foncé
  if (price >= 6000) return "#FFA500"; // Orange
  if (price >= 5000) return "#FFD700"; // Or
  if (price >= 4000) return "#32CD32"; // Vert lime
  return "#008000"; // Vert foncé pour les zones moins chères
}
