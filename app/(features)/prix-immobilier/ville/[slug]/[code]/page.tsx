import { SectionMapEntete } from '@/app/(features)/prix-immobilier/ville/components/sectionMapEntete/SectionMapEntete/SectionMapEntete';
import { getCommunes } from '@/app/(features)/prix-immobilier/ville/services/getCommunes';
import { slugify } from '@/app/utils/slugify';

export async function generateStaticParams() {
  const communes = await getCommunes();

  return communes.map(commune => ({
    slug: slugify(commune.code_commune),
    code: commune.code_commune,
  }));
}

type DepartementPageProps = {
  params: Promise<{ slug: string; code: string }>;
};

export default async function Page({ params }: Readonly<DepartementPageProps>) {
  const codeCommune = (await params).code;

  return <SectionMapEntete codeCommune={codeCommune} />;
}
