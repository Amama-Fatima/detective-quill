"use client";
import { useRouter } from "next/navigation";
import { createBlueprint } from "@/lib/backend-calls/blueprints";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    console.log("About to send with project id as ", projectId)
    const result = await createBlueprint(accessToken, {
      type,
      project_id: projectId,
      title: "Untitled",
    });
    if (result.success && result.data?.id) {
      toast.success("Blueprint created successfully!");
      router.push(`${pathname}/${result.data.id}?type=${type}`);
    } else {
      console.log("Failed to create blueprint:", result);
      toast.error("Failed to create blueprint.");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center-safe">
      <Button
        onClick={() => handleCreate("character")}
        className="cursor-pointer"
      >
        <h2 className="text-xl font-bold mb-1">
          Create New Character Blueprint
        </h2>
      </Button>
      <Button
        onClick={() => handleCreate("timeline")}
        className="cursor-pointer"
      >
        <h2 className="text-xl font-bold mb-1">
          Create New Timeline Blueprint
        </h2>
      </Button>
    </div>
  );
}
