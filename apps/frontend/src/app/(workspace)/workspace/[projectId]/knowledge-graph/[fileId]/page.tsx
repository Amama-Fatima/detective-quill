import KnowledgeGraphClient from "@/components/knowledge-graph/knowledge-graph-client";

type Props = {
  params: Promise<{ projectId: string; fileId: string }>;
};

export default async function KnowledgeGraphFilePage({ params }: Props) {
  const { projectId: _projectId, fileId } = await params;

  return (
    <main className="h-[90vh] flex flex-col bg-background font-serif overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40" />

      <section className="relative z-10 flex-1 min-h-[70vh] px-6 pb-4 pt-4 flex flex-col">
        <div className="flex-1 min-h-[60vh] rounded-xl overflow-hidden border border-border bg-card shadow-lg">
          <KnowledgeGraphClient fileId={fileId} />
        </div>
      </section>
    </main>
  );
}
