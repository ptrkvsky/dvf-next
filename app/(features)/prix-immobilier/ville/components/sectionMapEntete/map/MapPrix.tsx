"use client";

import type { Commune } from "@prisma/client";
import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./MapPrix.style.css";
import "leaflet.heat";

// Declare the leaflet.heat module since TypeScript doesn't know about it
declare module "leaflet" {
  export type HeatLayerOptions = {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    scaleRadius?: boolean;
    useLocalExtrema?: boolean;
    maxOpacity?: number;
    gradient?: Record<string, string>;
  };

  export function heatLayer(
    latlngs: number[][],
    options?: HeatLayerOptions
  ): any;
}

type TransactionWithLocation = {
  latitude: number | null;
  longitude: number | null;
  valeur_fonciere: number;
  surface_reelle_bati: number | null;
  nombre_pieces_principales: number | null;
};

type PropertyHeatmapProps = {
  commune: Commune;
  transactions: TransactionWithLocation[];
};

export function MapPrix({
  commune,
  transactions,
}: Readonly<PropertyHeatmapProps>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView(
      [commune.latitude ?? 0, commune.longitude ?? 0],
      14
    );
    mapInstanceRef.current = map;

    // Filter and sort transactions by value
    const transactionsValides = transactions
      .filter((t) => t.latitude && t.longitude && t.valeur_fonciere)
      .sort((a, b) => a.valeur_fonciere - b.valeur_fonciere);

    if (transactionsValides.length > 0) {
      // Define thresholds for quartiles
      const q1Index = Math.floor(transactionsValides.length * 0.25);
      const q2Index = Math.floor(transactionsValides.length * 0.5);
      const q3Index = Math.floor(transactionsValides.length * 0.75);

      const q1 = transactionsValides[q1Index].valeur_fonciere;
      const q2 = transactionsValides[q2Index].valeur_fonciere;
      const q3 = transactionsValides[q3Index].valeur_fonciere;

      // Normalize with a quartile scale
      const normaliserValeur = (valeur: number) => {
        if (valeur <= q1) return 0.2;
        if (valeur <= q2) return 0.4;
        if (valeur <= q3) return 0.6;
        return 1.0;
      };

      const heatData = transactionsValides.map((t) => [
        t.latitude!,
        t.longitude!,
        normaliserValeur(t.valeur_fonciere),
      ]);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add heat layer
      L.heatLayer(heatData as any, {
        radius: 15, // Adjust based on transaction density
        blur: 25, // Slightly increase blur to soften the heatmap
        maxZoom: 14, // Ensure consistency between zoom levels
        scaleRadius: false, // Prevent heatmap from changing based on zoom
        useLocalExtrema: false, // Use global values for color
        maxOpacity: 0.7, // Limit max intensity of red areas
        gradient: {
          0.2: "blue", // Cheapest 25%
          0.4: "yellow", // 25-50%
          0.6: "orange", // 50-75%
          1.0: "red", // Most expensive 25%
        },
      }).addTo(map);

      // Adjust view to see all points
      const points = heatData.map((point) => [point[0], point[1]]);
      if (points.length > 0) {
        const bounds = L.latLngBounds(points as [number, number][]);
        map.fitBounds(bounds);
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [commune, transactions]);

  return <div ref={mapRef} style={{ height: "530px" }} />;
}
