/** BlockNote block shape: id, type, props, content (InlineContent[]), children (Block[]) */
type BlockLike = {
  content?: unknown;
  children?: unknown[];
};

/** InlineContent: StyledText { type:"text", text, styles } or Link { type:"link", content: StyledText[], href } */
function getInlineTextParts(contentArr: unknown[]): string[] {
  const parts: string[] = [];
  for (const item of contentArr) {
    if (item == null || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (obj.type === "text" && typeof obj.text === "string") {
      parts.push(obj.text);
    } else if (obj.type === "link" && Array.isArray(obj.content)) {
      parts.push(...getInlineTextParts(obj.content));
    }
  }
  return parts;
}

function extractTextFromBlocks(blocks: unknown[]): string[] {
  const blockTexts: string[] = [];
  for (const block of blocks) {
    if (block == null || typeof block !== "object") continue;
    const b = block as BlockLike;
    const content = b.content;
    if (Array.isArray(content)) {
      const parts = getInlineTextParts(content);
      if (parts.length > 0) blockTexts.push(parts.join(""));
    }
    if (Array.isArray(b.children) && b.children.length > 0) {
      blockTexts.push(...extractTextFromBlocks(b.children));
    }
  }
  return blockTexts;
}

/**
 * Extracts plain text from BlockNote editor content (JSON array of blocks).
 * Handles: paragraphs, headings, list items, nested children, bold/italic/underline,
 * and links (link text only). Tables and images are not handled and are skipped.
 * Falls back to String(content) if the value is not valid BlockNote JSON.
 */
export function extractPlainTextFromEditorContent(content: unknown): string {
  if (content == null) return "";

  let data: unknown = content;
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed === "") return "";
    try {
      data = JSON.parse(trimmed) as unknown;
    } catch {
      return content;
    }
  }

  if (!Array.isArray(data)) return String(content);

  const blockTexts = extractTextFromBlocks(data);
  if (blockTexts.length === 0) return String(content);
  return blockTexts.join("\n\n").trim();
}
