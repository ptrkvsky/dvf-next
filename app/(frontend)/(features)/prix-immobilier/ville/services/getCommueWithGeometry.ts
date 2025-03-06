import type { CommuneWithGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import { GeoJSONGeometrySchema } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import { prisma } from "@/app/(frontend)/libs/prisma";

export async function getCommuneByCode(codeCommune: string) {
  try {
    // Sans spécifier select pour récupérer tous les champs disponibles
    const commune = await prisma.commune.findUnique({
      where: {
        code_commune: codeCommune,
      },
    });

    if (!commune) {
      console.error(`❌ Commune avec code ${codeCommune} non trouvée`);
      return null;
    }

    // Récupérer la géométrie via une requête SQL brute si nécessaire
    const [geometrieQuery]: Array<{
      geojson: string;
    }> = await prisma.$queryRaw`
      SELECT ST_AsGeoJSON(geometrie) as geojson 
      FROM "Commune" 
      WHERE code_commune = ${codeCommune}
    `;

    const parsedGeometry = GeoJSONGeometrySchema.safeParse(
      JSON.parse(geometrieQuery.geojson)
    );

    try {
      if (!parsedGeometry.success) {
        console.error(
          `❌ Erreur lors de la récupération de la géométrie pour la commune ${codeCommune}:`,
          parsedGeometry.error
        );
        return null;
      }
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération de la géométrie pour la commune ${codeCommune}:`,
        error
      );
      return null;
    }

    // Combiner les résultats
    const communeWithGeom: CommuneWithGeometry = {
      ...commune,
      geojson: parsedGeometry.data,
    };

    return communeWithGeom;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commune:", error);
    return null;
  }
}
