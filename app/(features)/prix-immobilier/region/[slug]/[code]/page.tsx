import { SectionDepartements } from "@/app/(features)/prix-immobilier/region/components/SectionDepartements/SectionDepartements";
import { getRegionFromCode } from "@/app/(features)/prix-immobilier/region/services/getRegionFromCode";
import { getRegions } from "@/app/(features)/prix-immobilier/region/services/getRegions";
import { slugify } from "@/app/utils/slugify";

export async function generateStaticParams() {
  const regions = await getRegions();

  return regions.map((region) => ({
    slug: slugify(region.code_region),
    code: region.code_region,
  }));
}

type RegionPageProps = {
  params: Promise<{ slug: string; code: string }>;
};

export default async function Page({ params }: Readonly<RegionPageProps>) {
  const codeRegion = (await params).code;
  const region = await getRegionFromCode(codeRegion);

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-center text-lg font-semibold">
        Quel est le prix moyen au m² dans la région {region?.nom_region} ?
      </h1>
      <p className="text-center text-gray-600">
        Estimation au mois de Février 2025
      </p>
      <SectionDepartements codeRegion={codeRegion} />
    </section>
  );
}
