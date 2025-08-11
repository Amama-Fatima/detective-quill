import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  type ChapterWithProject,
  type Folder,
  type FolderWithChildren,
  type WorkspaceData,
} from "@detective-quill/shared-types";

@Injectable()
export class ChaptersService {
  constructor(private supabaseService: SupabaseService) {}

  async getWorkspaceData(
    userId: string,
    projectTitle: string,
    accessToken: string
  ): Promise<WorkspaceData> {
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

    // Fetch chapters with folder information
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select(
        `
        *,
        project:projects!inner (
          id,
          title,
          user_id
        ),
        folder:folders (
          id,
          name
        )
      `
      )
      .eq("project_id", project.id)
      .order("chapter_order", { ascending: true });

    if (chaptersError) {
      throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
    }

    // Fetch folders with hierarchy
    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("project_id", project.id)
      .order("folder_order", { ascending: true });

    if (foldersError) {
      throw new Error(`Failed to fetch folders: ${foldersError.message}`);
    }

    // Build folder hierarchy
    const folderHierarchy = this.buildFolderHierarchy(
      folders || [],
      chapters || []
    );

    return {
      chapters: chapters || [],
      folders: folderHierarchy,
    };
  }

  async createChapter(
    userId: string,
    projectTitle: string,
    chapterData: {
      title: string;
      content: string;
      chapterOrder: number;
      folderId?: string | null;
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

    // Verify folder exists if specified
    if (chapterData.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .select("id, project_id")
        .eq("id", chapterData.folderId)
        .eq("project_id", project.id)
        .single();

      if (folderError || !folder) {
        throw new NotFoundException("Specified folder not found");
      }
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
        folder_id: chapterData.folderId,
        word_count: wordCount,
      })
      .select(
        `
        *,
        project:projects!inner (
          id,
          title,
          user_id
        ),
        folder:folders (
          id,
          name
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
      folderId?: string | null;
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

    // Verify folder exists if specified
    if (updateData.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .select("id, project_id")
        .eq("id", updateData.folderId)
        .eq("project_id", existingChapter.project_id)
        .single();

      if (folderError || !folder) {
        throw new NotFoundException("Specified folder not found");
      }
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
    if (updateData.folderId !== undefined) {
      updatePayload.folder_id = updateData.folderId;
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
        ),
        folder:folders (
          id,
          name
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

  private buildFolderHierarchy(
    folders: Folder[],
    chapters: ChapterWithProject[]
  ): FolderWithChildren[] {
    const folderMap = new Map<string, FolderWithChildren>();
    const rootFolders: FolderWithChildren[] = [];

    // Initialize folder map
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        chapters: chapters.filter((chapter) => chapter.folder_id === folder.id),
      });
    });

    // Build hierarchy
    folders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.id);
      if (!folderWithChildren) return;

      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children!.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  }

  private calculateWordCount(content: string): number {
    if (!content || content.trim() === "") {
      return 0;
    }

    // For JSON content from BlockNote, we need to extract text
    try {
      const blocks = JSON.parse(content);
      if (Array.isArray(blocks)) {
        return this.extractWordCountFromBlocks(blocks);
      }
    } catch {
      // Fallback to treating as plain text
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

  private extractWordCountFromBlocks(blocks: any[]): number {
    let wordCount = 0;

    blocks.forEach((block) => {
      if (block.content && Array.isArray(block.content)) {
        block.content.forEach((contentItem: any) => {
          if (contentItem.type === "text" && contentItem.text) {
            wordCount += contentItem.text
              .split(/\s+/)
              .filter((word: string) => word.length > 0).length;
          }
        });
      }

      // Recursively count words in nested blocks
      if (block.children && Array.isArray(block.children)) {
        wordCount += this.extractWordCountFromBlocks(block.children);
      }
    });

    return wordCount;
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
