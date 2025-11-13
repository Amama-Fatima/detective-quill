import {
  ApiResponse,
  ProjectMember,
  AddMemberDto,
} from "@detective-quill/shared-types";
import { EmailSendingApiRequestDto } from "@detective-quill/shared-types";

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

export async function inviteProjectMembers({
  data,
  accessToken,
}: {
  data: EmailSendingApiRequestDto;
  accessToken: string;
}): Promise<ApiResponse<void>> {
  const response = await makeAuthenticatedRequest<void>(`/email/send-invite`, accessToken, {
    method: "POST",
    body: JSON.stringify({ data }),
  });

  return response;
}

// Remove project member
export async function removeProjectMember(
  projectId: string,
  memberId: string,
  accessToken: string
): Promise<ApiResponse<void>> {
  return makeAuthenticatedRequest<void>(
    `/projects/${projectId}/members/${memberId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
}
