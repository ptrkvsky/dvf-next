import type { PrixM2Departement } from '@/app/(features)/prix-immobilier/ville/types/PrixM2Departement';
import { PrixM2DepartementSchema } from '@/app/(features)/prix-immobilier/ville/types/PrixM2Departement';
import { prisma } from '@/app/libs/prisma';

export async function getPrixM2DepartementFromCommune(
  codeCommune: string,
): Promise<PrixM2Departement | null> {
  try {
    const result = await prisma.$queryRaw<PrixM2Departement[]>`
      SELECT 
          d.code_departement,
          d.nom_departement,
          CEIL(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY t."valeur_fonciere" / t."surface_reelle_bati")) AS prix_m2_bas,
          CEIL(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t."valeur_fonciere" / t."surface_reelle_bati")) AS prix_m2_median,
          CEIL(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY t."valeur_fonciere" / t."surface_reelle_bati")) AS prix_m2_haut
      FROM "Transaction" t
      JOIN "Commune" c ON c.code_commune = ${codeCommune}
      JOIN "Departement" d ON d.code_departement = c.code_departement
      WHERE t."surface_reelle_bati" IS NOT NULL 
          AND t."surface_reelle_bati" > 10
          AND t."type_local" IN ('Maison', 'Appartement')
          AND t."code_departement" = c."code_departement"
          AND t."date_mutation" >= CURRENT_DATE - INTERVAL '1 year'
      GROUP BY d.code_departement, d.nom_departement;
    `;

    return result.length > 0 ? PrixM2DepartementSchema.parse(result[0]) : null;
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul des prix pour le département de la commune ${codeCommune} :`,
      error,
    );
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
