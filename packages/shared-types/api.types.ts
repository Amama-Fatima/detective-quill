import { Database } from "./database.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Blueprint = Database["public"]["Tables"]["blue_prints"]["Row"];
export type CardType = Database["public"]["Tables"]["card_types"]["Row"];
export type BlueprintCard =
  Database["public"]["Tables"]["blueprint_cards"]["Row"];
export type BlueprintType = Database["public"]["Enums"]["blueprint_type"];
export type FsNode = Database["public"]["Tables"]["fs_nodes"]["Row"];

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Project DTOs
export interface CreateProjectDto {
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  is_active?: boolean;
}

// Project response types
export interface ProjectResponse extends Project {}

export interface ProjectStats {
  totalFiles: number;
  totalFolders: number;
  totalWordCount: number;
  lastModified: string;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
}

// API Response wrappers
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeleteResponse {
  message: string;
}

// File system node types


export interface CreateFsNodeDto {
  project_id: string;
  parent_id?: string;
  name: string;
  node_type: "folder" | "file";
  description?: string;
  content?: string;
  file_extension?: string;
}

export interface UpdateFsNodeDto {
  name?: string;
  description?: string;
  content?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface CreateFsNodeDto {
  project_id: string;
  parent_id?: string;
  name: string;
  node_type: "folder" | "file";
  description?: string;
  content?: string;
  file_extension?: string;
  sort_order?: number;
}

export interface UpdateFsNodeDto {
  name?: string;
  description?: string;
  content?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface FsNodeResponse extends FsNode {}

export interface FsNodeTreeResponse {
  id: string;
  name: string;
  node_type: "folder" | "file";
  parent_id: string | null;
  children?: FsNodeTreeResponse[];
  content?: string;
  word_count: number;
  path: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBlueprintDto {
  title: string;
  project_id: string;
  type: Database["public"]["Enums"]["blueprint_type"];
}

export interface GetUserBlueprintByIdQuery {
  id: string;
  user_id: string;
}
export type DeleteFolderResponse = ApiResponse<{ deleted: boolean }>;

export interface GetUserBlueprintByIdQuery {
  id: string;
  user_id: string;
}

export interface UpdateBlueprintDto {
  title: string;
}

export interface CreateCardTypeDto {
  title: string;
  description: string;
  blueprint_type: BlueprintType
}

export interface UpdateCardTypeDto {
  title?: string;
  description?: string;
}

export interface CreateBlueprintCardDto {
  content: string | null;
  card_type_title: string;
  card_type_id: string;
  position_x: number;
  position_y: number;
}

export interface UpdateBlueprintCardDto {
  content?: string | null;
  position_x?: number;
  position_y?: number;
}