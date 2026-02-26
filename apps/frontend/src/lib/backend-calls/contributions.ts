import {
  ApiResponse,
  Contribution,
  CreateContributionRequestDto,
  MonthlyContributionsResponse,
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
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function createContribution(
  data: CreateContributionRequestDto,
  accessToken: string,
): Promise<ApiResponse<Contribution>> {
  const response = await makeAuthenticatedRequest<Contribution>(
    "/contributions",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to log contribution");
  }

  return response;
}

export async function getMonthlyContributions(
  year: number,
  month: number,
  accessToken: string,
): Promise<ApiResponse<MonthlyContributionsResponse>> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await makeAuthenticatedRequest<MonthlyContributionsResponse>(
    `/contributions/monthly?${params.toString()}`,
    accessToken,
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to fetch monthly contributions");
  }

  return response;
}
