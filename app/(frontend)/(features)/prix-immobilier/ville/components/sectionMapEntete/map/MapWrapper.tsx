"use client";

import type { TransactionWithLocation } from "@/app/(frontend)/(features)/prix-immobilier/ville/components/sectionMapEntete/map/types";
import type { Commune } from "@prisma/client";
import dynamic from "next/dynamic";

const MapPrix = dynamic(() => import("../map/MapPrix"), {
  ssr: false,
});

type Props = {
  commune: Commune;
  transactions: TransactionWithLocation[];
  geometrie: any;
};

export default function MapWrapper({
  commune,
  transactions,
  geometrie,
}: Readonly<Props>) {
  return (
    <div className="relative h-full w-full">
      <MapPrix
        commune={commune}
        transactions={transactions}
        geometrie={geometrie}
      />
    </div>
  );
}
