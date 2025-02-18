import type { Commune } from '@prisma/client';
import { PriceBar } from '@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/PriceBar/PriceBar';
import { getPrixM2Commune } from '@/app/(features)/prix-immobilier/ville/services/getPrixM2Commune';
import { getPrixM2DepartementFromCommune } from '@/app/(features)/prix-immobilier/ville/services/getPrixM2DepartementFromCommune';

type Props = {
  commune: Commune;
};

export async function Entete({ commune }: Readonly<Props>) {
  const month = new Date().toLocaleString('fr-FR', { month: 'long' });
  const year = new Date().getUTCFullYear();

  const prixCommune = await getPrixM2Commune(commune.code_commune);

  const moyennePrixM2
    = prixCommune.reduce((acc, cur) => acc + cur.prix_m2_median, 0)
      / prixCommune.length;

  const prixDepartement = await getPrixM2DepartementFromCommune(
    commune.code_commune,
  );

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-lg max-w-3xl mx-auto">
      <div className="">
        {/* Titre principal */}
        <h1 className="text-xl font-light text-serif leading-none text-center">
          Prix de l'immobilier au
          {' '}
          <abbr
            title="mètres carrés"
            className="no-underline border-b border-dotted border-primary"
          >
            m
            <sup>2</sup>
          </abbr>
          <span className="text-4xl block font-bold mt-2 text-primary">
            {commune.nom_commune}
          </span>
          <span className="text-sm text-sans">
            Estimation
            {' '}
            <strong>
              {month}
              {' '}
              {year}
            </strong>
          </span>
        </h1>

        {/* Nom de la commune */}

        {/* Date de l'estimation */}

        {/* Prix moyen */}
        <p className="text-lg text-center font-medium mt-4">
          Prix median
          {' '}
          <span className="text-primary font-bold">
            {moyennePrixM2.toFixed(0)}
            {' '}
            € / m²
          </span>
        </p>

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
