import Canvas from "@/components/blueprint/canvas";

export default async function CanvasPage() {
  return (
    <div>
      <h1>
        <Canvas projectName="My Project" type="character" />
      </h1>
    </div>
  );
}
