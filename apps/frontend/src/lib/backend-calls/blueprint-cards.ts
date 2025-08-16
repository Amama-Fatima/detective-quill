import {
  CreateBlueprintCardDto,
  ApiResponse,
  BlueprintCard,
  UpdateBlueprintCardDto,
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


export async function createBlueprintCard(
  accessToken: string,
  blueprintId: string,
  cardData: CreateBlueprintCardDto[]
): Promise<ApiResponse<BlueprintCard[]>> {
  const response = await makeAuthenticatedRequest<BlueprintCard[]>(
    `/blueprint_cards/${blueprintId}`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(cardData),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to create blueprint card: ${response.error}`);
  }

  return response;
}

export async function updateBlueprintCard(
  accessToken: string,
  blueprintId: string,
  cardId: string,
  cardData: UpdateBlueprintCardDto
): Promise<ApiResponse<BlueprintCard>> {
  const response = await makeAuthenticatedRequest<BlueprintCard>(
    `/blueprint_cards/${blueprintId}/${cardId}`,
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify(cardData),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to update blueprint card: ${response.error}`);
  }

  return response;
}

export async function deleteBlueprintCard(
  accessToken: string,
  blueprintId: string,
  cardId: string
): Promise<ApiResponse<void>> {
  const response = await makeAuthenticatedRequest<void>(
    `/blueprint_cards/${blueprintId}/${cardId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(`Failed to delete blueprint card: ${response.error}`);
  }

  return response;
}
