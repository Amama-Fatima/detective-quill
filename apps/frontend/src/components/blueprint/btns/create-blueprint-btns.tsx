"use client";
import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { useBlueprints } from "@/hooks/blueprints/use-blueprints";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function CreateBlueprintBtns({
  projectId,
}: {
  projectId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { createMutation } = useBlueprints();
  const loading = createMutation.isPending;
  const handleCreate = async (
    type: "character" | "timeline" | "item" | "location",
  ) => {
    const newBlueprintId = await createMutation.mutateAsync({
      type,
      project_id: projectId,
    });
    if (newBlueprintId) {
      router.push(`${pathname}/${newBlueprintId}?type=${type}`);
    }
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-primary shadow-lg cursor-pointer hover:-translate-y-0.5 duration-300 font-playfair-display text-[1rem]" disabled={loading}>
            <Plus className="h-5 w-5 mr-2" />
            Create New Blueprint
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            <Button
              className="cursor-pointer hover:-translate-y-0.5 duration-300 font-playfair-display text-[1rem]"
              onClick={() => handleCreate("character")}
              disabled={loading}
            >
              Character
            </Button>
            <Button
              className="cursor-pointer hover:-translate-y-0.5 duration-300 font-playfair-display text-[1rem]"
              onClick={() => handleCreate("timeline")}
              disabled={loading}
            >
              Timeline
            </Button>
            <Button
              className="cursor-pointer hover:-translate-y-0.5 duration-300 font-playfair-display text-[1rem]"
              onClick={() => handleCreate("item")}
              disabled={loading}
            >
              Item
            </Button>
            <Button
              className="cursor-pointer hover:-translate-y-0.5 duration-300 font-playfair-display text-[1rem]"
              onClick={() => handleCreate("location")}
              disabled={loading}
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
