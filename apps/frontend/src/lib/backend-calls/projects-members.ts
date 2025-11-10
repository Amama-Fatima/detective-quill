import { ProjectMember, ApiResponse } from "@detective-quill/shared-types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export async function removeProjectMember(
  accessToken: string,
  projectId: string,
  memberId: string
): Promise<ApiResponse<void>> {
  const response = await makeAuthenticatedRequest<void>(
    `/projects/${projectId}/settings/members/${memberId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
  if (!response.success) {
    throw new Error(`Failed to remove project member: ${response.error}`);
  }
  return response;
}
