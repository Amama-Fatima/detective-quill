import { Database } from "./database.types";

export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Specific response types for chapters endpoint
export interface ChapterWithProject extends Chapter {
  project: Pick<Project, "id" | "title" | "user_id">;
  folder?: Pick<Folder, "id" | "name"> | null;
}

// Folder with nested structure
export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[];
  chapters?: ChapterWithProject[];
}

// DTOs for API requests
export interface CreateChapterDto {
  projectTitle: string;
  title: string;
  content: string;
  chapterOrder: number;
  folderId?: string | null; // Added folder support
}

export interface UpdateChapterDto {
  id: string;
  title?: string;
  content?: string;
  chapterOrder?: number;
  isPublished?: boolean;
  folderId?: string | null; // Added folder support
}

export interface CreateFolderDto {
  projectTitle: string;
  name: string;
  parentId?: string | null;
  folderOrder?: number;
}

export interface UpdateFolderDto {
  id: string;
  name?: string;
  parentId?: string | null;
  folderOrder?: number;
}

// Query types
export interface GetChaptersQuery {
  projectTitle: string;
  includeFolders?: boolean; // Option to include folder structure
}

export interface GetFoldersQuery {
  projectTitle: string;
  includeChildren?: boolean;
}

// Response types
export type CreateChapterResponse = ApiResponse<ChapterWithProject>;
export type UpdateChapterResponse = ApiResponse<ChapterWithProject>;
export type GetChaptersResponse = ApiResponse<ChapterWithProject[]>;

export type CreateFolderResponse = ApiResponse<Folder>;
export type UpdateFolderResponse = ApiResponse<Folder>;
export type GetFoldersResponse = ApiResponse<FolderWithChildren[]>;
export type DeleteFolderResponse = ApiResponse<{ deleted: boolean }>;

// Combined response for workspace data
export interface WorkspaceData {
  chapters: ChapterWithProject[];
  folders: FolderWithChildren[];
}

export type GetWorkspaceResponse = ApiResponse<WorkspaceData>;
