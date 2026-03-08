import KnowledgeGraphClient from "@/components/knowledge-graph/knowledge-graph-client";

export default function KnowledgeGraphPage() {
  return (
    <main className="h-screen flex flex-col bg-background font-serif overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 px-8 pt-10 pb-6 flex flex-col gap-1 border-b border-border shrink-0">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary case-file">
          Detective Quill · Intelligence Network
        </p>
        <h1 className="text-3xl font-normal text-foreground tracking-wide mystery-title">
          Knowledge Graph
        </h1>
        <p className="text-sm mt-0.5 text-muted-foreground max-w-[480px] leading-relaxed noir-text">
          A living map of characters, locations, organisations, and the
          connections that bind them. Every edge tells a story.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-primary via-border to-transparent opacity-50" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
        </div>
      </header>

      <section className="relative z-10 flex-1 min-h-0 px-6 pb-6 pt-6 flex flex-col">
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border bg-card shadow-lg">
          <KnowledgeGraphClient />
        </div>
      </section>

      <footer className="relative z-10 px-8 pb-4 text-center border-t border-border shrink-0">
        <p className="text-[10px] tracking-[0.2em] uppercase pt-4 text-muted-foreground case-file">
          Showing up to 500 relationships · Scene nodes excluded
        </p>
      </footer>
    </main>
  );
}