import { Injectable } from "@nestjs/common";
import { type Invitation } from "@detective-quill/shared-types";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";

@Injectable()
export class WorkerInvitationsService {
  constructor(private adminSupabaseService: AdminSupabaseService) {}

  async addInvitation(
    projectId: string,
    inviteCode: string,
    toEmail: string
  ): Promise<void> {
    console.log("inside add invitation")
    const supabase = this.adminSupabaseService.client;
    const { error } = await supabase.from("invitations").insert({
      project_id: projectId,
      invite_code: inviteCode,
      email: toEmail,
    });
    console.log("invitation insert attempted")
    if (error) {
      throw new Error(`Failed to add invitation: ${error.message}`);
    }
    return;
  }
}
