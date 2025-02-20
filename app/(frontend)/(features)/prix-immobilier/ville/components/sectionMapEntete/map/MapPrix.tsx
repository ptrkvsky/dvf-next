"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./MapPrix.style.css";

type CommuneGeoJSON = {
  code_commune: string;
  geojson: string;
};

type MapPrixProps = {
  commune: CommuneGeoJSON;
  geometrie: any;
};

export default function MapPrix({ commune, geometrie }: MapPrixProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [communesLimitrophes, setCommunesLimitrophes] = useState<
    CommuneGeoJSON[]
  >([]);

  /** 🗺️ Initialisation de la carte Leaflet */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log("🗺️ Initialisation de la carte Leaflet...");

    // ✅ Création de la carte avec un zoom par défaut
    const map = L.map(mapRef.current).setView(getCommuneCenter(commune), 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

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

    console.log(
      `🔵 Ajout de ${communesLimitrophes.length} communes limitrophes`
    );

    communesLimitrophes.forEach((communeLim) => {
      addGeoJSONLayer(mapInstanceRef.current!, communeLim, "blue", 1, 0.2);
    });
  }, [communesLimitrophes]);

  return <div ref={mapRef} style={{ height: "1000px", width: "100%" }} />;
}

/** 🔹 Ajoute un polygone GeoJSON sur la carte */
/** 🔹 Ajoute un polygone GeoJSON sur la carte */
function addGeoJSONLayer(
  map: L.Map,
  commune: CommuneGeoJSON,
  color: string,
  weight: number,
  fillOpacity: number,
  zoomToFit: boolean = false
) {
  try {
    console.log(`🔵 Ajout de la commune ${commune.code_commune}`, commune);
    if (!commune.geojson) {
      console.warn(
        "⚠️ `geojson` est undefined pour",
        commune.code_commune,
        commune
      );
      return;
    }

    const geoJSON = JSON.parse(commune.geojson);
    if (!geoJSON || !geoJSON.coordinates) {
      console.warn("⚠️ `geojson` mal formé pour", commune.code_commune);
      return;
    }

    const layer = L.geoJSON(geoJSON, {
      style: { color, weight, fillOpacity },
    }).addTo(map);

    if (zoomToFit) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        console.warn("⚠️ Bounds invalides pour", commune.code_commune);
      }
    }
  } catch (error) {
    console.error("❌ Erreur parsing GeoJSON :", error);
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
