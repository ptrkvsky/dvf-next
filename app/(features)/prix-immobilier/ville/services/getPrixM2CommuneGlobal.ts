import { prisma } from "@/app/libs/prisma";

/**
 * Récupère les prix au mètre carré médian, bas et haut pour une commune donnée,
 * sans distinction de type de logement (Maison ou Appartement).
 *
 * Cette fonction interroge la base de données PostgreSQL via Prisma pour calculer
 * les percentiles 10 (prix bas), 50 (prix médian) et 90 (prix haut) des transactions
 * immobilières enregistrées dans la commune sur la dernière année.
 *
 * @param {string} codeCommune - Le code INSEE de la commune pour laquelle récupérer les données.
 * @returns {Promise<{ prix_m2_bas: number | null; prix_m2_median: number | null; prix_m2_haut: number | null } | null>}
 * - Un objet contenant les trois valeurs calculées si des transactions sont disponibles.
 * - `null` si aucune transaction pertinente n'a été trouvée.
 *
 * @throws {Error} En cas d'échec de la requête à la base de données.
 *
 * @example
 * ```ts
 * const prixGlobal = await getPrixM2CommuneGlobal("75056");
 * if (prixGlobal) {
 *   console.log("Prix médian bas :", prixGlobal.prix_m2_bas);
 *   console.log("Prix médian :", prixGlobal.prix_m2_median);
 *   console.log("Prix médian haut :", prixGlobal.prix_m2_haut);
 * } else {
 *   console.log("⚠️ Aucun prix trouvé pour cette commune.");
 * }
 * ```
 */
export async function getPrixM2CommuneGlobal(codeCommune: string): Promise<{
  prix_m2_bas: number | null;
  prix_m2_median: number | null;
  prix_m2_haut: number | null;
} | null> {
  try {
    const result = await prisma.$queryRaw<
      {
        prix_m2_bas: number | null;
        prix_m2_median: number | null;
        prix_m2_haut: number | null;
      }[]
    >`
      SELECT 
          CEIL(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_bas,
          CEIL(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_median,
          CEIL(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY "valeur_fonciere" / "surface_reelle_bati")) AS prix_m2_haut
      FROM "Transaction"
      WHERE "surface_reelle_bati" IS NOT NULL 
          AND "surface_reelle_bati" > 10
          AND "type_local" IN ('Maison', 'Appartement') -- ✅ On garde uniquement ces types
          AND "code_commune" = ${codeCommune} -- ✅ Filtrage par commune
          AND "date_mutation" >= CURRENT_DATE - INTERVAL '1 year' -- ✅ Transactions de la dernière année
    `;

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul des prix médians pour la commune ${codeCommune} :`,
      error
    );
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
