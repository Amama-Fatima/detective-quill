// Update your @/lib/types/workspace.ts file

import { ChapterWithProject, Folder } from "@detective-quill/shared-types";

export interface FolderStructure {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Updated ChapterFile interface
export interface ChapterFile {
  id: string;
  name: string;
  slug: string;
  content: string; // Always string for frontend usage
  updatedAt: string;
  isDirty: boolean;
  isNew: boolean;
  chapterOrder: number;
  originalChapter: ChapterWithProject;
  folder?: string | null; // folder ID reference
}
