import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  type Folder,
  type FolderWithChildren,
  type ChapterWithProject,
} from "@detective-quill/shared-types";

@Injectable()
export class FoldersService {
  constructor(private supabaseService: SupabaseService) {}

  async getFoldersByProject(
    userId: string,
    projectTitle: string,
    includeChildren: boolean = true,
    accessToken: string
  ): Promise<FolderWithChildren[]> {
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

    // Fetch folders for this project
    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("project_id", project.id)
      .order("folder_order", { ascending: true });

    if (foldersError) {
      throw new Error(`Failed to fetch folders: ${foldersError.message}`);
    }

    if (!includeChildren) {
      return (
        folders?.map((folder) => ({ ...folder, children: [], chapters: [] })) ||
        []
      );
    }

    // Fetch chapters to include in folder structure
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

    // Build folder hierarchy with chapters
    return this.buildFolderHierarchy(folders || [], chapters || []);
  }

  async createFolder(
    userId: string,
    projectTitle: string,
    folderData: {
      name: string;
      parentId?: string | null;
      folderOrder: number;
    },
    accessToken: string
  ): Promise<Folder> {
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

    // Verify parent folder exists if specified
    if (folderData.parentId) {
      const { data: parentFolder, error: parentError } = await supabase
        .from("folders")
        .select("id, project_id")
        .eq("id", folderData.parentId)
        .eq("project_id", project.id)
        .single();

      if (parentError || !parentFolder) {
        throw new NotFoundException("Parent folder not found");
      }
    }

    // Check for duplicate folder names at the same level
    const { data: existingFolder, error: checkError } = await supabase
      .from("folders")
      .select("id")
      .eq("project_id", project.id)
      .eq("name", folderData.name)
      .eq("parent_id", folderData.parentId || null)
      .single();

    if (existingFolder) {
      throw new ConflictException(
        `Folder with name "${folderData.name}" already exists at this level`
      );
    }

    // Create the folder
    const { data: folder, error: createError } = await supabase
      .from("folders")
      .insert({
        project_id: project.id,
        name: folderData.name,
        parent_id: folderData.parentId || null,
        folder_order: folderData.folderOrder,
      })
      .select("*")
      .single();

    if (createError) {
      throw new Error(`Failed to create folder: ${createError.message}`);
    }

    return folder;
  }

  async updateFolder(
    userId: string,
    folderId: string,
    updateData: {
      name?: string;
      parentId?: string | null;
      folderOrder?: number;
    },
    accessToken: string
  ): Promise<Folder> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First, verify the folder exists and user has access
    const { data: existingFolder, error: fetchError } = await supabase
      .from("folders")
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
      .eq("id", folderId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new NotFoundException("Folder not found");
      }
      throw new Error(`Failed to fetch folder: ${fetchError.message}`);
    }

    if (existingFolder.project.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this folder");
    }

    // Prevent circular hierarchy (folder can't be moved to its own child)
    if (updateData.parentId) {
      const isCircular = await this.checkCircularHierarchy(
        folderId,
        updateData.parentId,
        accessToken
      );
      if (isCircular) {
        throw new BadRequestException("Cannot move folder to its own child");
      }

      // Verify parent folder exists
      const { data: parentFolder, error: parentError } = await supabase
        .from("folders")
        .select("id, project_id")
        .eq("id", updateData.parentId)
        .eq("project_id", existingFolder.project_id)
        .single();

      if (parentError || !parentFolder) {
        throw new NotFoundException("Parent folder not found");
      }
    }

    // Check for duplicate names if name is being changed
    if (updateData.name && updateData.name !== existingFolder.name) {
      const { data: duplicateFolder, error: duplicateError } = await supabase
        .from("folders")
        .select("id")
        .eq("project_id", existingFolder.project_id)
        .eq("name", updateData.name)
        .eq(
          "parent_id",
          updateData.parentId !== undefined
            ? updateData.parentId
            : existingFolder.parent_id
        )
        .neq("id", folderId)
        .single();

      if (duplicateFolder) {
        throw new ConflictException(
          `Folder with name "${updateData.name}" already exists at this level`
        );
      }
    }

    // Prepare update object
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name;
    }
    if (updateData.parentId !== undefined) {
      updatePayload.parent_id = updateData.parentId;
    }
    if (updateData.folderOrder !== undefined) {
      updatePayload.folder_order = updateData.folderOrder;
    }

    // Update the folder
    const { data: updatedFolder, error: updateError } = await supabase
      .from("folders")
      .update(updatePayload)
      .eq("id", folderId)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(`Failed to update folder: ${updateError.message}`);
    }

    return updatedFolder;
  }

  async deleteFolder(
    userId: string,
    folderId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First, verify the folder exists and user has access
    const { data: existingFolder, error: fetchError } = await supabase
      .from("folders")
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
      .eq("id", folderId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new NotFoundException("Folder not found");
      }
      throw new Error(`Failed to fetch folder: ${fetchError.message}`);
    }

    if (existingFolder.project.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this folder");
    }

    // Check if folder has children (prevent deletion of non-empty folders)
    const { data: childFolders, error: childError } = await supabase
      .from("folders")
      .select("id")
      .eq("parent_id", folderId)
      .limit(1);

    if (childError) {
      throw new Error(
        `Failed to check for child folders: ${childError.message}`
      );
    }

    if (childFolders && childFolders.length > 0) {
      throw new BadRequestException(
        "Cannot delete folder that contains subfolders"
      );
    }

    // Check if folder has chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select("id")
      .eq("folder_id", folderId)
      .limit(1);

    if (chaptersError) {
      throw new Error(`Failed to check for chapters: ${chaptersError.message}`);
    }

    if (chapters && chapters.length > 0) {
      throw new BadRequestException(
        "Cannot delete folder that contains chapters"
      );
    }

    // Delete the folder
    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId);

    if (deleteError) {
      throw new Error(`Failed to delete folder: ${deleteError.message}`);
    }
  }

  private async checkCircularHierarchy(
    folderId: string,
    newParentId: string,
    accessToken: string
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    let currentParentId = newParentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        // Infinite loop detected
        return true;
      }
      if (currentParentId === folderId) {
        // Circular reference detected
        return true;
      }

      visited.add(currentParentId);

      const { data: parentFolder, error } = await supabase
        .from("folders")
        .select("parent_id")
        .eq("id", currentParentId)
        .single();

      if (error || !parentFolder) {
        break;
      }

      currentParentId = parentFolder.parent_id;
    }

    return false;
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
}
