import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/** 📌 Fonction pour récupérer les communes limitrophes */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code_commune = searchParams.get("code_commune");

  if (!code_commune) {
    return NextResponse.json(
      { message: "Code commune requis" },
      { status: 400 }
    );
  }

  try {
    // ✅ Récupère la commune cible
    const commune = await prisma.$queryRaw`
      SELECT code_commune, ST_AsGeoJSON(geometrie) as geojson 
      FROM "Commune" 
      WHERE code_commune = ${code_commune};
    `;

    // ✅ Récupère les communes limitrophes (touchant la commune cible)
    const communesLimitrophes = await prisma.$queryRaw`
      SELECT code_commune, ST_AsGeoJSON(geometrie) as geojson
      FROM "Commune" 
      WHERE ST_Touches((SELECT geometrie FROM "Commune" WHERE code_commune = ${code_commune}), geometrie);
    `;

    return NextResponse.json({
      commune: commune[0] || null,
      communesLimitrophes,
    });
  } catch (error) {
    console.error("❌ Erreur API :", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}
