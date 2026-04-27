const QUERY_ENGINE_BASE_URL =
  process.env.NEXT_PUBLIC_QUERY_ENGINE_URL || "http://localhost:8000";

// const QUERY_ENGINE_API_PREFIX =
//   process.env.NEXT_PUBLIC_QUERY_ENGINE_API_PREFIX || "/version1";

export interface QueryEngineRequest {
  question: string;
  fs_node_id: string;
  project_id: string;
}

export interface QueryEngineEntity {
  job_id: string | null;
  name: string;
  mentions: string[];
}

export interface QueryEngineRelationship {
  job_id: string | null;
  source: string;
  target: string;
  relation_type: string;
}

export interface QueryEngineSupportingEvidence {
  job_id: string;
  resolved_text: string | null;
  fs_node_id: string | null;
  fs_node_name: string | null;
}

export interface QueryEngineResponse {
  status: string;
  question: string;
  answer: string | null;
  supporting_ids_and_text: QueryEngineSupportingEvidence[];
  entities: QueryEngineEntity[];
  relationships: QueryEngineRelationship[];
}

interface QueryEngineErrorResponse {
  detail?: string;
}

export async function queryGraph(
  question: string,
  fsNodeId: string,
  projectId: string,
): Promise<QueryEngineResponse> {
  let response: Response;
  try {
    response = await fetch(`${QUERY_ENGINE_BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        fs_node_id: fsNodeId,
        project_id: projectId,
      } satisfies QueryEngineRequest),
    });
  } catch {
    throw new Error(
      "Could not reach query engine.",
    );
  }

  if (!response.ok) {
    let detail = `Query request failed: ${response.status} ${response.statusText}`;

    try {
      const errorBody = (await response.json()) as
        | QueryEngineErrorResponse
        | undefined;
      if (errorBody?.detail) {
        detail = errorBody.detail;
      }
    } catch {}

    throw new Error(detail);
  }

  return (await response.json()) as QueryEngineResponse;
}
