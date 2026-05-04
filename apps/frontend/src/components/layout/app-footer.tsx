import { Cpu } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-primary/80 py-3 px-6 z-[1]">
      <div className="mx-auto max-w-5xl flex items-start gap-2.5">
        <Cpu className="h-5 w-5 mt-0.5 flex-shrink-0 text-background" />
        <p className="noir-text text-md text-background leading-relaxed">
          <span className="font-medium text-background">AI features</span>
          {" "}(building the knowledge graph & querying the manuscript) do not
          work on the deployed app. To use these, please set up the project
          locally and connect to your own{" "}
          <span className="font-medium text-background">Modal.com</span>{" "}
          account to deploy the NLP pipeline and query engine LLM.
        </p>
      </div>
    </footer>
  );
}
