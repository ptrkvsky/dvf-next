import type { PrixM2Commune } from "@/app/(features)/prix-immobilier/ville/types/PrixM2Commune";
import { prisma } from "@/app/libs/prisma";

/**
 * Récupère les prix au mètre carré pour les maisons et appartements dans une commune spécifique.
 *
 * Cette fonction interroge la base de données PostgreSQL via Prisma et retourne les prix bas,
 * médians et hauts des transactions immobilières filtrées par commune.
 *
 * @param {string} codeCommune - Le code INSEE de la commune pour laquelle récupérer les données.
 * @returns {Promise<PrixM2Commune[]>} Une promesse résolue avec la liste des prix par type de logement.
 *
 * @example
 * ```ts
 * const prix = await getPrixM2Commune("75056");
 * console.log(prix);
 * ```
 */
export async function getPrixM2Commune(
  codeCommune: string
): Promise<PrixM2Commune[]> {
  try {
    const result = await prisma.$queryRaw<PrixM2Commune[]>`
    SELECT 
        "type_local" AS type_logement,
        CEIL(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_bas,
        CEIL(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_median,
        CEIL(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_haut
    FROM "Transaction"
    WHERE "surface_reelle_bati" IS NOT NULL 
        AND "surface_reelle_bati" > 10
        AND "type_local" IN ('Maison', 'Appartement')
        AND "code_commune" = ${codeCommune} -- ✅ Filtre par commune
        AND "date_mutation" >= CURRENT_DATE - INTERVAL '1 year' -- ✅ Filtre sur la dernière année
    GROUP BY "type_local";
    `;

    return result;
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul des prix pour la commune ${codeCommune} :`,
      error
    );
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
