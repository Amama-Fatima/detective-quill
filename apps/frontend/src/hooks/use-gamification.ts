import { useAuth } from "@/context/auth-context";
import {
  getMyGamification,
  getAllBadges,
} from "@/lib/backend-calls/gamification";
import { requireAccessToken } from "@/lib/utils/utils";
import type { GamificationSummary, Badge } from "@detective-quill/shared-types";
import { useQuery } from "@tanstack/react-query";

interface UseGamificationResult {
  gamification: GamificationSummary | null;
  stats: GamificationSummary["stats"];
  earnedBadges: GamificationSummary["earnedBadges"];
  allBadges: Badge[];
  isLoading: boolean;
  isLoadingBadges: boolean;
  error: string | null;
  badgesError: string | null;
  refetch: () => void;
}

export const useGamification = (): UseGamificationResult => {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["gamification", session?.user?.id],
    queryFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await getMyGamification(token);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch gamification data");
    },
    enabled: !!session?.access_token,
  });

  const {
    data: badgesData,
    isLoading: isLoadingBadges,
    error: badgesError,
  } = useQuery({
    queryKey: ["badges", "all"],
    queryFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await getAllBadges(token);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch all badges");
    },
    enabled: !!session?.access_token,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
  });

  return {
    gamification: data ?? null,
    stats: data?.stats ?? null,
    earnedBadges: data?.earnedBadges ?? [],
    allBadges: badgesData ?? [],
    isLoading,
    isLoadingBadges,
    error: error instanceof Error ? error.message : null,
    badgesError: badgesError instanceof Error ? badgesError.message : null,
    refetch: () => {
      void refetch();
    },
  };
};
