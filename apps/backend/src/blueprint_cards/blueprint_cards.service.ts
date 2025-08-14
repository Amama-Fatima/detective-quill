import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  BlueprintCard,
  CreateBlueprintCardDto,
  UpdateBlueprintCardDto,
} from "@detective-quill/shared-types/api";

@Injectable()
export class BlueprintCardsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async fetchAllCardsOfBlueprint(
    blueprintId: string,
    userId: string,
    accessToken: string
  ): Promise<BlueprintCard[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: blueprintCards, error } = await supabase
      .from("blueprint_cards")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return (blueprintCards as BlueprintCard[]) || [];
  }

  async createBlueprintCard(
    blueprintId: string,
    userId: string,
    accessToken: string,
    cardData: CreateBlueprintCardDto[]
  ) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const cards = cardData.map((data) => ({
      ...data,
      blueprint_id: blueprintId,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from("blueprint_cards")
      .insert(cards);

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }

  async updateBlueprintCard(
    cardId: string,
    userId: string,
    accessToken: string,
    cardData: UpdateBlueprintCardDto
  ) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: updatedCard, error } = await supabase
      .from("blueprint_cards")
      .update(cardData)
      .eq("id", cardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to update card: ${error.message}`);
    }

    return updatedCard as BlueprintCard;
  }
}
