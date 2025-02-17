import { z } from "zod";

export const PrixM2DepartementSchema = z.object({
  code_departement: z.string(),
  nom_departement: z.string(),
  prix_m2_bas: z.number().nullable(),
  prix_m2_median: z.number().nullable(),
  prix_m2_haut: z.number().nullable(),
});

export type PrixM2Departement = z.infer<typeof PrixM2DepartementSchema>;
