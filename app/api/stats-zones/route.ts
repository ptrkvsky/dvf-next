// Route: /api/stats-zones
import type { NextRequest } from "next/server";
import {
  createAdministrativeZones,
  createGridForCommune,
} from "@/app/(frontend)/utils/zoneUtils";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code_commune = searchParams.get("code_commune");

    if (!code_commune) {
      return NextResponse.json(
        { error: "Code commune requis" },
        { status: 400 }
      );
    }

    // Récupérer les détails de la commune
    const commune = await prisma.commune.findUnique({
      where: { code_commune },
      select: {
        code_commune: true,
        nom_commune: true,
        geometrie: true,
        surface_ha: true,
      },
    });

    if (!commune) {
      return NextResponse.json(
        { error: "Commune non trouvée" },
        { status: 404 }
      );
    }

    // Déterminer le type de zonage basé sur la taille de la commune
    // Pour les petites communes (moins de 1000 hectares), utiliser une grille simple
    // Pour les grandes communes, essayer d'utiliser les codes postaux ou divisions administratives
    const isSmallCommune =
      commune.surface_ha !== null && commune.surface_ha < 1000;

    let zones;
    if (isSmallCommune) {
      // Créer une grille simple (2x2 ou 3x3 selon la taille)
      const gridSize =
        commune.surface_ha !== null && commune.surface_ha < 500 ? 2 : 3;
      zones = await createGridForCommune(commune, gridSize);
    } else {
      // Utiliser les divisions administratives (codes postaux, quartiers...)
      zones = await createAdministrativeZones(commune);
    }

    // Pour chaque zone, calculer les statistiques immobilières
    const zonesWithStats = await Promise.all(
      zones.map(async (zone) => {
        // Déterminer les transactions dans cette zone
        const transactions = await prisma.$queryRaw`
          SELECT 
            t.valeur_fonciere, 
            t.surface_reelle_bati,
            t.type_local
          FROM "Transaction" t
          WHERE 
            t.code_commune = ${code_commune}
            AND t.surface_reelle_bati > 0
            AND t.type_local IN ('Maison', 'Appartement')
            AND ST_Within(
              ST_SetSRID(ST_Point(t.longitude, t.latitude), 4326),
              ST_SetSRID(ST_GeomFromGeoJSON(${zone.geojson}), 4326)
            )
        `;

        // Calculer les statistiques
        const typesCount = {};
        let totalPrix = 0;
        let totalSurface = 0;
        let nbTransactions = 0;
        let typeDominant = "Inconnu";
        let maxTypeCount = 0;

        // @ts-ignore - Type des résultats de requête brute
        for (const t of transactions) {
          if (t.surface_reelle_bati && t.valeur_fonciere) {
            totalPrix += t.valeur_fonciere;
            totalSurface += t.surface_reelle_bati;
            nbTransactions++;

            // Compter les types de biens
            if (t.type_local) {
              typesCount[t.type_local] = (typesCount[t.type_local] || 0) + 1;

              if (typesCount[t.type_local] > maxTypeCount) {
                maxTypeCount = typesCount[t.type_local];
                typeDominant = t.type_local;
              }
            }
          }
        }

        // Calculer le prix moyen au m²
        const prixMoyenM2 =
          nbTransactions > 0 ? Math.round(totalPrix / totalSurface) : 0;

        return {
          ...zone,
          prix_moyen_m2: prixMoyenM2,
          nb_transactions: nbTransactions,
          type_local: typeDominant,
        };
      })
    );

    return NextResponse.json({
      zones: zonesWithStats.filter((z) => z.nb_transactions > 0),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques par zone:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
