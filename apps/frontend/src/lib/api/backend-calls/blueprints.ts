import {
  CreateBlueprintCardDto,
  CreateBlueprintDto,
  CreateCardTypeDto,
  ApiResponse,
  Blueprint,
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

export async function createBlueprint(
  accessToken: string,
  blueprintData: CreateBlueprintDto
): Promise<ApiResponse<Blueprint>> {
  const response = await makeAuthenticatedRequest<Blueprint>(
    "/blueprints",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(blueprintData),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to create blueprint: ${response.message}`);
  }

  return response;
}
