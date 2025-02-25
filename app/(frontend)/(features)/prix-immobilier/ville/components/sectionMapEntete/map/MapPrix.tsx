"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./MapPrix.style.css";

type CommuneGeoJSON = {
  code_commune: string;
  geojson: string;
  name?: string;
  price?: number;
};

type MapPrixProps = {
  commune: CommuneGeoJSON;
  geometrie: any;
};

export default function MapPrix({
  commune,
  geometrie,
}: Readonly<MapPrixProps>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [quartiers, setQuartiers] = useState<any[]>([]);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [communesLimitrophes, setCommunesLimitrophes] = useState<
    CommuneGeoJSON[]
  >([]);

  /** 🗺️ Initialisation de la carte Leaflet */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.warn("🗺️ Initialisation de la carte Leaflet...");

    // ✅ Création de la carte avec un zoom par défaut
    const map = L.map(mapRef.current).setView(getCommuneCenter(commune), 12);
    mapInstanceRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // ✅ Ajout du polygone de la commune principale
    addGeoJSONLayer(
      map,
      { geojson: geometrie[0].geojson, code_commune: commune.code_commune },
      "red",
      2,
      0.4,
      true
    );

    // ✅ Récupération des communes limitrophes
    fetchLimitrophes(commune.code_commune)
      .then(setCommunesLimitrophes)
      .catch((err) =>
        console.error("❌ Erreur chargement communes limitrophes :", err)
      );

    fetchQuartiers(commune.code_commune).then(setQuartiers);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [commune]);

  /** 🔹 Ajout des communes limitrophes une fois récupérées */
  useEffect(() => {
    if (!mapInstanceRef.current || communesLimitrophes.length === 0) return;

    console.warn(
      `🔵 Ajout de ${communesLimitrophes.length} communes limitrophes`
    );

    communesLimitrophes.forEach((communeLim) => {
      addGeoJSONLayer(mapInstanceRef.current!, communeLim, "blue", 1, 0.2);
    });
  }, [communesLimitrophes]);

  /** 🔹 Ajout des quartiers récupérés */
  useEffect(() => {
    if (!mapInstanceRef.current || quartiers.length === 0) return;

    console.warn(`🟢 Ajout de ${quartiers.length} quartiers`);

    quartiers.forEach((quartier) => {
      addGeoJSONLayer(
        mapInstanceRef.current!,
        quartier,
        getColorForPrice(quartier.price),
        1,
        0.5
      );
    });
  }, [quartiers]);

  return <div ref={mapRef} style={{ height: "1000px", width: "100%" }} />;
}

/** 🔹 Ajoute un polygone GeoJSON sur la carte */
function addGeoJSONLayer(
  map: L.Map,
  commune: any,
  color: string,
  weight: number,
  fillOpacity: number,
  zoomToFit: boolean = false
) {
  try {
    if (!commune || !commune.geojson) {
      console.warn("⚠️ Donnée GeoJSON manquante");
      return null;
    }

    console.log(
      `🟢 Ajout du quartier: ${commune.name || commune.code_commune}`
    );

    // Analyser le GeoJSON
    const geoJSON = JSON.parse(commune.geojson);

    if (!geoJSON || !geoJSON.type) {
      console.warn("⚠️ Structure GeoJSON invalide");
      return null;
    }

    // Afficher le contenu du GeoJSON pour débogage
    console.log(
      `Structure GeoJSON pour ${commune.name || commune.code_commune}:`,
      `Type: ${geoJSON.type}`,
      `Nombre de features: ${geoJSON.features?.length || 0}`
    );

    // Créer la couche Leaflet
    const layer = L.geoJSON(geoJSON, {
      style: {
        color,
        weight: weight * 3, // Augmenter l'épaisseur des lignes pour une meilleure visibilité
        opacity: 0.8,
        fillOpacity,
      },
      onEachFeature(feature, layer) {
        if (feature.properties) {
          layer.bindPopup(`
            <div style="text-align: center;">
              <strong>${commune.name || feature.properties.name || "Quartier"}</strong><br>
              <span style="font-size: 1.2em;">${commune.price || feature.properties.price || "Prix non disponible"} €/m²</span>
            </div>
          `);
        }
      },
    }).addTo(map);

    if (zoomToFit) {
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.warn("⚠️ Impossible d'ajuster la vue");
      }
    }

    return layer;
  } catch (error) {
    console.error("❌ Erreur parsing GeoJSON :", error);
    return null;
  }
}

/** 🔹 Récupère les communes limitrophes via API */
async function fetchLimitrophes(
  code_commune: string
): Promise<CommuneGeoJSON[]> {
  const res = await fetch(
    `/api/communes-limitrophes?code_commune=${code_commune}`
  );
  if (!res.ok) throw new Error("Échec récupération communes limitrophes");
  const data = await res.json();
  return data.communesLimitrophes || [];
}

