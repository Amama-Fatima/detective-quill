import { useMutation } from "@tanstack/react-query";
import {
  queryGraph,
  type QueryEngineResponse,
} from "@/lib/backend-calls/query";
import { toast } from "sonner";

type UseTextQueryReturn = {
  runQuery: (
    question: string,
    fsNodeId: string,
    projectId: string,
  ) => Promise<QueryEngineResponse>;
  isLoading: boolean;
  error: string | null;
  response: QueryEngineResponse | null;
};

export const useTextQuery = (): UseTextQueryReturn => {
  const queryMutation = useMutation({
    mutationFn: ({
      question,
      fsNodeId,
      projectId,
    }: {
      question: string;
      fsNodeId: string;
      projectId: string;
    }) => queryGraph(question, fsNodeId, projectId),
    onError: (error) => {
      console.error("Error running query:", error);
      toast.error("Error running query. Please try again.");
    },
  });

  const runQuery = async (
    question: string,
    fsNodeId: string,
    projectId: string,
  ): Promise<QueryEngineResponse> => {
    return queryMutation.mutateAsync({
      question,
      fsNodeId,
      projectId,
    });
  };

  return {
    runQuery,
    isLoading: queryMutation.isPending,
    error:
      queryMutation.error instanceof Error ? queryMutation.error.message : null,
    response: queryMutation.data ?? null,
  };
};
