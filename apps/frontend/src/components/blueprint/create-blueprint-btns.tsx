"use client";
import { useRouter } from "next/navigation";
import { createBlueprint } from "@/lib/backend-calls/blueprints";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

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

  const handleCreate = async (type: "character" | "timeline" | "item" | "location") => {
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
    <div>
      <Popover>
        <PopoverTrigger className="bg-primary px-4 py-2 cursor-pointer rounded-md text-white hover:bg-primary/90 shadow-lg">
          Create New Blueprint
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            <Button
              className="cursor-pointer"
              onClick={() => handleCreate("character")}
            >
              Character
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => handleCreate("timeline")}
            >
              Timeline
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => handleCreate("item")}
            >
              Item
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => handleCreate("location")}
            >
              Location
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
