"use client";

import { useState } from "react";
import { onSaveBlueprintName } from "@/lib/utils/blueprint-utils";

interface EditableProjectNameProps {
  initialName: string;
  type: string;
  blueprintId: string;
  accessToken: string;
}

export default function EditableProjectName({
  initialName,
  type,
  blueprintId,
  accessToken,
}: EditableProjectNameProps) {
  const [name, setName] = useState(initialName || "Untitled Project");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSave = async (newName: string) => {
    await onSaveBlueprintName(newName, setLoading, accessToken, blueprintId);
    document.title = `${newName} Blueprint`;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!loading) {
        await onSave(name);
        setIsEditing(false);
      }
    }
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-secondary-foreground border border-gray-600 rounded px-2 py-1 text-white text-lg font-semibold"
          />
        </div>
      ) : (
        <h1
          className="text-lg font-semibold capitalize cursor-pointer hover:underline"
          onClick={() => setIsEditing(true)}
        >
          {name} — {type} Blueprint
        </h1>
      )}
    </div>
  );
}
