const QUERY_ENGINE_BASE_URL =
  process.env.NEXT_PUBLIC_QUERY_ENGINE_URL || "http://localhost:8000";

const QUERY_ENGINE_API_PREFIX =
  process.env.NEXT_PUBLIC_QUERY_ENGINE_API_PREFIX || "/version1";

export interface QueryEngineRequest {
  question: string;
  fs_node_id: string;
  project_id: string;
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
  fsNodeId: string,
  projectId: string,
): Promise<QueryEngineResponse> {
  const response = await fetch(
    `${QUERY_ENGINE_BASE_URL}${QUERY_ENGINE_API_PREFIX}/query/${encodeURIComponent(fsNodeId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          question,
          fs_node_id: fsNodeId,
          project_id: projectId,
        } satisfies QueryEngineRequest,
      ),
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
    }

    throw new Error(detail);
  }

  return (await response.json()) as QueryEngineResponse;
}
