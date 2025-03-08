import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import { Entete } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/Entete/Entete";
import MapWrapper from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapWrapper";
import { getCommuneByCode } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getCommuneByCode";
import { getGeometryFromCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getGeometryFromCommune";
// import { getTransactionsByCodeCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getTransactionsByCodeCommune";

type Props = {
  codeCommune: string;
};

export async function SectionMapEntete({ codeCommune }: Readonly<Props>) {
  const commune = await getCommuneByCode(codeCommune);
  const geometrie: GeoJSONGeometry | null =
    await getGeometryFromCommune(codeCommune);
  // const transactions = await getTransactionsByCodeCommune(codeCommune);

  return (
    <section className="grid max-h-[1000px] grid-cols-[550px_1fr] gap-6">
      {commune && <Entete commune={commune} />}
      {commune && (
        <MapWrapper
          geometrie={geometrie}
          // transactions={transactions}
          commune={commune}
        />
      )}
      ``
    </section>
  );
}
