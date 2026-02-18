import TextEditorContainer from "@/components/editor-workspace/editor/text-editor-container";

interface NodePageProps {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export default async function NodePage({ params }: NodePageProps) {
  return <TextEditorContainer />;
}
