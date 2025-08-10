import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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

  async createChapter(
    userId: string,
    projectTitle: string,
    chapterData: {
      title: string;
      content: string;
      chapterOrder: number;
    },
    accessToken: string
  ): Promise<ChapterWithProject> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First, find and verify project ownership
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

    // Check if chapter order already exists
    const { data: existingChapter, error: checkError } = await supabase
      .from("chapters")
      .select("id")
      .eq("project_id", project.id)
      .eq("chapter_order", chapterData.chapterOrder)
      .single();

    if (existingChapter) {
      throw new ConflictException(
        `Chapter with order ${chapterData.chapterOrder} already exists`
      );
    }

    // Calculate word count
    const wordCount = this.calculateWordCount(chapterData.content);

    // Create the chapter
    const { data: chapter, error: createError } = await supabase
      .from("chapters")
      .insert({
        project_id: project.id,
        title: chapterData.title,
        content: chapterData.content,
        chapter_order: chapterData.chapterOrder,
        word_count: wordCount,
      })
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
      .single();

    if (createError) {
      throw new Error(`Failed to create chapter: ${createError.message}`);
    }

    // Update project's total word count
    await this.updateProjectWordCount(project.id, accessToken);

    return chapter;
  }

  async updateChapter(
    userId: string,
    chapterId: string,
    updateData: {
      title?: string;
      content?: string;
      chapterOrder?: number;
      isPublished?: boolean;
    },
    accessToken: string
  ): Promise<ChapterWithProject> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First, verify the chapter exists and user has access
    const { data: existingChapter, error: fetchError } = await supabase
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
      .eq("id", chapterId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new NotFoundException("Chapter not found");
      }
      throw new Error(`Failed to fetch chapter: ${fetchError.message}`);
    }

    if (existingChapter.project.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this chapter");
    }

    // If updating chapter order, check for conflicts
    if (
      updateData.chapterOrder !== undefined &&
      updateData.chapterOrder !== existingChapter.chapter_order
    ) {
      const { data: conflictingChapter } = await supabase
        .from("chapters")
        .select("id")
        .eq("project_id", existingChapter.project_id)
        .eq("chapter_order", updateData.chapterOrder)
        .neq("id", chapterId)
        .single();

      if (conflictingChapter) {
        throw new ConflictException(
          `Chapter with order ${updateData.chapterOrder} already exists`
        );
      }
    }

    // Prepare update object
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.title !== undefined) {
      updatePayload.title = updateData.title;
    }
    if (updateData.content !== undefined) {
      updatePayload.content = updateData.content;
      updatePayload.word_count = this.calculateWordCount(updateData.content);
    }
    if (updateData.chapterOrder !== undefined) {
      updatePayload.chapter_order = updateData.chapterOrder;
    }
    if (updateData.isPublished !== undefined) {
      updatePayload.is_published = updateData.isPublished;
    }

    // Update the chapter
    const { data: updatedChapter, error: updateError } = await supabase
      .from("chapters")
      .update(updatePayload)
      .eq("id", chapterId)
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
      .single();

    if (updateError) {
      throw new Error(`Failed to update chapter: ${updateError.message}`);
    }

    // Update project's total word count if content changed
    if (updateData.content !== undefined) {
      await this.updateProjectWordCount(
        existingChapter.project_id,
        accessToken
      );
    }

    return updatedChapter;
  }

  private calculateWordCount(content: string): number {
    if (!content || content.trim() === "") {
      return 0;
    }

    // Remove markdown syntax and count words
    const plainText = content
      .replace(/[#*_`~\[\]()]/g, "") // Remove basic markdown characters
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    if (plainText === "") {
      return 0;
    }

    return plainText.split(/\s+/).length;
  }

  private async updateProjectWordCount(
    projectId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Calculate total word count for all chapters in the project
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("word_count")
      .eq("project_id", projectId);

    if (error) {
      console.error("Failed to calculate project word count:", error);
      return;
    }

    const totalWordCount =
      chapters?.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0) ||
      0;

    // Update the project's word count
    await supabase
      .from("projects")
      .update({
        current_word_count: totalWordCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
  }
}
