import { useAuth } from "@/context/auth-context";
import {
  createContribution,
  getMonthlyContributions,
} from "@/lib/backend-calls/contributions";
import { requireAccessToken } from "@/lib/utils/utils";
import type {
  ApiResponse,
  Contribution,
  MonthlyContributionsResponse,
} from "@detective-quill/shared-types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseContributionsResult {
  getMonthlyContributionsMutation: UseMutationResult<
    ApiResponse<MonthlyContributionsResponse>,
    Error,
    { year: number; month: number }
  >;
  logSaveContributionMutation: UseMutationResult<
    ApiResponse<Contribution>,
    Error,
    { referenceId?: string; contributionDate?: string }
  >;
  logCommitContributionMutation: UseMutationResult<
    ApiResponse<Contribution>,
    Error,
    { referenceId?: string; contributionDate?: string }
  >;
}

export const useContributions = (): UseContributionsResult => {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const getMonthlyContributionsMutation = useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const token = requireAccessToken(accessToken);
      return getMonthlyContributions(year, month, token);
    },
    onError: (error) => {
      toast.error(`Failed to fetch contributions: ${error.message}`);
    },
  });

  const logSaveContributionMutation = useMutation({
    mutationFn: async ({
      referenceId,
      contributionDate,
    }: {
      referenceId?: string;
      contributionDate?: string;
    }) => {
      const token = requireAccessToken(accessToken);
      return createContribution(
        {
          contribution_type: "save",
          reference_id: referenceId,
          contribution_date: contributionDate,
        },
        token,
      );
    },
    onSuccess: () => {
      toast.success("Contribution logged successfully");
    },
    onError: (error) => {
      toast.error(`Failed to log save contribution: ${error.message}`);
    },
  });

  const logCommitContributionMutation = useMutation({
    mutationFn: async ({
      referenceId,
      contributionDate,
    }: {
      referenceId?: string;
      contributionDate?: string;
    }) => {
      const token = requireAccessToken(accessToken);
      return createContribution(
        {
          contribution_type: "commit",
          reference_id: referenceId,
          contribution_date: contributionDate,
        },
        token,
      );
    },
    onSuccess: () => {
      toast.success("Contribution logged successfully");
    },
    onError: (error) => {
      toast.error(`Failed to log commit contribution: ${error.message}`);
    },
  });

  return {
    getMonthlyContributionsMutation,
    logSaveContributionMutation,
    logCommitContributionMutation,
  };
};
