import { ChapterWithProject } from "@detective-quill/shared-types";

export interface ChapterFile {
  id: string;
  name: string;
  slug: string; // URL-friendly version of the name
  content: string;
  updatedAt: string;
  isDirty?: boolean;
  isNew?: boolean;
  chapterOrder: number;
  originalChapter?: ChapterWithProject;
}
