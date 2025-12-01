import { Database } from "./database.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Blueprint = Database["public"]["Tables"]["blue_prints"]["Row"];
export type BlueprintCard =
  Database["public"]["Tables"]["blueprint_cards"]["Row"];
export type BlueprintType = Database["public"]["Enums"]["blueprint_type"];
export type FsNode = Database["public"]["Tables"]["fs_nodes"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

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

export interface ProjectStats {
  totalFiles: number;
  totalFolders: number;
  totalWordCount: number;
  lastModified: string;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
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
  blueprint_type: BlueprintType;
}

export interface UpdateCardTypeDto {
  title?: string;
  description?: string;
}

export interface CreateBlueprintCardDto {
  content: string | null;
  title: string | null;
  position_x: number;
  position_y: number;
}

export interface UpdateBlueprintCardDto {
  content?: string | null;
  position_x?: number;
  position_y?: number;
  title?: string | null;
}

export interface CommentResponse {
  id: string;
  fs_node_id: string;
  block_id: string;
  start_offset: number;
  end_offset: number;
  content: string;
  author_id: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  selected_text?: string; // Optional: stores the text that was selected when creating the comment
  // Author info (from join)
  author?: {
    user_id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Extended version for internal service use with nested data
export interface CommentWithRelations extends CommentResponse {
  fs_node?: {
    project_id: string;
    project?: {
      author_id: string;
    };
  };
}

export interface CreateCommentDto {
  fs_node_id: string;
  block_id: string;
  start_offset: number;
  end_offset: number;
  content: string;
  selected_text?: string; // Optional: stores the text that was selected
}

export interface UpdateCommentDto {
  content?: string;
  is_resolved?: boolean;
}

export interface CommentStats {
  total: number;
  resolved: number;
  unresolved: number;
}

export interface ProjectMember {
  created_at: string;
  user_id: string;
  username: string | null;
  full_name: string;
  email: string;
  is_author: boolean;
  avatar_url: string | null;
}

export interface AddMemberDto {
  email: string;
}

export interface EmailSendingApiRequestDto {
  projectId: string;
  emails: string[];
  inviterName: string;
}

export interface EmailSendingJobData {
  projectId: string;
  emails: string[];
  inviterName: string;
  projectTitle: string;
}
