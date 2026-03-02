import TextEditorContainer from "@/components/editor/text-editor-container";

export const metadata = {
  title: "Text Editor",
  description: "Text Editor page for editing text-based nodes",
};

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  return <TextEditorContainer />;
}
