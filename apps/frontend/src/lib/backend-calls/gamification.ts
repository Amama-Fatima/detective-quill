import type {
  ApiResponse,
  GamificationEvaluationResult,
  GamificationSummary,
} from "@detective-quill/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export async function getMyGamification(
  accessToken: string,
): Promise<ApiResponse<GamificationSummary>> {
  const response = await makeAuthenticatedRequest<GamificationSummary>(
    "/badges/me",
    accessToken,
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch gamification summary");
  }

  return response;
}

export async function evaluateGamification(
  accessToken: string,
): Promise<ApiResponse<GamificationEvaluationResult>> {
  const response = await makeAuthenticatedRequest<GamificationEvaluationResult>(
    "/badges/evaluate",
    accessToken,
    {
      method: "POST",
    },
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to evaluate gamification");
  }

  return response;
}
