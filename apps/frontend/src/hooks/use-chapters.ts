import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { getChapters } from "@/lib/api/chapters";
import { ChapterFile } from "@/lib/types/workspace";
import { mapChaptersToFiles } from "@/lib/utils";

interface UseChaptersOptions {
  projectName: string;
  currentChapterSlug?: string;
}

interface UseChaptersReturn {
  chapterFiles: ChapterFile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChapters({
  projectName,
  currentChapterSlug,
}: UseChaptersOptions): UseChaptersReturn {
  const [chapterFiles, setChapterFiles] = useState<ChapterFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session } = useAuth();
  const router = useRouter();

  const fetchChapters = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getChapters(projectName, session.access_token);

      if (response.success) {
        const chapterFiles: ChapterFile[] = mapChaptersToFiles(response.data);

        // Redirect to first chapter if no chapter is selected
        if (!currentChapterSlug && chapterFiles.length > 0) {
          router.replace(
            `/workspace/${projectName}/text-editor/${chapterFiles[0].slug}`
          );
        }
      } else {
        const error = response.message || "Failed to fetch chapters";
        setError(error);
        toast.error(error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chapters";

      console.error("Error fetching chapters:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectName, session?.access_token, currentChapterSlug, router]);

  // Fetch chapters when dependencies change
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapterFiles,
    loading,
    error,
    refetch: fetchChapters,
  };
}
