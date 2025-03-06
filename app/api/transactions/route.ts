import type { FormattedStats } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/FormatedStats";
import type { TransactionStats } from "@/app/(frontend)/(features)/prix-immobilier/ville/types/TransactionStats";
import type { Prisma } from "@prisma/client";
// Route: /api/transactions
import type { NextRequest } from "next/server";
import { getTransactionsByCodeCommune } from "@/app/(frontend)/(features)/prix-immobilier/ville/services/getTransactionsByCodeCommune";
import { PrismaClient, TypeLocal } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code_commune = searchParams.get("code_commune");
    const limit = Number.parseInt(searchParams.get("limit") || "500");
    const type_local_param = searchParams.get("type_local");
    const type_local = z
      .nativeEnum(TypeLocal)
      .nullable()
      .parse(type_local_param);

    if (!code_commune) {
      return NextResponse.json(
        { error: "Code commune requis" },
        { status: 400 }
      );
    }

    // Construire la requête de base
    const whereClause: Prisma.TransactionWhereInput = {
      code_commune,
      latitude: { not: null },
      longitude: { not: null },
      surface_reelle_bati: { gt: 0 },
      valeur_fonciere: { gt: 0 },
      type_local: undefined,
    };

    // Ajouter le filtre par type si nécessaire
    if (type_local) {
      whereClause.type_local = type_local;
    } else {
      // Par défaut, récupérer seulement les maisons et les appartements
      whereClause.type_local = { in: ["Maison", "Appartement"] };
    }

    // Récupérer les transactions
    const transactions = await getTransactionsByCodeCommune(
      code_commune,
      whereClause
    );

    // Calculer quelques statistiques générales
    const stats = await prisma.$queryRaw<TransactionStats[]>`
      SELECT 
        AVG(CASE WHEN "surface_reelle_bati" > 0 THEN "valeur_fonciere" / "surface_reelle_bati" ELSE NULL END) as prix_moyen_m2,
        MIN(CASE WHEN "surface_reelle_bati" > 0 THEN "valeur_fonciere" / "surface_reelle_bati" ELSE NULL END) as prix_min_m2,
        MAX(CASE WHEN "surface_reelle_bati" > 0 THEN "valeur_fonciere" / "surface_reelle_bati" ELSE NULL END) as prix_max_m2,
        COUNT(*) as nombre_transactions
      FROM "Transaction"
      WHERE 
        "code_commune" = ${code_commune}
        AND "surface_reelle_bati" > 0
        AND "valeur_fonciere" > 0
        AND "type_local" IN ('Maison', 'Appartement')
    `;

    // Convertir les BigInt en Number pour la sérialisation JSON
    const statsFormatted: FormattedStats = {
      prix_moyen_m2: stats[0].prix_moyen_m2
        ? Number(stats[0].prix_moyen_m2)
        : 0,
      prix_min_m2: stats[0].prix_min_m2 ? Number(stats[0].prix_min_m2) : 0,
      prix_max_m2: stats[0].prix_max_m2 ? Number(stats[0].prix_max_m2) : 0,
      nombre_transactions: stats[0].nombre_transactions
        ? Number(stats[0].nombre_transactions)
        : 0,
    };

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        valeur_fonciere: Number(t.valeur_fonciere),
        surface_reelle_bati: Number(t.surface_reelle_bati),
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
      })),
      stats: statsFormatted,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
