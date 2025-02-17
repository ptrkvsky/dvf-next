import { z } from "zod";

export const PrixM2CommuneSchema = z.object({
  type_logement: z.enum(["Maison", "Appartement", "Global"]),
  prix_m2_bas: z.number(),
  prix_m2_median: z.number(),
  prix_m2_haut: z.number(),
});

// Type TypeScript dérivé du schéma Zod
export type PrixM2Commune = z.infer<typeof PrixM2CommuneSchema>;
