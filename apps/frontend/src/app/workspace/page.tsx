import WorkspaceWrapper from "@/components/workspace/workspace-wrapper";

export const metadata = {
  title: "Markdown Text Editor",
  description:
    "An Obsidian-like Markdown editor with file tree and split preview.",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <WorkspaceWrapper />
    </main>
  );
}
