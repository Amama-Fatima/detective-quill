import {
  Commit,
  ApiResponse,
  CreateCommitDto,
} from "@detective-quill/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
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
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function getCommitsByBranch(
  projectId: string,
  branchId: string,
  accessToken: string,
): Promise<ApiResponse<Commit[]>> {
  return makeAuthenticatedRequest<Commit[]>(
    `/${projectId}/branch/${branchId}/commits`,
    accessToken,
  );
}

export async function getCommitsByProject(
  projectId: string,
  accessToken: string,
): Promise<ApiResponse<Commit[]>> {
  return makeAuthenticatedRequest<Commit[]>(
    `/${projectId}/commits`,
    accessToken,
  );
}

export async function getCommitById(
  projectId: string,
  commitId: string,
  accessToken: string,
): Promise<ApiResponse<Commit>> {
  return makeAuthenticatedRequest<Commit>(
    `/${projectId}/commits/${commitId}`,
    accessToken,
  );
}

export async function createCommit(
  projectId: string,
  data: CreateCommitDto,
  accessToken: string,
): Promise<ApiResponse<Commit>> {
  return makeAuthenticatedRequest<Commit>(
    `/${projectId}/commits`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}
