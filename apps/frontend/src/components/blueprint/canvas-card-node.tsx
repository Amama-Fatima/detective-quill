// todo: use useCallbacks where needed

import { useState, useRef, useEffect } from "react";
import {
  NotepadTextDashed,
  X,
  GripVertical,
  MoreVertical,
  Edit3,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasCardNodeProps {
  id?: string; // DB id
  content: string;
  onChange: (newContent: string) => void;
  cardTypeTitle: string;
  cardTypeId: string;
  onDelete?: () => void;
}

export default function CanvasCardNode({
  data,
}: {
  data: CanvasCardNodeProps;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      group relative bg-white rounded-xl shadow-sm border-2 w-84 min-h-72 
      transition-all duration-200 hover:shadow-lg hover:border-blue-300
      ${
        isFocused
          ? "shadow-lg border-blue-400 ring-2 ring-blue-100"
          : "border-gray-200"
      }
      cursor-grab active:cursor-grabbing
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-black text-lg">
            <NotepadTextDashed />
          </span>
          <Badge className={`text-lg font-medium border`}>
            {data.cardTypeTitle}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={`h-7 w-7 p-0 opacity-0 cursor-pointer text-gray-900 group-hover:opacity-100 transition-opacity ${
              isEditing
                ? "opacity-100 bg-blue-50 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Edit3 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-gray-900 transition-opacity hover:bg-gray-100 cursor-pointer hover:text-red-500"
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
            ref={textareaRef}
            value={data.content}
            onChange={(e) => data.onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Start typing your content here..."
            className="nodrag w-full min-h-64 p-3 border border-gray-200 rounded-lg resize-none bg-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     text-gray-800 text-md leading-relaxed transition-all"
            style={{
              minHeight: "128px",
              maxHeight: "300px",
            }}
          />
        ) : (
          <div
            className="min-h-48 p-3 bg-gray-200 rounded-lg border border-gray-100 text-gray-800 text-md cursor-text"
            onClick={() => setIsEditing(true)}
          >
            {data.content ? (
              <div className="whitespace-pre-wrap">{data.content}</div>
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
