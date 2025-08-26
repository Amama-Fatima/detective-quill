import CreateBlueprintBtns from "./create-blueprint-btns";
import { getUserBlueprints } from "@/lib/supabase-calls/blueprint";
import { UserBlueprintsList } from "./user-bueprints-list";

interface BlueprintLandingProps {
  projectId: string;
  userId: string; 
}

export default async function BlueprintLanding({
  projectId,
  userId,
}: BlueprintLandingProps) {
  const blueprints = await getUserBlueprints(userId);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Blueprints</h1>
            <p className="text-gray-400 mt-2">
              Manage and organize your reusable design components and templates
            </p>
          </div>
          <CreateBlueprintBtns projectId={projectId} />
        </div>
      </div>

      {/* Blueprints List */}
      <UserBlueprintsList blueprints={blueprints} projectId={projectId} />
    </div>
  );
}
