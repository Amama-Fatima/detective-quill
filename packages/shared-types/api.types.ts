import { Database } from "./database.types";

export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type Blueprint = Database["public"]["Tables"]["blue_prints"]["Row"];
export type CardType = Database["public"]["Tables"]["card_types"]["Row"];
export type BlueprintCard = Database["public"]["Tables"]["blueprint_cards"]["Row"];
export interface ApiResponse<T> {
  data?: T | null;
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















export interface CreateBlueprintDto{
  title: string;
  projectId: string;
  type: Database["public"]["Enums"]["blueprint_type"];
}

export interface GetUserBlueprintByIdQuery {
  id: string;
  userId: string;
}

export interface UpdateBlueprintDto {
  title: string;
}

export interface CreateCardTypeDto {
  title: string;
  description: string;
  blueprint_type: Database["public"]["Enums"]["blueprint_type"];
  is_custom: boolean;
}

export interface UpdateCardTypeDto {
  title?: string;
  description?: string;
}

export interface CreateBlueprintCardDto {
  // title: string;
  content: string;
  card_type_id: string;
  position_x: number;
  position_y: number;
}

export type UpdateBlueprintCardDto {
  content?: string;
  position_x?: number;
  position_y?: number;
}

export type GetBlueprintResponse = ApiResponse<Blueprint>;
export type GetBlueprintsResponse = ApiResponse<Blueprint[]>;
export type GetCardTypesResponse = ApiResponse<CardType[]>;
export type GetCardTypeResponse = ApiResponse<CardType>;
export type GetBlueprintCardResponse = ApiResponse<BlueprintCard>;
export type GetBlueprintCardsResponse = ApiResponse<BlueprintCard[]>;