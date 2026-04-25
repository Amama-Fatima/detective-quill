const QUERY_ENGINE_BASE_URL =
  process.env.NEXT_PUBLIC_QUERY_ENGINE_URL || "http://localhost:8000";

const QUERY_ENGINE_API_PREFIX =
  process.env.NEXT_PUBLIC_QUERY_ENGINE_API_PREFIX || "/version1";

export interface QueryEngineRequest {
  question: string;
}

export interface QueryEngineResponse {
  status: string;
  message: string;
  question: string;
  cypher: string | null;
  data: Record<string, unknown>[];
}

interface QueryEngineErrorResponse {
  detail?: string;
}

export async function queryGraph(
  question: string,
): Promise<QueryEngineResponse> {
  const response = await fetch(
    `${QUERY_ENGINE_BASE_URL}${QUERY_ENGINE_API_PREFIX}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question } satisfies QueryEngineRequest),
    },
  );

  if (!response.ok) {
    let detail = `Query request failed: ${response.status} ${response.statusText}`;

    try {
      const errorBody = (await response.json()) as
        | QueryEngineErrorResponse
        | undefined;
      if (errorBody?.detail) {
        detail = errorBody.detail;
      }
    } catch {
      // Ignore JSON parse errors and keep the fallback error message.
    }

    throw new Error(detail);
  }

  return (await response.json()) as QueryEngineResponse;
}
