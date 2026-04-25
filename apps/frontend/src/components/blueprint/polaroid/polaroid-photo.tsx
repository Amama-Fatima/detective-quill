import Link from "next/link";
import {
  CharacterSilhouette,
  ItemSilhouette,
  LocationSilhouette,
} from "./polaroid-silhouettes";

interface PolaroidPhotoProps {
  type: string;
  projectId: string;
  blueprintId: string;
}

export default function PolaroidPhoto({
  type,
  projectId,
  blueprintId,
}: PolaroidPhotoProps) {
  const silhouette =
    type === "character" ? (
      <CharacterSilhouette />
    ) : type === "location" ? (
      <LocationSilhouette />
    ) : (
      <ItemSilhouette />
    );

  return (
    <Link
      href={`/workspace/${projectId}/blueprint/${blueprintId}?type=${type}`}
      className="block"
    >
      <div className="polaroid-photo">{silhouette}</div>
    </Link>
  );
}