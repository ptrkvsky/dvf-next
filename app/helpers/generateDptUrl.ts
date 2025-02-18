export function generateUrlDpt(
  codeDepartement: string,
  nomDepartement: string,
) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/prix-immobilier/departement/${nomDepartement}/${codeDepartement}`;
  return url;
}
