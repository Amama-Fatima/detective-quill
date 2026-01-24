"use client";
import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { useBlueprints } from "@/hooks/use-blueprints";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateBlueprintBtns({
  projectId,
}: {
  projectId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { create, loading } = useBlueprints();
  const handleCreate = async (
    type: "character" | "timeline" | "item" | "location",
  ) => {
    const newBlueprint = await create(type, projectId);
    if (newBlueprint) {
      router.push(`${pathname}/${newBlueprint.id}?type=${type}`);
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
              disabled={loading}
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

            {loading && (
              <div className="text-sm text-muted-foreground">
                Creating and navigating to the new blueprint...
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
