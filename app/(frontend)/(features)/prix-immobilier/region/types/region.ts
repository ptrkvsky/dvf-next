import { z } from 'zod';

// 1️⃣ Définir le schéma des régions
const RegionSchema = z.object({
  code_region: z.string(),
  nom_region: z.string(),
});

// 2️⃣ Définir le schéma pour un tableau de régions
export const RegionsSchema = z.array(RegionSchema);

// 3️⃣ Typage de la sortie avec `infer`
export type Region = z.infer<typeof RegionSchema>;
