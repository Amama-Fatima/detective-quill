"use-client";
import { useRouter } from "next/navigation";
import { createBlueprint } from "@/lib/api/backend-calls/blueprints";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function CreateBlueprintBtns({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const handleCreate = async (type: "character" | "timeline") => {
    const result = await createBlueprint(accessToken, {
      type,
      projectId,
      title: "Untitled",
    });
    if (result.success && result.data?.id) {
      toast.success("Blueprint created successfully!");
      router.push(`${pathname}/${result.data.id}?type=${type}`);
    } else {
      toast.error("Failed to create blueprint.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className="inline-block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => handleCreate("character")}
      >
        <h2 className="text-xl font-bold mb-1">
          Create New Character Blueprint
        </h2>
        <p className="text-gray-200 text-sm">
          Define your characters' bios, traits, and backstories.
        </p>
      </button>
      <button
        className="inline-block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => handleCreate("timeline")}
      >
        <h2 className="text-xl font-bold mb-1">
          Create New Timeline Blueprint
        </h2>
        <p className="text-gray-200 text-sm">
          Create timelines, events, and historical contexts.
        </p>
      </button>
    </div>
  );
}
