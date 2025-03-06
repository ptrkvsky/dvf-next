import type { Commune } from "@prisma/client";
import { z } from "zod";

// Schéma Zod pour les coordonnées (une paire [longitude, latitude])
const CoordinatePairSchema = z.tuple([z.number(), z.number()]);

// Schéma pour un anneau de coordonnées (un polygone fermé)
const CoordinateRingSchema = z.array(CoordinatePairSchema);

// Schéma pour un polygone (qui peut avoir des trous)
const PolygonCoordinatesSchema = z.array(CoordinateRingSchema);

// Schéma pour un MultiPolygon (tableau de polygones)
const MultiPolygonCoordinatesSchema = z.array(PolygonCoordinatesSchema);

// Schéma pour un objet Polygon GeoJSON
const GeoJSONPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: PolygonCoordinatesSchema,
});

// Schéma pour un objet MultiPolygon GeoJSON
const GeoJSONMultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: MultiPolygonCoordinatesSchema,
});

// Type union pour différents types de géométries
export const GeoJSONGeometrySchema = z.discriminatedUnion("type", [
  GeoJSONPolygonSchema,
  GeoJSONMultiPolygonSchema,
]);

export type CommuneWithGeometry = Commune & {
  geojson: GeoJSONGeometry;
};

// Exporter les types inférés du schéma
export type GeoJSONPolygon = z.infer<typeof GeoJSONPolygonSchema>;
export type GeoJSONMultiPolygon = z.infer<typeof GeoJSONMultiPolygonSchema>;
export type GeoJSONGeometry = z.infer<typeof GeoJSONGeometrySchema>;
