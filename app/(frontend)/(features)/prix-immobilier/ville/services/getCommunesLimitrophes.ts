import type { CommunesLimitrophes } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/CommunesLimnitrophes";
import { validateGeoJSONGeometry } from "@/app/(frontend)/utils/validateGeoJSONGeometry";

import { z } from "zod";

/** 📌 Définition du schéma pour une commune limitrophe */
const CommuneLimitropheSchema = z.object({
  code_commune: z.string().min(1), // Code commune sous forme de string non vide
  geojson: z.string().min(1), // GeoJSON sous forme de chaîne
});

/** 📌 Schéma pour la réponse de l'API */
const CommunesLimitrophesSchema = z.object({
  communesLimitrophes: z.array(CommuneLimitropheSchema), // Tableau de communes limitrophes
});

/** 🔹 Récupère les communes limitrophes via API */
export async function getCommunesLimitrophes(
  code_commune: string
): Promise<CommunesLimitrophes[]> {
  const res = await fetch(
    `/api/communes-limitrophes?code_commune=${code_commune}`
  );
  if (!res.ok) throw new Error("Échec récupération communes limitrophes");
  const data = await res.json();

  // ✅ Validation avec Zod
  const parsedData = CommunesLimitrophesSchema.safeParse(data);
  if (!parsedData.success) {
    console.error("❌ Erreur validation des données :", parsedData.error);
    throw new Error("Données invalides reçues de l'API");
  }

  const dataWithGeoJSON = parsedData.data.communesLimitrophes
    .map((commune) => {
      const validGeometry = validateGeoJSONGeometry(commune.geojson);
      if (!validGeometry) {
        console.error(
          "❌ Erreur lors de la validation de la géométrie:",
          validGeometry
        );
        return null;
      }

      const communeLimitrope: CommunesLimitrophes = {
        codeCommune: commune.code_commune,
        geometrie: validGeometry,
      };
      return communeLimitrope;
    })
    .filter((communeLimitrope) => communeLimitrope !== null);

  return dataWithGeoJSON;
}
