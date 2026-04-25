"use client";

import React from "react";
import { CircleHelp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueryInput } from "@/components/query-manuscript/query-input";
import { QueryResults } from "@/components/query-manuscript/query-results";
import { useTextQuery } from "@/hooks/use-text-query";
import { useParams } from "next/navigation";

export const QueryPanel = () => {
  const params = useParams();
  const fsNodeId = params.nodeId as string;
  const projectId = params.projectId as string;
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<string[]>([]);
  const { runQuery, isLoading, error } = useTextQuery();

  const handleSearch = async () => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      return;
    }

    if (!fsNodeId || !projectId) {
      setResults([]);
      return;
    }

    setResults([]);
    const nextResults = await runQuery(normalizedQuery, fsNodeId, projectId);
    setResults(nextResults);
  };

  return (
    <div className="flex h-full flex-col bg-background noir-text">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <CircleHelp className="h-4 w-4" />
        <h3 className="font-medium">Query</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {results.length} results
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
        <div className="p-4">
          <QueryResults query={query} results={results} isLoading={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
};
