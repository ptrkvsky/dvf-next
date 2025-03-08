/**
 * Hook permettant d'ajouter les communes limitrophes sous forme de calques GeoJSON sur une carte Leaflet
 * et d'afficher les transactions sous forme de heatmap ou de clusters selon le mode choisi.
 *
 * @param {object} props - Les paramètres du hook.
 * @param {RefObject<L.Map | null>} props.mapInstanceRef - Référence vers l'instance de la carte Leaflet.
 * @param {CommunesLimitrophes[]} props.communesLimitrophes - Liste des communes limitrophes à afficher.
 * @param {L.Map} props.map - Instance actuelle de la carte Leaflet.
 * @param {Transaction[]} props.transactions - Liste des transactions à afficher.
 * @param {string} props.displayMode - Mode d'affichage des transactions ('heatmap' ou 'clusters').
 * @param {string} props.typeFiltre - Type de filtre à appliquer sur les transactions.
 * @param {number[]} props.priceThreshold - Intervalle de prix à afficher dans les clusters.
 */
import type { CommunesLimitrophes } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/CommunesLimnitrophes";
import type { Transaction } from "@prisma/client";
import type { RefObject } from "react";
import { clearMapLayers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/clearMapLayers";
import { createClusterLayer } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/createClusterLayer";
import { createHeatmapLayer } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/createHeatMapLayer";
import { filterTransactions } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/filterTransactions";
import { useEffect } from "react";

type Props = {
  mapInstanceRef: RefObject<L.Map | null>;
  communesLimitrophes: CommunesLimitrophes[] | undefined;
  map: L.Map | null;
  transactions: Transaction[];
  displayMode: string;
  typeFiltre: string;
  priceThreshold: number[];
};

/**
 * Utilise un effet React pour ajouter dynamiquement les calques des communes limitrophes sur la carte
 * et afficher les transactions en heatmap ou en clusters selon le mode choisi.
 *
 * @param {Props} props - Les paramètres nécessaires au hook.
 */
export function useMapLayers({
  mapInstanceRef,
  communesLimitrophes,
  map,
  transactions,
  displayMode,
  typeFiltre,
  priceThreshold,
}: Props) {
  useEffect(() => {
    if (!mapInstanceRef.current || transactions.length === 0) return;

    // Supprimer les couches existantes (markers et heatmap)
    clearMapLayers(mapInstanceRef.current);

    const transactionsFiltrees = filterTransactions(transactions, typeFiltre);

    if (displayMode === "heatmap") {
      console.warn(
        `🔥 Création de la heatmap avec ${transactionsFiltrees.length} transactions`
      );
      const heatLayer = createHeatmapLayer(transactionsFiltrees);
      heatLayer.addTo(mapInstanceRef.current);
    } else {
      console.warn(
        `🔵 Création des clusters avec ${transactionsFiltrees.length} transactions`
      );
      const clusterLayer = createClusterLayer(
        transactionsFiltrees,
        priceThreshold
      );
      mapInstanceRef.current.addLayer(clusterLayer);
    }
  }, [
    mapInstanceRef,
    communesLimitrophes,
    map,
    transactions,
    displayMode,
    typeFiltre,
    priceThreshold,
  ]);
}
