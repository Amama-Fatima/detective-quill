import { Cpu } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-primary py-3 px-6 z-[1] flex justify-end">
      <div className="mx-auto max-w-6xl flex items-start gap-2">
        <Cpu className="h-5 w-5 mt-0.5 flex-shrink-0 text-background" />
        <p className="noir-text text-md text-background leading-relaxed">
          <span className="font-medium text-background">AI features</span>{" "}
          (knowledge graph generation & manuscript querying) are{" "}
          <strong>CURRENTLY NOT</strong> available for the{" "}
          <strong>DEPLOYED VERSION</strong> of the app and will be available in{" "}
          <strong>A FUTURE UPDATE</strong>. In the meantime, you can{" "}
          <strong>RUN THESE FEATURES LOCALLY</strong> by connecting your own{" "}
          <span className="font-bold text-background">Modal.com</span>{" "}
          account to deploy the NLP pipeline and query engine LLM.
        </p>
      </div>
    </footer>
  );
}
