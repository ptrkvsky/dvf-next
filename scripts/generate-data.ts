import fs from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateRegions() {
  const PATH = "./public/data/regions.json";
  console.log("🔄 Récupération des données...");

  // Récupérer toutes les régions et leurs départements
  const regions = await prisma.region.findMany();

  console.log("✅ Données récupérées, écriture en JSON...");

  await writeFile(PATH, JSON.stringify(regions, null, 2));

  console.log("✅ Fichier JSON généré avec succès !");
}

async function generateDepartements() {
  const PATH = "./public/data/departements.json";
  console.log("🔄 Récupération des données...");

  // Récupérer toutes les régions et leurs départements
  const departements = await prisma.departement.findMany();

  console.log("✅ Données récupérées, écriture en JSON...");

  await writeFile(PATH, JSON.stringify(departements, null, 2));

  console.log("✅ Fichier JSON généré avec succès !");
}

const BATCH_SIZE = 10000; // Nombre de transactions traitées par lot
const OUTPUT_DIR = path.resolve("./public/data/transactions");

async function generateTransactionsJson() {
  console.log("🔄 Génération des JSONs de transactions par commune...");

  try {
    // Vérifier ou créer le dossier de sortie
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`📦 Récupération des transactions (offset: ${offset})...`);

      const transactionsBatch: any = await prisma.$queryRaw`
        SELECT "code_commune", "id_mutation", "date_mutation", "valeur_fonciere",
               "surface_reelle_bati", "nombre_pieces_principales", "type_local"
        FROM "Transaction"
        ORDER BY "code_commune"
        LIMIT ${BATCH_SIZE} OFFSET ${offset};
      `;

      if (transactionsBatch.length === 0) {
        hasMore = false;
        break;
      }

      // Organiser les transactions par code_commune
      const groupedTransactions: Record<string, any[]> = {};

      for (const transaction of transactionsBatch) {
        const { code_commune, ...transactionData } = transaction;
        if (!code_commune) {
          continue;
        }

        if (!groupedTransactions[code_commune]) {
          groupedTransactions[code_commune] = [];
        }

        groupedTransactions[code_commune].push(transactionData);
      }

      // Écriture des fichiers JSON par commune
      for (const [codeCommune, transactions] of Object.entries(
        groupedTransactions
      )) {
        const filePath = path.join(OUTPUT_DIR, `${codeCommune}.json`);

        // Lire les transactions existantes si le fichier existe
        let existingTransactions: any[] = [];
        if (fs.existsSync(filePath)) {
          existingTransactions = JSON.parse(
            fs.readFileSync(filePath, "utf-8") as any
          ) as any;
        }

        // Fusionner avec les nouvelles transactions et sauvegarder
        const updatedTransactions = [...existingTransactions, ...transactions];
        fs.writeFileSync(
          filePath,
          JSON.stringify(updatedTransactions, null, 2)
        );
        console.log(`✅ Transactions ajoutées pour la commune ${codeCommune}`);
      }

      // Incrémenter l'offset pour la pagination
      offset += BATCH_SIZE;
    }

    console.log("🎉 Génération des JSONs terminée !");
  } catch (error) {
    console.error("❌ Erreur lors de la génération des JSONs :", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateJSON() {
  await generateRegions();
  await generateDepartements();
  await generateTransactionsJson();
}

generateJSON()
  .catch((err) => {
    console.error("❌ Erreur lors de la génération du JSON", err);
    prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
