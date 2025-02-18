import { getDepartementsFromRegion } from '@/app/(features)/prix-immobilier/region/services/getDepartementsFromRegion';
import { slugify } from '@/app/utils/slugify';

type Props = {
  codeRegion: string;
};

export async function SectionDepartements({ codeRegion }: Readonly<Props>) {
  const departements = await getDepartementsFromRegion(codeRegion);

  // Vérification si des départements existent
  if (!departements || departements.length === 0) {
    return (
      <section>
        <h2>Départements</h2>
        <p>Aucun département trouvé pour cette région</p>
      </section>
    );
  }

  // Ajout du slug pour chaque département
  const slugifiedDepartements = departements.map(dept => ({
    ...dept,
    slug: slugify(dept.nom_departement),
  }));

  return (
    <section>
      <h2>Départements</h2>
      <ul>
        {slugifiedDepartements.map(dept => (
          <li key={dept.code_departement}>
            <a
              href={`/prix-immobilier/departement/${dept.slug}/${dept.code_departement}`}
            >
              {dept.nom_departement}
              {' '}
              (
              {dept.code_departement}
              ) (
              {dept.prix_m2_median}
              {' '}
              €)
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
