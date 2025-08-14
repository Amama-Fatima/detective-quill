import { Injectable } from "@nestjs/common";
import {
  Blueprint,
  CreateBlueprintDto,
  UpdateBlueprintDto,
} from "@detective-quill/shared-types";
import { SupabaseService } from "../supabase/supabase.service";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class BlueprintsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async fetchUserBlueprints(
    userId: string,
    accessToken: string
  ): Promise<Blueprint[] | null> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: blueprints, error: blueprintError } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("user_id", userId);

    if (blueprintError) {
      throw new Error(
        `Error fetching user blueprints: ${blueprintError.message}`
      );
    }
    return blueprints as Blueprint[] | null
  }

  async fetchUserBlueprintById(
    userId: string,
    accessToken: string,
    blueprintId: string
  ): Promise<Blueprint | null> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: blueprint, error: blueprintError } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("user_id", userId)
      .eq("id", blueprintId)
      .single();

    if (blueprintError) {
      if (blueprintError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(
          `Blueprint with ID ${blueprintId} not found`
        );
      }
      throw new Error(
        `Error fetching user blueprint by ID: ${blueprintError.message}`
      );
    }

    return blueprint as Blueprint;
  }

  async createBlueprint(
    userId: string,
    accessToken: string,
    createBlueprintDto: CreateBlueprintDto
  ): Promise<Blueprint | null> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: blueprint, error: blueprintError } = await supabase
      .from("blue_prints")
      .insert({ ...createBlueprintDto, user_id: userId })
      .select()
      .single();

    if (blueprintError) {
      throw new Error(`Error creating blueprint: ${blueprintError.message}`);
    }

    return blueprint as Blueprint;
  }

  // only title can be upadted
  async updatedBlueprint(
    userId: string,
    blueprintId: string,
    accessToken: string,
    updateBlueprintDto: UpdateBlueprintDto
  ): Promise<Blueprint | null> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: blueprint, error: blueprintError } = await supabase
      .from("blue_prints")
      .update({ title: updateBlueprintDto.title })
      .eq("id", blueprintId)
      .eq("user_id", userId)
      .select()
      .single();

    if (blueprintError) {
      if (blueprintError.code === "PGRST116") {
        // No rows updated - blueprint doesn't exist or user doesn't own it
        throw new NotFoundException(
          `Blueprint with ID ${blueprintId} not found`
        );
      }
      throw new Error(
        `Error updating user blueprint: ${blueprintError.message}`
      );
    }

    return blueprint as Blueprint;
  }
}