/** 🔹 Récupère les quartiers via Overpass API */
async function fetchQuartiers(code_commune: string) {
  // Requête Overpass plus simple pour obtenir seulement les limites des quartiers
  const overpassQuery = `
    [out:json];
    area["ref:INSEE"="${code_commune}"]->.searchArea;
    (
      relation["boundary"="administrative"]["admin_level"="10"](area.searchArea);
    );
    out body;
    way(r);
    out geom;`;

  console.log("Envoi requête Overpass pour quartiers...");

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Reçu ${data.elements.length} éléments d'Overpass`);

    // Trouver toutes les relations (quartiers)
    const relations = data.elements.filter((el) => el.type === "relation");
    console.log(
      `Nombre de relations (quartiers) trouvées: ${relations.length}`
    );

    // Trouver tous les ways (chemins)
    const ways = data.elements.filter((el) => el.type === "way" && el.geometry);
    console.log(`Nombre de ways (chemins) trouvés: ${ways.length}`);

    // Créer un quartier pour chaque relation
    return relations
      .map((relation) => {
        try {
          // Récupérer les IDs des ways qui forment cette relation
          const relationWayIds = relation.members
            .filter((member) => member.type === "way")
            .map((member) => member.ref);

          // Filtrer les ways qui appartiennent à cette relation
          const quartierWays = ways.filter((way) =>
            relationWayIds.includes(way.id)
          );

          if (quartierWays.length === 0) {
            console.log(
              `Aucun way trouvé pour le quartier ${relation.tags?.name || relation.id}`
            );
            return null;
          }

          // Créer un LineString pour chaque way
          const features = quartierWays
            .map((way) => {
              // Extraire les coordonnées de la géométrie
              const coordinates = way.geometry
                ? way.geometry.map((node) => [node.lon, node.lat])
                : [];

              if (coordinates.length < 2) return null;

              return {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates,
                },
                properties: {
                  id: way.id,
                  name: relation.tags?.name || "Quartier sans nom",
                  code_commune,
                },
              };
            })
            .filter((feature) => feature !== null);

          if (features.length === 0) {
            console.log(
              `Pas de features valides pour ${relation.tags?.name || relation.id}`
            );
            return null;
          }

          // Créer un prix aléatoire pour la démonstration
          const price = Math.floor(Math.random() * 5000) + 3000;

          // Créer un GeoJSON avec toutes les features
          const geojson = {
            type: "FeatureCollection",
            features,
          };

          console.log(
            `Quartier ${relation.tags?.name || relation.id} créé avec ${features.length} lignes`
          );

          return {
            geojson: JSON.stringify(geojson),
            code_commune,
            name: relation.tags?.name || "Quartier sans nom",
            price,
          };
        } catch (error) {
          console.error(
            `Erreur création GeoJSON pour relation ${relation.id}:`,
            error
          );
          return null;
        }
      })
      .filter((quartier) => quartier !== null);
  } catch (error) {
    console.error("Erreur lors de la récupération des quartiers:", error);
    return [];
  }
}

/** 🔹 Récupère le centre approximatif d'une commune */
function getCommuneCenter(commune: CommuneGeoJSON): [number, number] {
  try {
    if (!commune.geojson) {
      console.warn("⚠️ `geojson` est undefined pour", commune.code_commune);
      return [43.7, 7.2]; // Valeur par défaut si erreur
    }

    const geoJSON = JSON.parse(commune.geojson);
    if (!geoJSON || !geoJSON.coordinates) {
      console.warn("⚠️ `geojson` mal formé pour", commune.code_commune);
      return [43.7, 7.2];
    }

    const coordinates = geoJSON.coordinates[0];
    const [lonSum, latSum] = coordinates.reduce(
      ([lon, lat], [currLon, currLat]) => [lon + currLon, lat + currLat],
      [0, 0]
    );

    return [latSum / coordinates.length, lonSum / coordinates.length];
  } catch (error) {
    console.error("❌ Erreur récupération centre GeoJSON :", error);
    return [43.7, 7.2]; // Valeur par défaut si erreur
  }
}

/** 🔹 Obtient une couleur en fonction du prix */
function getColorForPrice(price: number): string {
  if (price >= 8000) return "#FF4500"; // Rouge-orange pour les zones très chères
  if (price >= 7000) return "#FF8C00"; // Orange foncé
  if (price >= 6000) return "#FFA500"; // Orange
  if (price >= 5000) return "#FFD700"; // Or
  if (price >= 4000) return "#32CD32"; // Vert lime
  return "#008000"; // Vert foncé pour les zones moins chères
}
