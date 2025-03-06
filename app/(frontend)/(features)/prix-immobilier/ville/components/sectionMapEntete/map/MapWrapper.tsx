"use client";

import type { Commune } from "@prisma/client";
import dynamic from "next/dynamic";

const MapPrix = dynamic(() => import("../map/MapPrix"), {
  ssr: false,
});

type Props = {
  commune: Commune;
  geometrie: any;
};

export default function MapWrapper({ commune, geometrie }: Readonly<Props>) {
  return (
    <div className="relative h-full w-full">
      <MapPrix commune={commune} geometrie={geometrie} />
    </div>
  );
}
