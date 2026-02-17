import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branches.dto";

@Injectable()
export class BranchesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createBranch(createBranchDto: CreateBranchDto, projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .insert({
        ...createBranchDto,
        project_id: projectId,
        head_commit_id: createBranchDto.parent_commit_id, // Auto-set
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }

    return data;
  }

  async getBranchById(branchId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("id", branchId)
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async getBranchesByProject(projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }

    return data;
  }

  async updateBranch(branchId: string, updateBranchDto: UpdateBranchDto) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .update(updateBranchDto)
      .eq("id", branchId)
      .select("*")
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async deleteBranch(branchId: string) {
    const supabase = this.supabaseService.client;

    // Prevent deleting default branch
    const branch = await this.getBranchById(branchId);
    if (branch.is_default) {
      throw new BadRequestException("Cannot delete the default branch");
    }

    const { data, error } = await supabase
      .from("branches")
      .delete()
      .eq("id", branchId)
      .select("*")
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async getHeadCommitId(branchId: string): Promise<string | null> {
    const supabase = this.supabaseService.client;
    const { data: branch } = await supabase
      .from("branches")
      .select("head_commit_id")
      .eq("id", branchId)
      .single();

    return branch?.head_commit_id || null;
  }
}
