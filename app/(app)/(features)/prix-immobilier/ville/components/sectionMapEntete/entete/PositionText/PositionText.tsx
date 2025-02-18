/* eslint-disable react-dom/no-dangerously-set-innerhtml */

import { generateUrlDpt } from "@/app/(app)/helpers/generateDptUrl";

type PositionTextProps = {
  percent: number;
  nomDepartement: string;
  codeDepartement: string;
};

export default function PositionText({
  percent,
  nomDepartement,
  codeDepartement,
}: Readonly<PositionTextProps>) {
  const positionText =
    percent < 50
      ? `Moins cher que dans <strong>${Math.round(percent)}%</strong> du`
      : `Plus cher que dans <strong>${Math.round(100 - percent)}%</strong> du`;

  return (
    <div className="mt-2 text-base">
      <span dangerouslySetInnerHTML={{ __html: positionText }} />{" "}
      <a
        title={`Prix de l'immobilier au m² dans le département ${nomDepartement}`}
        href={generateUrlDpt(codeDepartement, nomDepartement)}
        className="text-blue-600 hover:underline"
      >
        département {nomDepartement}
      </a>
    </div>
  );
}
