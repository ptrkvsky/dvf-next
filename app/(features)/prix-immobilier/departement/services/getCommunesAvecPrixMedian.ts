import { prisma } from "@/app/libs/prisma";

/**
 * Interface représentant une commune avec son prix médian calculé en direct.
 */
export type CommuneAvecPrix = {
  code_commune: string;
  nom_commune: string;
  code_postal: string | null;
  prix_m2_median: number | null;
};

/**
 * Récupère les communes d'un département, en filtrant celles qui ont au moins 15 transactions,
 * et calcule leur prix médian au m² pour les appartements.
 *
 * @param {string} codeDepartement - Le code du département pour lequel récupérer les communes.
 * @returns {Promise<CommuneAvecPrix[]>} Une promesse résolue avec la liste des communes et leur prix médian.
 *
 * @example
 * ```ts
 * const communes = await getCommunes("75");
 * console.log(communes);
 * ```
 */
export async function getCommunesAvecPrixMedian(
  codeDepartement: string
): Promise<CommuneAvecPrix[]> {
  try {
    const result = await prisma.$queryRaw<CommuneAvecPrix[]>`
    WITH transactions_par_commune AS (
      SELECT 
        "code_commune",
        COUNT(*) AS nombre_transactions
      FROM "Transaction"
      WHERE "code_departement" = ${codeDepartement}
      GROUP BY "code_commune"
      HAVING COUNT(*) >= 10 -- ✅ Filtre sur le nombre de transactions (au moins 15)
    )
    SELECT 
        "Commune"."code_commune",
        "Commune"."nom_commune",
        "Commune"."code_postal",
        CEIL(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "Transaction"."valeur_fonciere" / "Transaction"."surface_reelle_bati")) AS prix_m2_median
    FROM "Commune"
    JOIN transactions_par_commune ON "Commune"."code_commune" = transactions_par_commune.code_commune
    JOIN "Transaction" ON "Commune"."code_commune" = "Transaction"."code_commune"
    WHERE "Transaction"."surface_reelle_bati" IS NOT NULL 
      AND "Transaction"."surface_reelle_bati" > 10
    GROUP BY "Commune"."code_commune", "Commune"."nom_commune", "Commune"."code_postal";
    `;

    return result;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération des communes pour le département ${codeDepartement} :`,
      error
    );
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
