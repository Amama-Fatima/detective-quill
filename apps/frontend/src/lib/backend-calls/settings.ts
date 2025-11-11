import {
  ProjectResponse,
  UpdateProjectDto,
  DeleteResponse,
  ApiResponse,
  ProjectMember,
  AddMemberDto,
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

// Update project information
export async function updateProjectInfo(
  projectId: string,
  data: UpdateProjectDto,
  accessToken: string
): Promise<ApiResponse<ProjectResponse>> {
  return makeAuthenticatedRequest<ProjectResponse>(
    `/projects/${projectId}/settings/info`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// Add project member
export async function addProjectMember(
  projectId: string,
  data: AddMemberDto,
  accessToken: string
): Promise<ApiResponse<ProjectMember>> {
  return makeAuthenticatedRequest<ProjectMember>(
    `/projects/${projectId}/settings/members`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// Remove project member
export async function removeProjectMember(
  projectId: string,
  memberId: string,
  accessToken: string
): Promise<ApiResponse<DeleteResponse>> {
  return makeAuthenticatedRequest<DeleteResponse>(
    `/projects/${projectId}/settings/members/${memberId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
}

// Delete project
export async function deleteProject(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<DeleteResponse>> {
  return makeAuthenticatedRequest<DeleteResponse>(
    `/projects/${projectId}/settings`,
    accessToken,
    {
      method: "DELETE",
    }
  );
}
