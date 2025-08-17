import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CardType } from "@detective-quill/shared-types";
import { CreateCardTypeDto, UpdateCardTypeDto } from "./dto/card_types.dto";

@Injectable()
export class CardTypesService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
    updatedData: UpdateCardTypeDto
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
      if (error.code === "PGRST116") {
        throw new NotFoundException(
          `Card Type with ID ${cardTypeId} not found`
        );
      }
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return cardType as CardType;
  }

  async deleteCardType(
    userId: string,
    accessToken: string,
    cardTypeId: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { error } = await supabase
      .from("card_types")
      .delete()
      .eq("id", cardTypeId)
      .eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundException(
          `Card Type with ID ${cardTypeId} not found`
        );
      }
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }
  }
}



  // async getUserCardTypes(
  //   userId: string,
  //   accessToken: string,
  //   blueprint_type: BlueprintType
  // ): Promise<CardType[] | null> {
  //   const supabase = this.supabaseService.getClientWithAuth(accessToken);

  //   const { data: cardTypes, error } = await supabase
  //     .from("card_types")
  //     .select("*")
  //     .eq("user_id", userId)
  //     .eq("is_custom", true)
  //     .eq("blueprint_type", blueprint_type);

  //   if (error) {
  //     throw new Error(`Error fetching card types: ${error.message}`);
  //   }

  //   return cardTypes as CardType[] | null;
  // }

  // async getDefaultCardTypesForBlueprintType(
  //   blueprint_type: BlueprintType,
  //   accessToken: string
  // ): Promise<CardType[]> {
  //   const supabase = this.supabaseService.getClientWithAuth(accessToken);

  //   const { data: cardTypes, error } = await supabase
  //     .from("card_types")
  //     .select("*")
  //     .eq("is_custom", false)
  //     .eq("blueprint_type", blueprint_type);

  //   if (error) {
  //     throw new Error(`Error fetching card types: ${error.message}`);
  //   }

  //   return cardTypes as CardType[];
  // }