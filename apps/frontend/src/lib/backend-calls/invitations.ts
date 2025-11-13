const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
import { ApiResponse, Invitation } from "@detective-quill/shared-types";

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

export async function respondToInvitation(
  inviteCode: string,
  projectId: string,
  response: "accept" | "reject",
  accessToken: string
): Promise<ApiResponse<void>> {
  const apiResponse = await makeAuthenticatedRequest<void>(
    `/invitations/${inviteCode}/respond`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ projectId, response }),
    }
  );

  if (!apiResponse.success) {
    throw new Error(`Failed to respond to invitation: ${apiResponse.message}`);
  }
  return apiResponse;
}

export async function getProjectInvitations(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<Invitation[]>> {
  return makeAuthenticatedRequest<Invitation[]>(
    `/invitations/${projectId}`,
    accessToken
  );
}

export async function deleteInvitation(
  inviteCode: string,
  projectId: string,
  accessToken: string
): Promise<ApiResponse<void>> {
  return makeAuthenticatedRequest<void>(
    `/invitations/${inviteCode}`,
    accessToken,
    {
      method: "DELETE",
      body: JSON.stringify({ projectId }),
    }
  );
}
