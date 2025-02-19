import { prisma } from "@/app/(frontend)/libs/prisma";

export type PrixM2Region = {
  type_logement: string;
  prix_m2_bas: number;
  prix_m2_median: number;
  prix_m2_haut: number;
};

export async function getPrixM2Region(
  codeRegion: string
): Promise<PrixM2Region[]> {
  try {
    const result = await prisma.$queryRaw<PrixM2Region[]>`
    SELECT 
        type_local AS type_logement,
        PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY valeur_fonciere / surface_reelle_bati) AS prix_m2_bas,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valeur_fonciere / surface_reelle_bati) AS prix_m2_median,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY valeur_fonciere / surface_reelle_bati) AS prix_m2_haut
    FROM "Transaction"
    JOIN "Departement" ON "Transaction"."code_departement" = "Departement"."code_departement"
    WHERE "surface_reelle_bati" IS NOT NULL 
        AND "surface_reelle_bati" > 10
        AND "type_local" IN ('Maison', 'Appartement')
        AND "Departement"."code_region" = ${codeRegion} -- ✅ Filtre par région
    GROUP BY "type_local";
    `;

    return result;
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul des prix pour la région ${codeRegion} :`,
      error
    );
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
