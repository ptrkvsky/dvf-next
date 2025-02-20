import { Entete } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/entete/Entete/Entete";
import MapWrapper from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/MapWrapper";
import { getCommuneByCode } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getCommuneByCode";
import { getTransactionsByCodeCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getTransactionsByCodeCommune";
import { prisma } from "@/app/(frontend)/libs/prisma";

type Props = {
  codeCommune: string;
};

export async function SectionMapEntete({ codeCommune }: Readonly<Props>) {
  const commune = await getCommuneByCode(codeCommune);
  const transactions = await getTransactionsByCodeCommune(codeCommune);
  const geometrie = await prisma.$queryRaw`
  SELECT ST_AsGeoJSON(geometrie) as geojson FROM "Commune" WHERE code_commune = ${commune.code_commune};
`;

  return (
    <section className="grid max-h-[1000px] grid-cols-[550px_1fr] gap-6">
      {commune && <Entete commune={commune} />}
      {commune && (
        <MapWrapper
          geometrie={geometrie}
          transactions={transactions}
          commune={commune}
        />
      )}
      ``
    </section>
  );
}
