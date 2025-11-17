import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectStats,
  DeleteResponse,
  ApiResponse,
} from "@detective-quill/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Project API functions
export async function createProject(
  data: CreateProjectDto,
  accessToken: string
): Promise<ApiResponse<Project>> {
  return makeAuthenticatedRequest<Project>("/projects", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProjects(
  accessToken: string,
  includeInactive: boolean = false
): Promise<ApiResponse<Project[]>> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return makeAuthenticatedRequest<Project[]>(`/projects${query}`, accessToken);
}

export async function getProject(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<Project>> {
  return makeAuthenticatedRequest<Project>(
    `/projects/${projectId}`,
    accessToken
  );
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectDto,
  accessToken: string
): Promise<ApiResponse<Project>> {
  const response = await makeAuthenticatedRequest<Project>(
    `/projects/${projectId}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to update user project: ${response.error}`);
  }

  return response;
}

export async function deleteProject(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<DeleteResponse>> {
  const response = await makeAuthenticatedRequest<DeleteResponse>(
    `/projects/${projectId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(`Failed to delete user project: ${response.error}`);
  }
  return response;
}

export async function restoreProject(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<Project>> {
  const response = await makeAuthenticatedRequest<Project>(
    `/projects/${projectId}/restore`,
    accessToken,
    {
      method: "POST",
    }
  );
  if (!response.success) {
    throw new Error(`Failed to restore user project: ${response.error}`);
  }
  return response;
}

export async function getProjectStats(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<ProjectStats>> {
  const response = await makeAuthenticatedRequest<ProjectStats>(
    `/projects/${projectId}/stats`,
    accessToken
  );

  if (!response.success) {
    throw new Error(`Failed to get project stats: ${response.error}`);
  }

  return response;
}

export async function getDeletedProjects(
  accessToken: string
): Promise<ApiResponse<Project[]>> {
  const response = await makeAuthenticatedRequest<Project[]>(
    "/projects/deleted",
    accessToken
  );

  if (!response.success) {
    throw new Error(`Failed to get deleted projects: ${response.error}`);
  }

  return response;
}
