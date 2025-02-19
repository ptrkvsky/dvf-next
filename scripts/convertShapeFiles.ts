// scripts/convertShapefiles.ts
import fs from "node:fs/promises";
import path from "node:path";
import shp from "shpjs";

async function convertShapefileToGeoJSON(inputDir: string, outputDir: string) {
  try {
    const data = await fs.readFile("../data/communes-20220101.shp");
    const geojson = await shp(data);
    console.log("Conversion des shapefiles en GeoJSON...", geojson);
  } catch (error) {
    console.error(
      "Erreur lors de la conversion des shapefiles en GeoJSON:",
      error
    );
    throw error;
  }
}

// Si exécuté directement (pas importé comme module)
if (require.main === module) {
  const inputDir = path.join(process.cwd(), "data", "shapefiles");
  const outputDir = path.join(process.cwd(), "public", "geo");

  convertShapefileToGeoJSON(inputDir, outputDir);
}
