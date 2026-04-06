import { Database } from "./database.types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Blueprint = Database["public"]["Tables"]["blue_prints"]["Row"];
export type BlueprintCard =
  Database["public"]["Tables"]["blueprint_cards"]["Row"];
export type BlueprintType = Database["public"]["Enums"]["blueprint_type"];
export type FsNode = Database["public"]["Tables"]["fs_nodes"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type Commit = Database["public"]["Tables"]["commits"]["Row"];
export type CommitSnapshot =
  Database["public"]["Tables"]["commit_snapshots"]["Row"];
export type Member = Database["public"]["Tables"]["projects_members"]["Row"];
export type Contribution =
  Database["public"]["Tables"]["user_contributions"]["Row"];
export type ContributionType = Database["public"]["Enums"]["contribution_type"];
export type GameStats = Database["public"]["Tables"]["game_stats"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];

// todo: consider using pick and omit to create types instead of creating new ones

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

export interface UpdateNodeMetadataDto {
  name?: string;
  description?: string;
  parent_id: string | null;
  sort_order?: number;
}

export interface UpdateFileContentDto {
  content: string;
}

export interface FsNodeTreeResponse {
  id: string;
  name: string;
  node_type: "folder" | "file";
  branch_id: string | null;
  parent_id: string | null;
  depth?: number | null;
  children?: FsNodeTreeResponse[];
  content?: string;
  word_count: number;
  path: string;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export type FsNodeResponse = FsNodeTreeResponse;

export interface EditorWorkspaceResponse {
  project: Project;
  nodes: FsNodeTreeResponse[];
  currentNode: FsNode | null;
  activeBranchId: string | null;
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

// todo: comment and comment
//  response should be used in right places, check their usage
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
  project_id: string;
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

export type CreateBranchDto = Pick<
  Branch,
  "name" | "is_default" | "parent_commit_id"
>;

export type UpdateBranchDto = Partial<
  Pick<Branch, "name" | "is_default" | "head_commit_id">
>;

export type CreateCommitDto = Pick<Commit, "message" | "branch_id">;

export interface CommitsPaginatedResponse {
  data: Commit[];
  total: number;
}

export interface RevertCommitResponse {
  branchId: string;
  headCommitId: string;
  deletedCommitsCount: number;
  deletedSnapshotsCount: number;
}

export interface CreateContributionRequestDto {
  contribution_type: ContributionType;
  reference_id?: string;
  contribution_date?: string;
}

export interface MonthlyContributionDay {
  date: string;
  total_score: number;
}

export interface MonthlyContributionsResponse {
  year: number;
  month: number;
  days: MonthlyContributionDay[];
}

export type CreateSnapshotDto = Pick<
  CommitSnapshot,
  | "commit_id"
  | "fs_node_id"
  | "name"
  | "node_type"
  | "parent_id"
  | "path"
  | "content"
  | "word_count"
  | "file_extension"
  | "sort_order"
  | "depth"
>;

export type CreateEventDto = Omit<Event, "id" | "created_at">;