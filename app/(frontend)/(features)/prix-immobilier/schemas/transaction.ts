import type { Transaction } from "@prisma/client";
import { z } from "zod";

type TransactionWithStringDate = Omit<Transaction, "date_mutation"> & {
  date_mutation: string;
};

// Utiliser satisfies avec l'interface Transaction (type d'entrée)
export const TransactionSchema = z.object({
  id_mutation: z.string(),
  date_mutation: z.string(),
  nature_mutation: z.string(),
  valeur_fonciere: z.number(),
  nombre_lots: z.number().nullable(),
  surface_reelle_bati: z.number().nullable(),
  nombre_pieces_principales: z.number().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  code_commune: z.string(),
  adresse_nom_voie: z.string().nullable(),
  code_postal: z.string().nullable(),
  adresse_code_voie: z.string().nullable(),
  adresse_numero: z.string().nullable(),
  code_nature_culture: z.string().nullable(),
  id_parcelle: z.string().nullable(),
  nature_culture: z.string().nullable(),
  type_local: z
    .enum(["Maison", "Appartement", "LocalCommercial", "Terrain"])
    .nullable(),
  code_departement: z.string().nullable(),
}) satisfies z.ZodType<TransactionWithStringDate>;
