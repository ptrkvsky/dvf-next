import { Entete } from "@/app/(app)/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/Entete/Entete";
import { MapPrix } from "@/app/(app)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapPrix";
import { getCommuneByCode } from "@/app/(app)/(features)/prix-immobilier/ville/services/getCommuneByCode";
import { getTransactionsByCodeCommune } from "@/app/(app)/(features)/prix-immobilier/ville/services/getTransactionsByCodeCommune";

type Props = {
  codeCommune: string;
};

export async function SectionMapEntete({ codeCommune }: Readonly<Props>) {
  const commune = await getCommuneByCode(codeCommune);
  const transactions = await getTransactionsByCodeCommune(codeCommune);

  return (
    <section className="grid max-h-[530px] grid-cols-[550px_1fr] gap-6">
      {commune && <Entete commune={commune} />}
      {commune && <MapPrix transactions={transactions} commune={commune} />}
      ``
    </section>
  );
}
