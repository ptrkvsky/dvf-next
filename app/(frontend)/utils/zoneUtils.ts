// utils/zoneUtils.ts
import { PrismaClient } from "@prisma/client";
import * as turf from "@turf/turf";

const prisma = new PrismaClient();

/**
 * Crée une grille de zones pour une commune
 */
export async function createGridForCommune(commune, gridSize = 3) {
  try {
    // Récupérer la géométrie de la commune
    const communeGeom = commune.geometrie;

    if (!communeGeom) {
      throw new Error(
        `Pas de géométrie pour la commune ${commune.code_commune}`
      );
    }

    // Convertir la géométrie PostGIS en GeoJSON
    const geojson = await prisma.$queryRaw`
      SELECT ST_AsGeoJSON(${communeGeom}) as geojson
    `;

    // @ts-ignore - Type des résultats de requête brute
    const communeGeoJSON = JSON.parse(geojson[0].geojson);

    // Utiliser turf.js pour créer une grille
    const bbox = turf.bbox(communeGeoJSON);
    const cellWidth = (bbox[2] - bbox[0]) / gridSize;
    const cellHeight = (bbox[3] - bbox[1]) / gridSize;

    const grid = turf.pointGrid(bbox, cellWidth, { units: "degrees" });

    // Créer un polygone pour chaque cellule
    const zones = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellBbox = [
          bbox[0] + i * cellWidth,
          bbox[1] + j * cellHeight,
          bbox[0] + (i + 1) * cellWidth,
          bbox[1] + (j + 1) * cellHeight,
        ];

        const cell = turf.bboxPolygon(cellBbox);

        // Intersection avec la commune pour ne garder que la partie qui est dans la commune
        const intersection = turf.intersect(communeGeoJSON, cell);

        if (intersection) {
          zones.push({
            nom_zone: `Zone ${String.fromCharCode(65 + i)}${j + 1}`,
            code_commune: commune.code_commune,
            geojson: JSON.stringify(intersection),
          });
        }
      }
    }

    return zones;
  } catch (error) {
    console.error("Erreur lors de la création de la grille:", error);
    return [];
  }
}

/**
 * Crée des zones basées sur les divisions administratives
 */
export async function createAdministrativeZones(commune) {
  try {
    // Essayer d'abord de récupérer les codes postaux de la commune
    const codesPostaux = await prisma.$queryRaw`
      SELECT DISTINCT code_postal 
      FROM "Transaction" 
      WHERE code_commune = ${commune.code_commune} 
      AND code_postal IS NOT NULL
    `;

    // @ts-ignore - Type des résultats de requête brute
    if (codesPostaux.length > 1) {
      // Si la commune a plusieurs codes postaux, utiliser ceux-ci comme zones
      const zones = [];

      // @ts-ignore - Type des résultats de requête brute
      for (const cp of codesPostaux) {
        // Récupérer les points des transactions pour ce code postal
        const points = await prisma.$queryRaw`
          SELECT ST_AsGeoJSON(ST_Collect(ST_SetSRID(ST_Point(longitude, latitude), 4326))) as geojson
          FROM "Transaction" 
          WHERE code_commune = ${commune.code_commune} 
          AND code_postal = ${cp.code_postal}
          AND longitude IS NOT NULL 
          AND latitude IS NOT NULL
        `;

        // @ts-ignore - Type des résultats de requête brute
        if (points[0]?.geojson) {
          // Créer un buffer autour des points pour créer un polygone
          const buffer = await prisma.$queryRaw`
            SELECT ST_AsGeoJSON(
              ST_Buffer(
                ST_SetSRID(ST_GeomFromGeoJSON(${points[0].geojson}), 4326),
                0.003,
                'quad_segs=8'
              )
            ) as geojson
          `;

          zones.push({
            nom_zone: `${commune.nom_commune} - ${cp.code_postal}`,
            code_commune: commune.code_commune,
            // @ts-ignore - Type des résultats de requête brute
            geojson: buffer[0].geojson,
          });
        }
      }

      return zones;
    } else {
      // Si pas de divisions administratives, créer des clusters basés sur les prix
      return createPriceClusters(commune);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création des zones administratives:",
      error
    );
    return createPriceClusters(commune);
  }
}

