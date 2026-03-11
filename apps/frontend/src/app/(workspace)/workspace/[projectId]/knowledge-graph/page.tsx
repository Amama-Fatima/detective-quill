import KnowledgeGraphClient from "@/components/knowledge-graph/knowledge-graph-client";

export default function KnowledgeGraphPage() {
  return (
    <main className="h-screen flex flex-col bg-background font-serif overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        // style={{
        //   backgroundImage: `
        //     linear-gradient(var(--color-border) 1px, transparent 1px),
        //     linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
        //   `,
        //   backgroundSize: "48px 48px",
        // }}
      />

      <header className="relative z-10 px-8 pt-6 pb-4 flex flex-col gap-1 border-b border-border shrink-0">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary case-file">
          Detective Quill · Intelligence Network
        </p>
        <h1 className="text-3xl font-normal text-foreground tracking-wide mystery-title">
          Knowledge Graph
        </h1>
        
      </header>

      <section className="relative z-10 flex-1 min-h-[70vh] px-6 pb-4 pt-4 flex flex-col">
        <div className="flex-1 min-h-[60vh] rounded-xl overflow-hidden border border-border bg-card shadow-lg">
          <KnowledgeGraphClient />
        </div>
      </section>

      
    </main>
  );
}