import { Database } from "./database.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

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
export interface FsNode {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  node_type: "folder" | "file";
  description: string | null;
  sort_order: number;
  depth: number;
  path: string | null;
  content: string | null;
  file_extension: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

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
