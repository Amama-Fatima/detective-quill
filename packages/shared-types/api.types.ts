import { Database } from "./database.types";

export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];

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
}

export type GetChaptersResponse = ApiResponse<ChapterWithProject[]>;

// DTO for the endpoint
export interface GetChaptersQuery {
  projectTitle: string;
}
