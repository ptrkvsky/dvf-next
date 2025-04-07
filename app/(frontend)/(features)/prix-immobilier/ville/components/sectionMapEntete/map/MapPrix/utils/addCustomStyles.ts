/** 🔹 Ajoute une feuille de style pour les marqueurs personnalisés */
export function addCustomStyles() {
  // Vérifier si la feuille de style existe déjà
  if (!document.getElementById("custom-marker-styles")) {
    const style = document.createElement("style");
    style.id = "custom-marker-styles";
    style.innerHTML = `
      .price-marker {
        transition: transform 0.2s;
      }
      .price-marker:hover {
        transform: scale(1.2);
        z-index: 1000 !important;
      }
      .price-cluster {
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        transition: transform 0.2s;
      }
      .price-cluster:hover {
        transform: scale(1.1);
        z-index: 1000 !important;
      }
    `;
    document.head.appendChild(style);
  }
}