/**
 * Crée des clusters basés sur les prix immobiliers
 */
async function createPriceClusters(commune) {
  try {
    // Diviser la commune en zones de prix similaires
    // Récupérer toutes les transactions avec leurs coordonnées
    const transactions = await prisma.$queryRaw`
      SELECT 
        t.valeur_fonciere, 
        t.surface_reelle_bati, 
        t.longitude, 
        t.latitude,
        t.type_local
      FROM "Transaction" t
      WHERE 
        t.code_commune = ${commune.code_commune}
        AND t.longitude IS NOT NULL 
        AND t.latitude IS NOT NULL
        AND t.surface_reelle_bati > 0
        AND t.type_local IN ('Maison', 'Appartement')
    `;

    // @ts-ignore - Type des résultats de requête brute
    if (transactions.length === 0) {
      return createDefaultZones(commune);
    }

    // Calculer le prix au m² pour chaque transaction
    // @ts-ignore - Type des résultats de requête brute
    const transactionsWithPriceM2 = transactions
      .map((t) => ({
        ...t,
        prix_m2: t.surface_reelle_bati
          ? t.valeur_fonciere / t.surface_reelle_bati
          : 0,
      }))
      .filter((t) => t.prix_m2 > 0);

    // Trouver les quartiles de prix au m²
    const prixM2 = transactionsWithPriceM2
      .map((t) => t.prix_m2)
      .sort((a, b) => a - b);
    const q1 = prixM2[Math.floor(prixM2.length * 0.25)];
    const q2 = prixM2[Math.floor(prixM2.length * 0.5)];
    const q3 = prixM2[Math.floor(prixM2.length * 0.75)];

    // Créer des clusters basés sur les quartiles
    const clusters = [
      {
        name: "Zone à prix modérés",
        transactions: transactionsWithPriceM2.filter((t) => t.prix_m2 <= q1),
      },
      {
        name: "Zone à prix moyens bas",
        transactions: transactionsWithPriceM2.filter(
          (t) => t.prix_m2 > q1 && t.prix_m2 <= q2
        ),
      },
      {
        name: "Zone à prix moyens hauts",
        transactions: transactionsWithPriceM2.filter(
          (t) => t.prix_m2 > q2 && t.prix_m2 <= q3
        ),
      },
      {
        name: "Zone à prix élevés",
        transactions: transactionsWithPriceM2.filter((t) => t.prix_m2 > q3),
      },
    ];

    // Créer des zones à partir des clusters
    const zones = [];

    for (const cluster of clusters) {
      if (cluster.transactions.length < 5) continue; // Ignorer les clusters avec trop peu de transactions

      // Créer un "nuage de points" pour ce cluster
      const points = cluster.transactions.map((t) => [t.longitude, t.latitude]);
      const features = points.map((p) => turf.point(p));
      const collection = turf.featureCollection(features);

      // Créer un buffer autour des points pour former une zone
      const concave = turf.concave(collection, {
        maxEdge: 0.01,
        units: "kilometers",
      });

      if (concave) {
        // Calculer le prix moyen au m² pour ce cluster
        const prixMoyenM2 = Math.round(
          cluster.transactions.reduce((sum, t) => sum + t.prix_m2, 0) /
            cluster.transactions.length
        );

        // Trouver le type de bien le plus courant
        const typeCount = {};
        let maxType = "";
        let maxCount = 0;

        for (const t of cluster.transactions) {
          if (!t.type_local) continue;

          typeCount[t.type_local] = (typeCount[t.type_local] || 0) + 1;

          if (typeCount[t.type_local] > maxCount) {
            maxCount = typeCount[t.type_local];
            maxType = t.type_local;
          }
        }

        zones.push({
          nom_zone: cluster.name,
          code_commune: commune.code_commune,
          geojson: JSON.stringify(concave),
          prix_moyen_m2: prixMoyenM2,
          nb_transactions: cluster.transactions.length,
          type_local: maxType,
        });
      }
    }

    return zones.length > 0 ? zones : createDefaultZones(commune);
  } catch (error) {
    console.error("Erreur lors de la création des clusters de prix:", error);
    return createDefaultZones(commune);
  }
}

