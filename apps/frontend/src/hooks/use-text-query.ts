import { useMutation } from "@tanstack/react-query";
import {
  queryGraph,
  type QueryEngineResponse,
} from "@/lib/backend-calls/query";

type UseTextQueryReturn = {
  runQuery: (question: string) => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
  response: QueryEngineResponse | null;
};

const formatResultRecord = (record: Record<string, unknown>): string => {
  return JSON.stringify(record);
};

export const useTextQuery = (): UseTextQueryReturn => {
  const queryMutation = useMutation({
    mutationFn: (question: string) => queryGraph(question),
  });

  const runQuery = async (question: string): Promise<string[]> => {
    const response = await queryMutation.mutateAsync(question);
    if (!response.data?.length) {
      return response.message ? [response.message] : [];
    }

    return response.data.map(formatResultRecord);
  };

  return {
    runQuery,
    isLoading: queryMutation.isPending,
    error:
      queryMutation.error instanceof Error ? queryMutation.error.message : null,
    response: queryMutation.data ?? null,
  };
};
