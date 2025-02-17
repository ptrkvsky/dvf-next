import { getCommunesAvecPrixMedian } from "@/app/(features)/prix-immobilier/departement/services/getCommunesAvecPrixMedian";
import { slugify } from "@/app/utils/slugify";

type Props = {
  codeDepartement: string;
};

export async function SectionVilles({ codeDepartement }: Readonly<Props>) {
  const communes = await getCommunesAvecPrixMedian(codeDepartement);

  const slugifiedCommunes = communes?.map((commune) => {
    return {
      ...commune,
      slug: slugify(commune.nom_commune),
    };
  });

  return (
    <section>
      <h2>Communes</h2>
      {communes?.length === 0 ? (
        <p>Aucune commune trouvée pour ce département</p>
      ) : (
        <ul>
          {slugifiedCommunes?.map((commune) => (
            <li key={commune.code_commune}>
              <a
                href={`/prix-immobilier/ville/${commune.slug}/${commune.code_commune}`}
              >
                {commune.nom_commune} ({commune.code_postal}) -{" "}
                {commune.prix_m2_median
                  ? `${commune.prix_m2_median} €/m²`
                  : "Pas de données"}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