/**
 * Crée des zones par défaut si aucune autre méthode ne fonctionne
 */
async function createDefaultZones(commune: any) {
  try {
    // Récupérer la géométrie de la commune
    const communeGeom = commune.geometrie;

    if (!communeGeom) {
      throw new Error(
        `Pas de géométrie pour la commune ${commune.code_commune}`
      );
    }

    // Convertir la géométrie PostGIS en GeoJSON
    const geojson = await prisma.$queryRaw`
      SELECT ST_AsGeoJSON(${communeGeom}) as geojson
    `;

    // @ts-expect-error - Type des résultats de requête brute
    const communeGeoJSON = JSON.parse(geojson[0].geojson);

    // Créer des secteurs "génériques" basés sur les points cardinaux
    const center = turf.centroid(communeGeoJSON);
    const bbox = turf.bbox(communeGeoJSON);

    // Diviser la commune en quadrants Nord-Est, Nord-Ouest, Sud-Est, Sud-Ouest
    const midX = center.geometry.coordinates[0];
    const midY = center.geometry.coordinates[1];

    const quadrants = [
      {
        name: "Nord-Est",
        bbox: [midX, midY, bbox[2], bbox[3]],
      },
      {
        name: "Nord-Ouest",
        bbox: [bbox[0], midY, midX, bbox[3]],
      },
      {
        name: "Sud-Est",
        bbox: [midX, bbox[1], bbox[2], midY],
      },
      {
        name: "Sud-Ouest",
        bbox: [bbox[0], bbox[1], midX, midY],
      },
    ];

    const zones = [];

    for (const quadrant of quadrants) {
      const quadrantPoly = turf.bboxPolygon(quadrant.bbox);
      const intersection = turf.intersect(communeGeoJSON, quadrantPoly);

      if (intersection) {
        // Récupérer les transactions dans ce quadrant
        const transactions = await prisma.$queryRaw`
          SELECT 
            AVG(CASE WHEN t.surface_reelle_bati > 0 THEN t.valeur_fonciere / t.surface_reelle_bati ELSE NULL END) as prix_moyen_m2,
            COUNT(*) as nb_transactions,
            MODE() WITHIN GROUP (ORDER BY t.type_local) as type_dominant
          FROM "Transaction" t
          WHERE 
            t.code_commune = ${commune.code_commune}
            AND t.longitude IS NOT NULL 
            AND t.latitude IS NOT NULL
            AND ST_Within(
              ST_SetSRID(ST_Point(t.longitude, t.latitude), 4326),
              ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(intersection)}), 4326)
            )
        `;

        zones.push({
          nom_zone: `Secteur ${quadrant.name}`,
          code_commune: commune.code_commune,
          geojson: JSON.stringify(intersection),
          // @ts-expect-error - Type des résultats de requête brute
          prix_moyen_m2: Math.round(transactions[0].prix_moyen_m2 || 0),
          nb_transactions:
            // @ts-expect-error - Type des résultats de requête brute
            Number.parseInt(transactions[0].nb_transactions) || 0,
          // @ts-expect-error - Type des résultats de requête brute
          type_local: transactions[0].type_dominant || "Divers",
        });
      }
    }

    return zones;
  } catch (error) {
    console.error("Erreur lors de la création des zones par défaut:", error);
    return [];
  }
}
