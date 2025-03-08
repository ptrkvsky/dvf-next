"use client";

import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import type { Commune } from "@prisma/client";
import useCommunesLimitrophes from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useCommunesLimitrophes";
import { useLimitrophesLayers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useLimitropesLayers";
import { useMapLayers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useMapLayers";
import { useTransactions } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useTransactions";
import { createGeoJSONLayer } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/createGeoJSONLayer";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet.heat"; // Nécessite d'installer le package: npm install leaflet.heat
import "leaflet.markercluster"; // Nécessite d'installer: npm install leaflet.markercluster
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./MapPrix.style.css";

type MapPrixProps = {
  commune: Commune;
  geometrie: GeoJSONGeometry | null;
};

export default function MapPrix({
  commune,
  geometrie,
}: Readonly<MapPrixProps>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [typeFiltre, setTypeFiltre] = useState<
    "tous" | "maison" | "appartement"
  >("tous");
  const [displayMode, setDisplayMode] = useState<"heatmap" | "clusters">(
    "heatmap"
  );
  const [priceThreshold, setPriceThreshold] = useState<[number, number]>([
    0, 15000,
  ]);
  const { data: communesLimitrophes } = useCommunesLimitrophes(
    commune.code_commune
  );

  const { data: transactionsWithStats } = useTransactions(commune.code_commune);
  const transactions = useMemo(
    () => transactionsWithStats?.transactions ?? [],
    [transactionsWithStats?.transactions]
  );
  const statsGlobales = transactionsWithStats?.stats ?? null;

  /** 🗺️ Initialisation de la carte Leaflet */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.warn("🗺️ Initialisation de la carte Leaflet...");

    // Ajouter les styles personnalisés
    addCustomStyles();

    // ✅ Création de la carte avec un zoom par défaut
    const map = L.map(mapRef.current).setView(
      getCommuneCenter(commune, geometrie),
      13
    );
    mapInstanceRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    const layer = createGeoJSONLayer(
      { geojson: geometrie, code_commune: commune.code_commune },
      "red",
      2,
      0.2
    );
    // ✅ Ajout du polygone de la commune principale
    layer?.addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [commune, geometrie]);

  /** 🔹 Ajout des communes limitrophes une fois récupérées */
  useLimitrophesLayers({
    mapInstanceRef,
    communesLimitrophes,
    map: mapInstanceRef.current,
  });

  /** 🔹 Affichage des transactions selon le mode choisi */
  useMapLayers({
    mapInstanceRef,
    communesLimitrophes,
    map: mapInstanceRef.current,
    transactions,
    displayMode,
    typeFiltre,
    priceThreshold,
  });
  // useEffect(() => {
  //   if (!mapInstanceRef.current || transactions.length === 0) return;
  //   // Supprimer les couches existantes
  //   mapInstanceRef.current.eachLayer((layer: CustomLayer) => {
  //     if (
  //       layer._heat
  //       || layer._markerCluster
  //       || layer.options?.className === 'price-marker'
  //     ) {
  //       mapInstanceRef.current!.removeLayer(layer as L.Layer); // Obligatoire vue qu'on utilise des plugins
  //     }
  //   });

  //   // Filtrer les transactions selon le type sélectionné
  //   const transactionsFiltrees
  //     = typeFiltre === 'tous'
  //       ? transactions
  //       : transactions.filter(
  //           t => t.type_local && t.type_local.toLowerCase() === typeFiltre,
  //         );

  //   if (displayMode === 'heatmap') {
  //     console.warn(
  //       `🔥 Création de la heatmap avec ${transactionsFiltrees.length} transactions`,
  //     );

  //     // Préparer les données pour la heatmap
  //     const heatData = transactionsFiltrees.map((t) => {
  //       // Calcul du prix au m²
  //       const prixM2 = t.surface_reelle_bati
  //         ? t.valeur_fonciere / t.surface_reelle_bati
  //         : 0;

  //       // L'intensité est basée sur le prix au m²
  //       const intensity = Math.min(prixM2 / 10000, 1);

  //       return [t.latitude, t.longitude, intensity];
  //     });

  //     // @ts-expect-error Leaflet heatmap plugin types not available
  //     L.heatLayer(heatData, {
  //       radius: 25,
  //       blur: 15,
  //       maxZoom: 17,
  //       gradient: {
  //         0.0: 'green',
  //         0.3: 'lime',
  //         0.5: 'yellow',
  //         0.7: 'orange',
  //         1.0: 'red',
  //       },
  //     }).addTo(mapInstanceRef.current);
  //   } else {
  //     console.warn(
  //       `🔵 Création des clusters avec ${transactionsFiltrees.length} transactions`,
  //     );

  //     // Créer des clusters pour regrouper les marqueurs
  //     // @ts-expect-error - Type des plugins Leaflet
  //     const markers = L.markerClusterGroup({
  //       maxClusterRadius: 50, // Rayon plus petit pour créer plus de clusters
  //       disableClusteringAtZoom: 17, // Désactive le clustering au niveau de zoom élevé
  //       spiderfyOnMaxZoom: false, // Désactive l'effet d'araignée
  //       showCoverageOnHover: false, // Ne pas montrer les limites du cluster au survol
  //       zoomToBoundsOnClick: true, // Zoom sur les limites du cluster au clic
  //       iconCreateFunction(cluster: { getAllChildMarkers: () => any }) {
  //         // Calculer le prix moyen des transactions dans le cluster
  //         const markers = cluster.getAllChildMarkers();
  //         const prixM2Liste = markers
  //           .map(
  //             (marker: { options: { prixM2: any } }) => marker.options.prixM2,
  //           )
  //           .filter((p: number) => p > 0);

  //         if (prixM2Liste.length === 0) return L.divIcon();

  //         const prixMoyenM2
  //           = prixM2Liste.reduce((sum: any, price: any) => sum + price, 0)
  //             / prixM2Liste.length;
  //         const couleur = getColorForPrice(prixMoyenM2);

  //         return L.divIcon({
  //           html: `<div style="background-color: ${couleur}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 50%;">${Math.round(prixMoyenM2 / 1000)}k</div>`,
  //           className: 'price-cluster',
  //           iconSize: [40, 40],
  //         });
  //       },
  //     });

  //     // Créer des marqueurs pour chaque transaction
  //     transactionsFiltrees.forEach((t) => {
  //       const prixM2 = t.surface_reelle_bati
  //         ? t.valeur_fonciere / t.surface_reelle_bati
  //         : 0;

  //       if (prixM2 < priceThreshold[0] || prixM2 > priceThreshold[1]) {
  //         return; // Ignorer les prix en dehors des seuils définis
  //       }

  //       const couleur = getColorForPrice(prixM2);

  //       const icon = L.divIcon({
  //         className: 'price-marker',
  //         iconSize: [30, 30],
  //         html: `<div style="background-color: ${couleur}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 50%; font-size: 12px;">${Math.round(prixM2 / 1000)}k</div>`,
  //       });

  //       const popupContent = `
  //         <div style="min-width: 200px;">
  //           <h3 style="margin: 0; padding-bottom: 8px; border-bottom: 1px solid #ddd; text-align: center;">
  //             Prix: ${Math.round(prixM2).toLocaleString('fr-FR')} €/m²
  //           </h3>
  //           <p style="margin: 8px 0;">${t.type_local} - ${Math.round(t.surface_reelle_bati ?? 0)} m²</p>
  //           <p style="margin: 8px 0; font-weight: bold;">Montant total: ${Math.round(t.valeur_fonciere).toLocaleString('fr-FR')} €</p>
  //         </div>
  //       `;

  //       const markerOptions = {
  //         icon,
  //         prixM2, // Store price in a custom properties object
  //       } as L.MarkerOptions;

  //       const marker = L.marker(
  //         [t.latitude ?? 0, t.longitude ?? 0],
  //         markerOptions,
  //       ).bindPopup(popupContent);

  //       markers.addLayer(marker);
  //     });

  //     mapInstanceRef.current.addLayer(markers);
  //   }
  // }, [transactions, displayMode, typeFiltre, priceThreshold]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label
            htmlFor="displayMode"
            className="block text-sm font-medium mb-1"
          >
            Mode d'affichage
          </label>
          <select
            id="displayMode"
            value={displayMode}
            onChange={(e) =>
              setDisplayMode(e.target.value as "heatmap" | "clusters")
            }
            className="rounded border p-2"
          >
            <option value="heatmap">Carte de chaleur</option>
            <option value="clusters">Marqueurs groupés</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="typeFiltre"
            className="block text-sm font-medium mb-1"
          >
            Type de bien
          </label>
          <select
            id="typeFiltre"
            value={typeFiltre}
            onChange={(e) =>
              setTypeFiltre(e.target.value as "tous" | "maison" | "appartement")
            }
            className="rounded border p-2"
          >
            <option value="tous">Tous les biens</option>
            <option value="maison">Maisons</option>
            <option value="appartement">Appartements</option>
          </select>
        </div>

        {displayMode === "clusters" && (
          <div className="w-full md:w-auto">
            <label
              htmlFor="priceThreshold"
              className="block text-sm font-medium mb-1"
            >
              Fourchette de prix (€/m²)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="priceThreshold"
                type="number"
                value={priceThreshold[0]}
                onChange={(e) =>
                  setPriceThreshold([
                    Number.parseInt(e.target.value) || 0,
                    priceThreshold[1],
                  ])
                }
                className="rounded border p-2 w-24"
                min="0"
                step="1000"
              />
              <span>à</span>
              <input
                type="number"
                value={priceThreshold[1]}
                onChange={(e) =>
                  setPriceThreshold([
                    priceThreshold[0],
                    Number.parseInt(e.target.value) || 15000,
                  ])
                }
                className="rounded border p-2 w-24"
                min="0"
                step="1000"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded">
          <span className="text-sm">Échelle de prix:</span>
          <div className="flex items-center">
            <div
              style={{
                backgroundColor: "#008000",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs mr-3">&lt; 4k</span>

            <div
              style={{
                backgroundColor: "#32CD32",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs mr-3">4-5k</span>

            <div
              style={{
                backgroundColor: "#FFD700",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs mr-3">5-6k</span>

            <div
              style={{
                backgroundColor: "#FFA500",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs mr-3">6-7k</span>

            <div
              style={{
                backgroundColor: "#FF8C00",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs mr-3">7-8k</span>

            <div
              style={{
                backgroundColor: "#FF4500",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="text-xs">&gt; 8k</span>
          </div>
        </div>
      </div>

      <div ref={mapRef} style={{ height: "700px", width: "100%" }} />

      {statsGlobales && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Statistiques immobilières -{" "}
            {commune.nom_commune || commune.code_commune}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-gray-500">Prix moyen au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_moyen_m2).toLocaleString(
                  "fr-FR"
                )}{" "}
                €/m²
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-gray-500">Prix minimum au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_min_m2).toLocaleString("fr-FR")}{" "}
                €/m²
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-gray-500">Prix maximum au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_max_m2).toLocaleString("fr-FR")}{" "}
                €/m²
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-gray-500">
                Nombre de transactions
              </div>
              <div className="text-xl font-bold">
                {statsGlobales.nombre_transactions.toLocaleString("fr-FR")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 🔹 Ajoute un polygone GeoJSON sur la carte */
function addGeoJSONLayer(
  map: L.Map,
  data: { geojson: GeoJSONGeometry | null; code_commune: string },
  color: string,
  weight: number,
  fillOpacity: number,
  zoomToFit: boolean = false
) {
  try {
    if (!data?.geojson) {
      console.warn("⚠️ Donnée GeoJSON manquante");
      return null;
    }

    // Créer la couche Leaflet
    const layer = L.geoJSON(data.geojson, {
      style: {
        color,
        weight: weight * 2,
        opacity: 0.8,
        fillOpacity,
      },
    }).addTo(map);

    if (zoomToFit) {
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.warn("⚠️ Impossible d'ajuster la vue", e);
      }
    }

    return layer;
  } catch (error) {
    console.error("❌ Erreur parsing GeoJSON :", error);
    return null;
  }
}

/** 🔹 Récupère le centre approximatif d'une commune */
function getCommuneCenter(
  commune: Commune,
  geometrie: GeoJSONGeometry | null
): [number, number] {
  try {
    if (!geometrie) {
      console.warn(
        `⚠️ 'geometrie' est undefined pour la commune ${commune.code_commune}`
      );
      return [43.7, 7.2]; // Valeur par défaut en cas d'erreur
    }

    let coordinates: [number, number][] = [];

    if (geometrie.type === "Polygon") {
      coordinates = geometrie.coordinates[0]; // Outer ring of the polygon
    } else if (geometrie.type === "MultiPolygon") {
      coordinates = geometrie.coordinates[0][0]; // Outer ring of the first polygon
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      console.warn(
        `⚠️ Coordonnées invalides pour la commune ${commune.code_commune}`
      );
      return [43.7, 7.2];
    }

    // Calcul du centre des coordonnées
    const [lonSum, latSum] = coordinates.reduce(
      ([lon, lat], [currLon, currLat]) => [lon + currLon, lat + currLat],
      [0, 0]
    );

    return [latSum / coordinates.length, lonSum / coordinates.length];
  } catch (error) {
    console.error(
      `❌ Erreur récupération centre GeoJSON pour la commune ${commune.code_commune}:`,
      error
    );
    return [43.7, 7.2]; // Valeur par défaut en cas d'erreur
  }
}

// /** 🔹 Obtient une couleur en fonction du prix */
// function getColorForPrice(price: number): string {
//   if (!price) return "#CCCCCC"; // Gris pour les zones sans données

//   if (price >= 8000) return "#FF4500"; // Rouge-orange pour les zones très chères
//   if (price >= 7000) return "#FF8C00"; // Orange foncé
//   if (price >= 6000) return "#FFA500"; // Orange
//   if (price >= 5000) return "#FFD700"; // Or
//   if (price >= 4000) return "#32CD32"; // Vert lime
//   return "#008000"; // Vert foncé pour les zones moins chères
// }

/** 🔹 Ajoute une feuille de style pour les marqueurs personnalisés */
function addCustomStyles() {
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
