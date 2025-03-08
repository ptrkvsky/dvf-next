import type { CommunesLimitrophes } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/CommunesLimnitrophes";
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
    // ✅ Récupère les communes limitrophes (touchant la commune cible)
    const communesLimitrophes = await prisma.$queryRaw<CommunesLimitrophes>`
      SELECT code_commune, ST_AsGeoJSON(geometrie) as geojson
      FROM "Commune" 
      WHERE ST_Touches((SELECT geometrie FROM "Commune" WHERE code_commune = ${code_commune}), geometrie);
    `;

    return NextResponse.json({
      communesLimitrophes,
    });
  } catch (error: unknown) {
    console.error("❌ Erreur API :", error);
    return NextResponse.json(
      {
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
