import { Injectable } from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { UpdateBranchDto } from "./dto/branches.dto";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class WorkerBranchesService {
  constructor(private adminSupabaseService: AdminSupabaseService) {}

  async getHeadCommitId(branchId: string): Promise<string | null> {
    const supabase = this.adminSupabaseService.client;
    const { data: branch } = await supabase
      .from("branches")
      .select("head_commit_id")
      .eq("id", branchId)
      .single();

    return branch?.head_commit_id || null;
  }

  
    async updateBranch(branchId: string, updateBranchDto: UpdateBranchDto) {
      const supabase = this.adminSupabaseService.client;
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
}
