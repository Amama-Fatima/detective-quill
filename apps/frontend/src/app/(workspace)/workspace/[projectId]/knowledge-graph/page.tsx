import KnowledgeGraphClient from "@/components/knowledge-graph/knowledge-graph-client";

export default function KnowledgeGraphPage() {
  return (
    <main className="h-[95vh] flex flex-col overflow-hidden">

      <section className="relative z-10 flex-1 px-6 flex flex-col">
        <div className="flex-1 rounded-xl overflow-hidden border border-border bg-muted shadow-lg">
          <KnowledgeGraphClient />
        </div>
      </section>
    </main>
  );
}
