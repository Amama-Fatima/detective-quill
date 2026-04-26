"use client";

import React from "react";
import { CircleHelp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueryInput } from "@/components/query-manuscript/query-input";
import { QueryResults } from "@/components/query-manuscript/query-results";
import { useTextQuery } from "@/hooks/use-text-query";
import { useParams } from "next/navigation";
import { type QueryEngineResponse } from "@/lib/backend-calls/query";

export const QueryPanel = () => {
  const params = useParams();
  const fsNodeId = params.nodeId as string;
  const projectId = params.projectId as string;
  const [query, setQuery] = React.useState("");
  const [response, setResponse] = React.useState<QueryEngineResponse | null>(
    null,
  );
  const { runQuery, isLoading, error } = useTextQuery();

  const handleSearch = async () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResponse(null);
      return;
    }

    if (!fsNodeId || !projectId) {
      setResponse(null);
      return;
    }

    setResponse(null);
    try {
      const nextResponse = await runQuery(normalizedQuery, fsNodeId, projectId);
      setResponse(nextResponse);
    } catch {
      setResponse(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background noir-text">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <CircleHelp className="h-4 w-4" />
        <h3 className="font-medium">Query</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {response?.supporting_ids_and_text?.length ?? 0} results
        </span>
      </div>

      <div className="shrink-0 border-b p-4">
        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          isLoading={isLoading}
        />
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      <ScrollArea className="h-0 flex-1">
        <div className="p-4 bg-sidebar">
          <QueryResults query={query} response={response} isLoading={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
};
