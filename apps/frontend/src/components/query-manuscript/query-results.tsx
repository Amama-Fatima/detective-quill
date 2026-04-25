import React from "react";
import QueryResultLoading from "./query-result-loading";

type QueryResultsProps = {
  query: string;
  results: string[];
  isLoading?: boolean;
};

export const QueryResults = ({
  query,
  results,
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

  if (results.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No results found for this query.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <div
          key={`${result}-${index}`}
          className="rounded-lg border border-border/60 bg-card p-3"
        >
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Result {index + 1}
          </p>
          <p className="text-sm leading-6 text-foreground">{result}</p>
        </div>
      ))}
    </div>
  );
};
