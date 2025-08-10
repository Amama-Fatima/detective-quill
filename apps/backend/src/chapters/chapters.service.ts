import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { type ChapterWithProject } from "@detective-quill/shared-types";

@Injectable()
export class ChaptersService {
  constructor(private supabaseService: SupabaseService) {}

  async getChaptersByUserAndProjectTitle(
    userId: string,
    projectTitle: string,
    accessToken: string
  ): Promise<ChapterWithProject[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First, find the project by title and verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title, user_id")
      .eq("title", projectTitle)
      .eq("user_id", userId)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        throw new NotFoundException(
          `Project with title "${projectTitle}" not found`
        );
      }
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    if (project.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this project");
    }

    // Now fetch chapters for this project
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select(
        `
        *,
        project:projects!inner (
          id,
          title,
          user_id
        )
      `
      )
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    if (chaptersError) {
      throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
    }

    return chapters || [];
  }
}
