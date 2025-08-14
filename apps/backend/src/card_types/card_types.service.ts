import { ConflictException, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CardType,
  CreateCardTypeDto,
  UpdateCardTypeDto,
} from "@detective-quill/shared-types";

@Injectable()
export class CardTypesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserCardTypes(
    userId: string,
    accessToken: string
  ): Promise<CardType[] | null> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: cardTypes, error } = await supabase
      .from("card_types")
      .select("*")
      .eq("user_id", userId)
      .eq("is_custom", true);

    if (error) {
      throw new Error(`Error fetching card types: ${error.message}`);
    }

    return cardTypes as CardType[] | null;
  }

  async createCardType(
    userId: string,
    accessToken: string,
    cardTypeData: CreateCardTypeDto
  ): Promise<CardType> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: cardType, error } = await supabase
      .from("card_types")
      .insert({ ...cardTypeData, user_id: userId })
      .select()
      .single();

    // todo: add this in supabase
    if (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new ConflictException("Card type with this name already exists");
      }
      throw new Error(`Error creating card type: ${error.message}`);
    }

    return cardType as CardType;
  }

  async updateCardType(
    userId: string,
    accessToken: string,
    cardTypeId: string,
    updatedData: UpdateCardTypeDto,
  ): Promise<CardType> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: cardType, error } = await supabase
      .from("card_types")
      .update(updatedData)
      .eq("id", cardTypeId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating card type: ${error.message}`);
    }

    return cardType as CardType;
  }
}
