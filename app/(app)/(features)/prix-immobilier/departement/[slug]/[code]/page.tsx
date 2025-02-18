import { SectionVilles } from "@/app/(app)/(features)/prix-immobilier/departement/components/SectionVilles";
import { getDepartements } from "@/app/(app)/(features)/prix-immobilier/departement/services/getDepartements";
import { slugify } from "@/app/(app)/utils/slugify";

export async function generateStaticParams() {
  const departements = await getDepartements();

  return departements.map((departement) => ({
    slug: slugify(departement.nom_departement),
    code: departement.code_departement,
  }));
}

type DepartementPageProps = {
  params: Promise<{ slug: string; code: string }>;
};

export default async function Page({ params }: Readonly<DepartementPageProps>) {
  const codeDepartement = (await params).code;

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-center text-lg font-semibold">
        Quel est le prix moyen au m² dans le département {codeDepartement} ?
      </h1>
      <p className="text-center text-gray-600">
        Estimation au mois de Février 2025
      </p>
      <SectionVilles codeDepartement={codeDepartement} />
    </section>
  );
}
