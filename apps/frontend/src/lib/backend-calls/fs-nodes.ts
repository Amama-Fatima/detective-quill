import {
  FsNode,
  FsNodeTreeResponse,
  CreateFsNodeDto,
  UpdateFsNodeDto,
  DeleteResponse,
  ApiResponse,
} from "@detective-quill/shared-types";

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

export async function createFsNode(
  data: CreateFsNodeDto,
  accessToken: string
): Promise<ApiResponse<FsNode>> {
  return makeAuthenticatedRequest<FsNode>("/fs-nodes", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProjectTree(
  projectId: string,
  accessToken: string
): Promise<ApiResponse<FsNodeTreeResponse[]>> {
  return makeAuthenticatedRequest<FsNodeTreeResponse[]>(
    `/fs-nodes/project/${projectId}/tree`,
    accessToken
  );
}

export async function getFsNode(
  nodeId: string,
  accessToken: string
): Promise<ApiResponse<FsNode>> {
  return makeAuthenticatedRequest<FsNode>(`/fs-nodes/${nodeId}`, accessToken);
}

export async function updateFsNode(
  nodeId: string,
  data: UpdateFsNodeDto,
  accessToken: string
): Promise<ApiResponse<FsNode>> {
  return makeAuthenticatedRequest<FsNode>(`/fs-nodes/${nodeId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFsNode(
  nodeId: string,
  accessToken: string,
  hardDelete: boolean = false,
  cascadeDelete: boolean = false
): Promise<ApiResponse<DeleteResponse>> {
  const queryParams = new URLSearchParams();
  if (hardDelete) queryParams.append("hard", "true");
  if (cascadeDelete) queryParams.append("cascade", "true");

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return makeAuthenticatedRequest<DeleteResponse>(
    `/fs-nodes/${nodeId}${query}`,
    accessToken,
    {
      method: "DELETE",
    }
  );
}

export async function moveFsNode(
  nodeId: string,
  parentId: string | null,
  sortOrder: number,
  accessToken: string
): Promise<ApiResponse<FsNode>> {
  return makeAuthenticatedRequest<FsNode>(
    `/fs-nodes/${nodeId}/move`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ parent_id: parentId, sort_order: sortOrder }),
    }
  );
}
