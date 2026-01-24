import {
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
  CommentStats,
  DeleteResponse,
  ApiResponse,
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
    console.log("API request failed:", response);
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// Comment API functions
export async function createComment(
  data: CreateCommentDto,
  accessToken: string,
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(`${data.project_id}/comments`, accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCommentsByNode(
  projectId: string,
  fsNodeId: string,
  accessToken: string,
  includeResolved: boolean = true,
): Promise<ApiResponse<CommentResponse[]>> {
  const query = includeResolved
    ? "?includeResolved=true"
    : "?includeResolved=false";
  return makeAuthenticatedRequest<CommentResponse[]>(
    `/${projectId}/comments/${fsNodeId}${query}`,
    accessToken,
  );
}

export async function getComment(
  projectId: string,
  commentId: string,
  accessToken: string,
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/${projectId}/comments/${commentId}`,
    accessToken,
  );
}

export async function updateComment(
  projectId: string,
  commentId: string,
  data: UpdateCommentDto,
  accessToken: string,
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/${projectId}/comments/${commentId}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteComment(
  projectId: string,
  commentId: string,
  accessToken: string,
): Promise<ApiResponse<DeleteResponse>> {
  return makeAuthenticatedRequest<DeleteResponse>(
    `/${projectId}/comments/${commentId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}

export async function resolveComment(
  projectId: string,
  commentId: string,
  accessToken: string,
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/${projectId}/comments/${commentId}/resolve`,
    accessToken,
    {
      method: "POST",
    },
  );
}

export async function unresolveComment(
  projectId: string,
  commentId: string,
  accessToken: string,
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/${projectId}/comments/${commentId}/unresolve`,
    accessToken,
    {
      method: "POST",
    },
  );
}

export async function getCommentStats(
  projectId: string,
  fsNodeId: string,
  accessToken: string,
): Promise<ApiResponse<CommentStats>> {
  return makeAuthenticatedRequest<CommentStats>(
    `/${projectId}/comments/${fsNodeId}/stats`,
    accessToken,
  );
}
