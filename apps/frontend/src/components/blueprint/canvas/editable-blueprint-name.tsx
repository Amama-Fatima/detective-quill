"use client";

import { useState } from "react";
import { useBlueprints } from "@/hooks/blueprints/use-blueprints";

interface EditableBlueprintNameProps {
  initialName: string;
  type: string;
  blueprintId: string;
  isOwner: boolean;
  isActive: boolean;
}

export default function EditableBlueprintName({
  initialName,
  type,
  blueprintId,
  isOwner,
  isActive,
}: EditableBlueprintNameProps) {
  const [name, setName] = useState(initialName || "Untitled Project");
  const [isEditing, setIsEditing] = useState(false);
  const { updateMutation } = useBlueprints();
  const loading = updateMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSave = async (newName: string) => {
    await updateMutation.mutateAsync({ blueprintId, newName });
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
            disabled={loading || !isOwner || !isActive}
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
