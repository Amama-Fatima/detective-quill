import CreateBlueprintBtns from "./create-blueprint-btns";

interface BlueprintLandingProps {
  projectName: string;
}

export default async function BlueprintLanding({
  projectName,
}: BlueprintLandingProps) {
  return (
    <div>
      <h1>Blueprint Page With All the blue prints</h1>
      <CreateBlueprintBtns projectName={projectName} />
    </div>
  );
}
