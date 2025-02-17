import type { Commune } from "@prisma/client";
import { PriceBar } from "@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/PriceBar/PriceBar";
import { getPrixM2Commune } from "@/app/(features)/prix-immobilier/ville/services/getPrixM2Commune";
import { getPrixM2DepartementFromCommune } from "@/app/(features)/prix-immobilier/ville/services/getPrixM2DepartementFromCommune";

type Props = {
  commune: Commune;
};

export async function Entete({ commune }: Readonly<Props>) {
  const month = new Date().toLocaleString("fr-FR", { month: "long" });
  const year = new Date().getUTCFullYear();

  const prixCommune = await getPrixM2Commune(commune.code_commune);

  const moyennePrixM2 =
    prixCommune.reduce((acc, cur) => acc + cur.prix_m2_median, 0) /
    prixCommune.length;

  const prixDepartement = await getPrixM2DepartementFromCommune(
    commune.code_commune
  );

  return (
    <>
      <h1 className="text-center text-lg font-semibold">
        Prix de l'immobilier au{" "}
        <abbr title="mètres carrés">
          m<sup>2</sup>
        </abbr>
        <br />
        {commune.nom_commune}
      </h1>

      <p className="text-center text-gray-600">
        Estimation au mois de {month} {year}
      </p>
      <p className="text-center text-gray-600">
        Prix moyen au m2 {moyennePrixM2}
      </p>

      {prixDepartement && (
        <PriceBar
          nomDepartement={prixDepartement.nom_departement}
          codeDepartement={prixDepartement.code_departement}
          codeCommune={commune.code_commune}
        />
      )}
    </>
  );
}
