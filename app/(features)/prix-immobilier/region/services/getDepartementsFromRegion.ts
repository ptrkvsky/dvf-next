import { prisma } from '@/app/libs/prisma';

export type DepartementAvecPrix = {
  code_departement: string;
  nom_departement: string;
  prix_m2_bas: number | null;
  prix_m2_median: number | null;
  prix_m2_haut: number | null;
};

export async function getDepartementsFromRegion(
  codeRegion: string,
): Promise<DepartementAvecPrix[]> {
  try {
    return await prisma.$queryRaw<DepartementAvecPrix[]>`
      SELECT 
        d.code_departement,
        d.nom_departement,
        CEIL(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY t.valeur_fonciere / t.surface_reelle_bati)) AS prix_m2_bas,
        CEIL(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.valeur_fonciere / t.surface_reelle_bati)) AS prix_m2_median,
        CEIL(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY t.valeur_fonciere / t.surface_reelle_bati)) AS prix_m2_haut
      FROM "Departement" d
      LEFT JOIN "Transaction" t ON d.code_departement = t.code_departement
      WHERE d.code_region = ${codeRegion}
        AND t.surface_reelle_bati IS NOT NULL 
        AND t.surface_reelle_bati > 10
        AND t.type_local IN ('Maison', 'Appartement') -- ✅ On garde seulement Maisons/Appartements
      GROUP BY d.code_departement, d.nom_departement
      ORDER BY d.nom_departement ASC;
    `;
  } catch (error) {
    console.error(
      `❌ Erreur lors du chargement des départements pour la région ${codeRegion} :`,
      error,
    );
    return [];
  }
}
