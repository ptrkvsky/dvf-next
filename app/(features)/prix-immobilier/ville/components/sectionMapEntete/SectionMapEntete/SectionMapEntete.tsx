import { Entete } from "@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/Entete/Entete";
import { MapPrix } from "@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix";
import { getCommuneByCode } from "@/app/(features)/prix-immobilier/ville/services/getCommuneByCode";
import { getTransactionsByCodeCommune } from "@/app/(features)/prix-immobilier/ville/services/getTransactionsByCodeCommune";

type Props = {
  codeCommune: string;
};

export async function SectionMapEntete({ codeCommune }: Readonly<Props>) {
  const commune = await getCommuneByCode(codeCommune);
  const transactions = await getTransactionsByCodeCommune(codeCommune);

  return (
    <section className="mt-8">
      {commune && <Entete commune={commune} />}
      {commune && <MapPrix transactions={transactions} commune={commune} />}``
    </section>
  );
}
