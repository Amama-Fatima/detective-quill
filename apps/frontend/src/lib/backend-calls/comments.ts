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

// Comment API functions
export async function createComment(
  data: CreateCommentDto,
  accessToken: string
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>("/comments", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCommentsByNode(
  fsNodeId: string,
  accessToken: string,
  includeResolved: boolean = true
): Promise<ApiResponse<CommentResponse[]>> {
  const query = includeResolved
    ? "?includeResolved=true"
    : "?includeResolved=false";
  return makeAuthenticatedRequest<CommentResponse[]>(
    `/comments/node/${fsNodeId}${query}`,
    accessToken
  );
}

export async function getComment(
  commentId: string,
  accessToken: string
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/comments/${commentId}`,
    accessToken
  );
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentDto,
  accessToken: string
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/comments/${commentId}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteComment(
  commentId: string,
  accessToken: string
): Promise<ApiResponse<DeleteResponse>> {
  return makeAuthenticatedRequest<DeleteResponse>(
    `/comments/${commentId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
}

export async function resolveComment(
  commentId: string,
  accessToken: string
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/comments/${commentId}/resolve`,
    accessToken,
    {
      method: "POST",
    }
  );
}

export async function unresolveComment(
  commentId: string,
  accessToken: string
): Promise<ApiResponse<CommentResponse>> {
  return makeAuthenticatedRequest<CommentResponse>(
    `/comments/${commentId}/unresolve`,
    accessToken,
    {
      method: "POST",
    }
  );
}

export async function getCommentStats(
  fsNodeId: string,
  accessToken: string
): Promise<ApiResponse<CommentStats>> {
  return makeAuthenticatedRequest<CommentStats>(
    `/comments/node/${fsNodeId}/stats`,
    accessToken
  );
}
