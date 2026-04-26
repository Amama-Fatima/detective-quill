import {
  Branch,
  ApiResponse,
  CreateBranchDto,
  UpdateBranchDto,
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

export async function createBranch(
  projectId: string,
  dto: CreateBranchDto,
  accessToken: string,
): Promise<ApiResponse<Branch>> {
  return makeAuthenticatedRequest<Branch>(
    `/${projectId}/branches`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
  );
}

export async function updateBranch(
  projectId: string,
  branchId: string,
  dto: UpdateBranchDto,
  accessToken: string,
): Promise<ApiResponse<Branch>> {
  return makeAuthenticatedRequest<Branch>(
    `/${projectId}/branches/${branchId}`,
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    },
  );
}

export async function deleteBranch(
  projectId: string,
  branchId: string,
  accessToken: string,
): Promise<ApiResponse<void>> {
  return makeAuthenticatedRequest<void>(
    `/${projectId}/branches/${branchId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}

export async function switchActiveBranch(
  projectId: string,
  branchId: string,
  accessToken: string,
): Promise<ApiResponse<{ branch: Branch; headCommitId: string | null }>> {
  return makeAuthenticatedRequest<{
    branch: Branch;
    headCommitId: string | null;
  }>(`/${projectId}/branches/${branchId}/switch`, accessToken, {
    method: "POST",
  });
}

export async function getBranchesByProject(
  projectId: string,
  accessToken: string,
): Promise<Branch[]> {
  const response = await makeAuthenticatedRequest<Branch[]>(
    `/${projectId}/branches`,
    accessToken,
  );
  return response.data ?? [];
}
