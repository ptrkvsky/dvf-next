"use client";

import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import type { Commune } from "@prisma/client";
import useCommunesLimitrophes from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useCommunesLimitrophes";
import { useLimitrophesLayers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useLimitropesLayers";
import { useMapLayers } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useMapLayers";
import { useTransactions } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/hooks/useTransactions";
import { addCustomStyles } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/addCustomStyles";
import { createGeoJSONLayer } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/createGeoJSONLayer";
import { getCommuneCenter } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix/utils/getCommuneCenter";
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      updateWhenIdle: true, // Charge les tuiles seulement quand la carte est immobile
      keepBuffer: 1, // Réduit le nombre de tuiles stockées en cache
    }).addTo(map);

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

  return (
    <div>
      <div className=" sss mb-4 flex flex-wrap gap-4">
        <div>
          <label
            htmlFor="displayMode"
            className="mb-1 block text-sm font-medium"
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
            className="mb-1 block text-sm font-medium"
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
              className="mb-1 block text-sm font-medium"
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
                className="w-24 rounded border p-2"
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
                className="w-24 rounded border p-2"
                min="0"
                step="1000"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between rounded bg-gray-100 px-4 py-2">
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
            <span className="mr-3 text-xs">&lt; 4k</span>

            <div
              style={{
                backgroundColor: "#32CD32",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="mr-3 text-xs">4-5k</span>

            <div
              style={{
                backgroundColor: "#FFD700",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="mr-3 text-xs">5-6k</span>

            <div
              style={{
                backgroundColor: "#FFA500",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="mr-3 text-xs">6-7k</span>

            <div
              style={{
                backgroundColor: "#FF8C00",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "3px",
              }}
            ></div>
            <span className="mr-3 text-xs">7-8k</span>

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
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 text-lg font-semibold">
            Statistiques immobilières -{" "}
            {commune.nom_commune || commune.code_commune}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded bg-white p-3 shadow">
              <div className="text-sm text-gray-500">Prix moyen au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_moyen_m2).toLocaleString(
                  "fr-FR"
                )}{" "}
                €/m²
              </div>
            </div>
            <div className="rounded bg-white p-3 shadow">
              <div className="text-sm text-gray-500">Prix minimum au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_min_m2).toLocaleString("fr-FR")}{" "}
                €/m²
              </div>
            </div>
            <div className="rounded bg-white p-3 shadow">
              <div className="text-sm text-gray-500">Prix maximum au m²</div>
              <div className="text-xl font-bold">
                {Math.round(statsGlobales.prix_max_m2).toLocaleString("fr-FR")}{" "}
                €/m²
              </div>
            </div>
            <div className="rounded bg-white p-3 shadow">
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
