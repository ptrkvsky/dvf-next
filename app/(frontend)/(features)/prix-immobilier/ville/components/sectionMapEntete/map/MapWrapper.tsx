"use client";

import type { GeoJSONGeometry } from "@/app/(frontend)/(features)/prix-immobilier/interfaces/geojson";
import type { Commune } from "@prisma/client";
import dynamic from "next/dynamic";

const MapPrix = dynamic(() => import("./MapPrix/MapPrix"), {
  ssr: false,
});

type Props = {
  commune: Commune;
  geometrie: GeoJSONGeometry | null;
};

export default function MapWrapper({ commune, geometrie }: Readonly<Props>) {
  return (
    <div className="relative h-full w-full">
      <MapPrix commune={commune} geometrie={geometrie} />
    </div>
  );
}
