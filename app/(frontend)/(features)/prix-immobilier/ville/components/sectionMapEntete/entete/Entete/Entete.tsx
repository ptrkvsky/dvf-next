import type { Commune } from "@prisma/client";
import { PriceBar } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/PriceBar/PriceBar";
import { getPrixM2DepartementFromCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getPrixM2DepartementFromCommune";

type Props = {
  commune: Commune;
};

export async function Entete({ commune }: Readonly<Props>) {
  const month = new Date().toLocaleString("fr-FR", { month: "long" });
  const year = new Date().getUTCFullYear();

  const prixDepartement = await getPrixM2DepartementFromCommune(
    commune.code_commune
  );

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-lg max-w-3xl mx-auto">
      <div className="">
        {/* Titre principal */}
        <h1 className="text-xl font-light text-serif leading-none text-center">
          Prix de l'immobilier au{" "}
          <abbr
            title="mètres carrés"
            className="no-underline border-b border-dotted border-primary"
          >
            m<sup>2</sup>
          </abbr>
          <span className="text-4xl block font-bold mt-2 text-primary">
            {commune.nom_commune}
          </span>
          <span className="text-sm text-sans">
            Estimation{" "}
            <strong>
              {month} {year}
            </strong>
          </span>
        </h1>

        {/* Composant PriceBar */}
        {prixDepartement && (
          <div className="w-full mt-5">
            <PriceBar
              nomDepartement={prixDepartement.nom_departement}
              codeDepartement={prixDepartement.code_departement}
              codeCommune={commune.code_commune}
            />
          </div>
        )}
      </div>
    </div>
  );
}
