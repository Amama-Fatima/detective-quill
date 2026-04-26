import React from "react";
import QueryResultLoading from "./query-result-loading";
import { type QueryEngineResponse } from "@/lib/backend-calls/query";

type QueryResultsProps = {
  query: string;
  response: QueryEngineResponse | null;
  isLoading?: boolean;
};

export const QueryResults = ({
  query,
  response,
  isLoading = false,
}: QueryResultsProps) => {
  if (isLoading) {
    return <QueryResultLoading />;
  }

  if (!query.trim()) {
    return (
      <div className="text-sm text-muted-foreground">
        Enter a question to see query results.
      </div>
    );
  }

  const answer = response?.answer?.trim() ?? "";
  const supportingEvidence = response?.supporting_ids_and_text ?? [];

  if (!answer && supportingEvidence.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No results found for this query.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {answer && (
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Answer
          </p>
          <p className="text-md leading-6 text-foreground">{answer}</p>
        </div>
      )}

      {supportingEvidence.length > 0 && (
        <div className="space-y-2">
          <p className="text-md font-medium text-muted-foreground">
            Supporting Evidence
          </p>
          <div className="flex flex-col gap-3">
            {supportingEvidence.map((evidence, index) => (
              <div
                key={`${evidence.job_id}-${evidence.fs_node_id ?? index}`}
                className="rounded-lg border border-border/60 bg-card p-3"
              >
                <p className="mb-1 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                  File Name
                </p>
                <p className="break-all text-lg text-foreground">
                  {evidence.fs_node_name ?? "Not available"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
