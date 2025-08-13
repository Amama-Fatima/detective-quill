import Link from "next/link";

interface CreateBlueprintBtnsProps {
  projectName: string;
}

export default function CreateBlueprintBtns({
  projectName,
}: CreateBlueprintBtnsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/blueprint/create/character"
        className="inline-block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <h2 className="text-xl font-bold mb-1">
          Create New Character Blueprint
        </h2>
        <p className="text-gray-200 text-sm">
          Define your characters' bios, traits, and backstories.
        </p>
      </Link>
      <Link
        href="/blueprint/create/culture"
        className="inline-block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <h2 className="text-xl font-bold mb-1">Create New Culture Blueprint</h2>
        <p className="text-gray-200 text-sm">
          Create societies, traditions, and world-building elements.
        </p>
      </Link>
    </div>
  );
}
