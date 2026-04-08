import {
  Commit,
  ApiResponse,
  CreateCommitDto,
  RevertCommitResponse,
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

export async function createCommit(
  projectId: string,
  data: CreateCommitDto,
  accessToken: string,
): Promise<ApiResponse<Commit>> {
  const response = await makeAuthenticatedRequest<Commit>(
    `/${projectId}/commits`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to create commit");
  }

  return response;
}

export async function revertToCommit(
  projectId: string,
  commitId: string,
  accessToken: string,
): Promise<ApiResponse<RevertCommitResponse>> {
  const response = await makeAuthenticatedRequest<RevertCommitResponse>(
    `/${projectId}/commits/${commitId}/revert`,
    accessToken,
    {
      method: "POST",
    },
  );
  if (!response.success) {
    throw new Error(response.error || "Failed to revert commit");
  }
  return response;
}
