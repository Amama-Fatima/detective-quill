import Link from "next/link";
import CreateBlueprintBtns from "./create-blueprint-btns";
import { getUserBlueprints } from "@/lib/supabase-calls/blueprint";

interface BlueprintLandingProps {
  projectId: string;
  userId: string; //todo: create a protected route so there is no need to do sth like this
}

export default async function BlueprintLanding({
  projectId,
  userId,
}: BlueprintLandingProps) {
  const blueprints = await getUserBlueprints(userId);
  return (
    <div>
      <h1>Blueprint Page With All the blue prints</h1>
      {blueprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((blueprint) => (
            <div key={blueprint.id} className="border p-4 rounded">
              <Link href={`/workspace/${projectId}/blueprint/${blueprint.id}?type=${blueprint.type}`}>
                <h2 className="text-lg font-bold">{blueprint.title}</h2>
                <p>{blueprint.type}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <>No blueprints found</>
      )}
      <CreateBlueprintBtns projectId={projectId} />
    </div>
  );
}
