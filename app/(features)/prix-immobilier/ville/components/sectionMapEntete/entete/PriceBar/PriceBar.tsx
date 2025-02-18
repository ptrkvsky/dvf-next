import PositionText from '@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/PositionText/PositionText';
import { getPrixM2CommuneGlobal } from '@/app/(features)/prix-immobilier/ville/services/getPrixM2CommuneGlobal';
import { formatPrice } from '@/app/utils/formatPrice';

type Props = {
  codeCommune: string;
  nomDepartement: string;
  codeDepartement: string;
};

export async function PriceBar({
  codeCommune,
  nomDepartement,
  codeDepartement,
}: Readonly<Props>) {
  const prixGlobal = await getPrixM2CommuneGlobal(codeCommune);

  if (
    !prixGlobal
    || !prixGlobal.prix_m2_median
    || !prixGlobal.prix_m2_bas
    || !prixGlobal.prix_m2_haut
  ) {
    console.error(`Prix médian non trouvé pour la commune ${codeCommune}`);
    return null;
  }

  // Calcul du pourcentage de positionnement du prix de la commune sur la frise
  const percent
    = ((prixGlobal.prix_m2_median - prixGlobal.prix_m2_bas)
      / (prixGlobal.prix_m2_haut - prixGlobal.prix_m2_bas))
    * 100;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold font-serif">
        {formatPrice(prixGlobal.prix_m2_median)}
        {' '}
        €
      </h2>

      <div className="relative mt-3">
        <div className="flex w-full h-3 rounded-lg overflow-hidden">
          <div className="flex-grow h-full bg-green-500"></div>
          <div className="flex-grow h-full bg-lime-500"></div>
          <div className="flex-grow h-full bg-yellow-400"></div>
          <div className="flex-grow h-full bg-yellow-300"></div>
          <div className="flex-grow h-full bg-yellow-200"></div>
          <div className="flex-grow h-full bg-orange-400"></div>
          <div className="flex-grow h-full bg-orange-500"></div>
          <div className="flex-grow h-full bg-red-500"></div>
          <div className="flex-grow h-full bg-red-600"></div>
        </div>

        <div
          className="absolute top-[-6px] left-0 w-5 h-5 border-2 border-white bg-red-500 rounded-full shadow-md"
          style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="flex justify-between text-sm mt-2 text-gray-600">
        <span>
          Prix bas
          {formatPrice(prixGlobal.prix_m2_bas)}
          {' '}
          €
        </span>
        <span>
          Prix haut
          {formatPrice(prixGlobal.prix_m2_haut)}
          {' '}
          €
        </span>
      </div>

      <PositionText
        percent={percent}
        nomDepartement={nomDepartement}
        codeDepartement={codeDepartement}
      />
    </div>
  );
}
