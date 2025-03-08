import type { CommunesLimitrophes } from "@/app/api/communes-limitrophes/route";
import type { Commune } from "@prisma/client";

/** 🔹 Récupère les communes limitrophes via API */
export async function getCommunesLimitrophes(code_commune: string) {
  const res = await fetch(
    `/api/communes-limitrophes?code_commune=${code_commune}`
  );
  if (!res.ok) throw new Error("Échec récupération communes limitrophes");
  const data = (await res.json()) as {
    commune: Commune;
    communesLimitrophes: CommunesLimitrophes[];
  };

  console.log(data);

  return data.communesLimitrophes || [];
}
