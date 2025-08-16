import {
  CreateCardTypeDto,
  ApiResponse,
  CardType,
  UpdateCardTypeDto,
  BlueprintType,
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

export async function getUserCardTypes(
  accessToken: string,
  type: BlueprintType
): Promise<ApiResponse<CardType[]>> {
  const response = await makeAuthenticatedRequest<CardType[]>(
    `/card_types/user?blueprint_type=${type}`,
    accessToken
  );

  if (!response.success) {
    throw new Error(`Failed to retrieve user card types: ${response.error}`);
  }

  return response;
}

export async function getDefaultCardTypes(
  accessToken: string,
  type: BlueprintType
): Promise<ApiResponse<CardType[]>> {
  const response = await makeAuthenticatedRequest<CardType[]>(
    `/card_types/default?blueprint_type=${type}`,
    accessToken
  );

  if (!response.success) {
    throw new Error(`Failed to retrieve default card types: ${response.error}`);
  }

  return response;
}

export async function createCardType(
  accessToken: string,
  createCardTypeDto: CreateCardTypeDto
): Promise<ApiResponse<CardType>> {
  const response = await makeAuthenticatedRequest<CardType>(
    "/card_types",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(createCardTypeDto),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to create card type: ${response.error}`);
  }

  return response;
}

export async function updateCardType(
  accessToken: string,
  cardTypeId: string,
  updateCardTypeDto: UpdateCardTypeDto
): Promise<ApiResponse<CardType>> {
  const response = await makeAuthenticatedRequest<CardType>(
    `/card_types/${cardTypeId}`,
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify(updateCardTypeDto),
    }
  );

  if (!response.success) {
    throw new Error(`Failed to update card type: ${response.error}`);
  }

  return response;
}

export async function deleteCardType(
  accessToken: string,
  cardTypeId: string
): Promise<ApiResponse<void>> {
  const response = await makeAuthenticatedRequest<void>(
    `/card_types/${cardTypeId}`,
    accessToken,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(`Failed to delete card type: ${response.error}`);
  }

  return response;
}
