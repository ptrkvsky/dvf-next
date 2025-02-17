export function slugify(text: string): string {
  return text
    .normalize('NFD') // Supprime les accents
    .replace(/[\u0300-\u036F]/g, '') // Supprime les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-'); // Supprime les tirets doublons
}
