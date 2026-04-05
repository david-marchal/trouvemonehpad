"use client";

import dynamic from "next/dynamic";

const EstablishmentMap = dynamic(
  () => import("./EstablishmentMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-sage-50">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function EstablishmentMapWrapper({
  lat,
  lng,
  name,
  grade,
}: {
  lat: number;
  lng: number;
  name: string;
  grade: string | null;
}) {
  return <EstablishmentMap lat={lat} lng={lng} name={name} grade={grade} />;
}
