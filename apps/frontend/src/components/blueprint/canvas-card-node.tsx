// todo: use useCallbacks where needed

import { useState, useRef, useEffect } from "react";
import { NotepadTextDashed, Edit3, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CanvasCardNodeProps {
  id?: string; // DB id or no id for new cards
  content: string;
  title: string;
  onContentChange: (newContent: string) => void;
  onTitleChange: (newTitle: string) => void;
  onDelete?: () => void;
  isOwner: boolean;
  isActive: boolean;
}

export default function CanvasCardNode({
  data,
}: {
  data: CanvasCardNodeProps;
}) {
  console.log("Rendering CanvasCardNode with data:", data);
  const [isEditing, setIsEditing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [data.content]);

  return (
    <div
      className={`
      group relative bg-drag-card rounded-xl shadow-sm border-2 w-84 min-h-72
      transition-all duration-200 hover:shadow-lg
      ${isFocused ? "shadow-lg ring-2" : "border-muted-foreground"}
      cursor-grab active:cursor-grabbing
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            <NotepadTextDashed />
          </span>
          {/* title area */}
          {isEditing ? (
            <input
              disabled={!data.isActive || !data.isOwner}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              ref={titleRef}
              value={data.title}
              onChange={(e) => data.onTitleChange(e.target.value)}
              className="nodrag w-3/4 min-h-12 p-3 border border-gray-200 rounded-lg resize-none bg-gray-100
                     text-gray-800 text-md leading-relaxed transition-all"
            />
          ) : (
            <Badge
              className={`text-lg font-medium border whitespace-pre-wrap break-words break-all text-left`}
            >
              {data.title}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!data.isOwner || !data.isActive}
            onClick={() => setIsEditing(!isEditing)}
            className={`h-7 w-7 p-0 opacity-0 cursor-pointer  group-hover:opacity-100 transition-opacity ${
              isEditing ? "opacity-100 bg-muted" : "hover:bg-gray-100"
            }`}
          >
            <Edit3 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={!data.isOwner || !data.isActive}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 cursor-pointer hover:text-red-500"
            onClick={data.onDelete}
          >
            <Trash className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-4">
        {isEditing ? (
          <textarea
            disabled={!data.isOwner || !data.isActive}
            ref={textareaRef}
            value={data.content}
            onChange={(e) => data.onContentChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Start typing your content here..."
            className="nodrag w-full min-h-64 p-3 border border-gray-200 rounded-lg resize-none bg-gray-100
                     text-gray-800 text-md leading-relaxed transition-all"
            style={{
              minHeight: "128px",
              maxHeight: "300px",
            }}
          />
        ) : (
          <div
            className="min-h-48 p-3 bg-gray-200 rounded-lg border border-gray-100 text-md cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {data.content ? (
              <div className="whitespace-pre-wrap break-words break-all">
                {data.content}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Click to add content...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
