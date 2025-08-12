import { Json } from "@detective-quill/shared-types/database";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChapterFile } from "./types/workspace";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const jsonToString = (content: Json | null): string => {
  if (content === null) return "";
  if (typeof content === "string") return content;
  return JSON.stringify(content);
};


export function mapChaptersToFiles(chapters: any[]): ChapterFile[] {
  const chapterFiles: ChapterFile[] = chapters.map((chapter) => ({
    id: chapter.id,
    name: `${chapter.title}.md`,
    slug: chapter.title.toLowerCase().replace(/\s+/g, "-"),
    content: jsonToString(chapter.content),
    updatedAt: chapter.updated_at,
    isDirty: false,
    isNew: false,
    chapterOrder: chapter.chapter_order,
    originalChapter: chapter,
    folder: chapter.folder?.id || null,
  }));

  chapterFiles.sort((a, b) => a.chapterOrder - b.chapterOrder);
  return chapterFiles;
}