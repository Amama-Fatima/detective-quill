"use client";

import React, { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import {
  BlockNoteEditor as Editor,
  Block,
  InlineContentSchema,
  StyleSchema,
  insertOrUpdateBlock,
  PartialBlock,
} from "@blocknote/core";
import {
  MessageCircle,
  X,
  Send,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NOTION_STYLES } from "@/constants/editor";

// Comment data structure
export interface Comment {
  id: string;
  blockId: string;
  text: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  position?: {
    start: number;
    end: number;
  };
}

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  onCommentsChange?: (comments: Comment[]) => void;
  comments?: Comment[];
  currentUser?: string;
}

// Custom comment annotation style
const commentAnnotation = {
  type: "comment" as const,
  propSchema: {
    commentId: {
      default: "" as const,
    },
  } as const,
  render: (props: any) => {
    return {
      dom: document.createElement("span"),
      contentDOM: document.createElement("span"),
      update: (element: HTMLElement) => {
        element.style.backgroundColor = "rgba(255, 193, 7, 0.3)";
        element.style.borderBottom = "2px solid #ffc107";
        element.style.cursor = "pointer";
        element.className = "comment-highlight";
        element.setAttribute("data-comment-id", props.commentId);
      },
    };
  },
};

const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
  initialContent = "",
  onChange,
  onCommentsChange,
  comments = [],
  currentUser = "Anonymous",
}) => {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<{
    blockId: string;
    start: number;
    end: number;
  } | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    // Add the comment annotation to the schema
    // styleSchema: {
    //   ...StyleSchema,
    //   comment: commentAnnotation,
    // } as any,
  });

  // Handle content changes
  useEffect(() => {
    if (!onChange) return;

    const handleChange = async () => {
      const blocks = editor.document;
      const jsonContent = JSON.stringify(blocks);
      onChange(jsonContent);
    };

    editor.onEditorContentChange(handleChange);
  }, [editor, onChange]);

  // Handle comments change
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // Handle text selection for commenting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText("");
      setSelectedRange(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return;

    // Get the selected block and position
    const range = selection.getRangeAt(0);
    const blockElement = range.startContainer.parentElement?.closest(
      '[data-node-type="blockContainer"]'
    );

    if (blockElement) {
      const blockId = blockElement.getAttribute("data-id") || "";
      const start = range.startOffset;
      const end = range.endOffset;

      setSelectedText(selectedText);
      setSelectedRange({ blockId, start, end });
      setShowCommentDialog(true);
    }
  };

  // Add a new comment
  const addComment = () => {
    if (!newCommentText.trim() || !selectedRange) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      blockId: selectedRange.blockId,
      text: newCommentText.trim(),
      author: currentUser,
      timestamp: new Date(),
      resolved: false,
      position: {
        start: selectedRange.start,
        end: selectedRange.end,
      },
    };

    const updatedComments = [...localComments, newComment];
    setLocalComments(updatedComments);
    onCommentsChange?.(updatedComments);

    // Clear the form
    setNewCommentText("");
    setShowCommentDialog(false);
    setSelectedRange(null);

    // Apply highlight to selected text
    applyCommentHighlight(selectedRange, newComment.id);
  };

  // Apply comment highlight to text
  const applyCommentHighlight = (
    range: { blockId: string; start: number; end: number },
    commentId: string
  ) => {
    // This would integrate with BlockNote's inline content system
    // For now, we'll add a visual indicator
    setTimeout(() => {
      const blockElement = document.querySelector(
        `[data-id="${range.blockId}"]`
      );
      if (blockElement) {
        const textNode = blockElement.querySelector(".bn-inline-content");
        if (textNode) {
          // Add comment highlight class
          textNode.classList.add("has-comments");
        }
      }
    }, 100);
  };

  // Delete a comment
  const deleteComment = (commentId: string) => {
    const updatedComments = localComments.filter((c) => c.id !== commentId);
    setLocalComments(updatedComments);
    onCommentsChange?.(updatedComments);
  };

  // Resolve/unresolve a comment
  const toggleCommentResolution = (commentId: string) => {
    const updatedComments = localComments.map((comment) =>
      comment.id === commentId
        ? { ...comment, resolved: !comment.resolved }
        : comment
    );
    setLocalComments(updatedComments);
    onCommentsChange?.(updatedComments);
  };

  // Get comments for a specific block
  const getBlockComments = (blockId: string) => {
    return localComments.filter(
      (comment) => comment.blockId === blockId && !comment.resolved
    );
  };

  // Comment sidebar component
  const CommentSidebar = () => (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments ({localComments.filter((c) => !c.resolved).length})
        </h3>
      </div>

      <div className="space-y-4">
        {localComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg border ${
              comment.resolved ? "bg-muted/50 opacity-60" : "bg-card"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={comment.resolved ? "secondary" : "default"}>
                  {comment.author}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {comment.timestamp.toLocaleDateString()}
                </span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => toggleCommentResolution(comment.id)}
                  >
                    {comment.resolved ? "Unresolve" : "Resolve"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </PopoverContent>
              </Popover>
            </div>

            <p className="text-sm mb-2">{comment.text}</p>

            {comment.resolved && (
              <Badge variant="outline" className="text-xs">
                Resolved
              </Badge>
            )}
          </div>
        ))}

        {localComments.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Select text to add a comment</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${NOTION_STYLES}
        .has-comments {
          position: relative;
        }
        .has-comments::after {
          content: '';
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #ffc107;
          border-radius: 50%;
        }
        .comment-highlight {
          background-color: rgba(255, 193, 7, 0.3) !important;
          border-bottom: 2px solid #ffc107 !important;
          cursor: pointer !important;
        }
      `,
        }}
      />

      <div className="flex h-full">
        {/* Editor */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          onMouseUp={handleTextSelection}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <BlockNoteView
            editor={editor}
            theme="dark"
            style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",
            }}
          />
        </div>

        {/* Comment Sidebar */}
        <CommentSidebar />
      </div>

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Comment</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCommentDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedText && (
              <div className="mb-4 p-3 bg-muted rounded">
                <p className="text-sm font-medium mb-1">Selected text:</p>
                <p className="text-sm italic">"{selectedText}"</p>
              </div>
            )}

            <Textarea
              placeholder="Write your comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="mb-4"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCommentDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={addComment} disabled={!newCommentText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockNoteEditor;
