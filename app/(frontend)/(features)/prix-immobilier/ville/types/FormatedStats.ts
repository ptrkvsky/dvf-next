import { z } from "zod";

type RawStats = {
  prix_moyen_m2: number | null;
  prix_min_m2: number | null;
  prix_max_m2: number | null;
  nombre_transactions: bigint | null;
};

export type FormattedStats = {
  prix_moyen_m2: number;
  prix_min_m2: number;
  prix_max_m2: number;
  nombre_transactions: number;
};

export const FormattedStatsSchema = z.object({
  prix_moyen_m2: z.number(),
  prix_min_m2: z.number(),
  prix_max_m2: z.number(),
  nombre_transactions: z.number(),
});
