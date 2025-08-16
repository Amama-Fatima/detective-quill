import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CardTypesService } from "./card_types.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CardType, ApiResponse } from "@detective-quill/shared-types";
import {
  CreateCardTypeDto,
  UpdateCardTypeDto,
  GetCardTypesDto,
} from "./dto/card_types.dto";

@Controller("card-types")
@UseGuards(AuthGuard)
export class CardTypesController {
  constructor(private readonly cardTypesService: CardTypesService) {}

  @Get("user")
  async getUserCardTypes(
    @Req() request: any,
    @Query("blueprint_type") blueprint_type: GetCardTypesDto
  ): Promise<ApiResponse<CardType[]>> {
    const userId = request.user.id;
    const access_token = request.accessToken;
    try {
      const cardTypes = await this.cardTypesService.getUserCardTypes(
        userId,
        access_token,
        blueprint_type.blueprint_type
      );
      return {
        success: true,
        data: cardTypes ?? [],
        message: "Card types retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Error retrieving card types: " + error.message,
      };
    }
  }

  @Get("default")
  async getDefaultCardTypes(
    @Req() request: any,
    @Query("blueprint_type") blueprint_type: GetCardTypesDto
  ): Promise<ApiResponse<CardType[]>> {
    const access_token = request.accessToken;

    try {
      const cardTypes =
        await this.cardTypesService.getDefaultCardTypesForBlueprintType(
          blueprint_type.blueprint_type,
          access_token
        );
      return {
        success: true,
        data: cardTypes,
        message: "Default card types retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Error retrieving default card types: " + error.message,
      };
    }
  }

  @Post()
  async createCardType(
    @Req() request: any,
    @Body() createCardTypeDto: CreateCardTypeDto
  ): Promise<ApiResponse<CardType>> {
    const userId = request.user.id;
    const access_token = request.accessToken;

    try {
      const cardType = await this.cardTypesService.createCardType(
        userId,
        access_token,
        createCardTypeDto
      );
      return {
        success: true,
        data: cardType,
        message: "Card type created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating card type: " + error.message,
      };
    }
  }

  @Put(":id")
  async updateCardType(
    @Req() request: any,
    @Body() updateCardTypeDto: UpdateCardTypeDto
  ): Promise<ApiResponse<CardType>> {
    const userId = request.user.id;
    const access_token = request.accessToken;
    const cardTypeId = request.params.id;

    try {
      const cardType = await this.cardTypesService.updateCardType(
        userId,
        access_token,
        cardTypeId,
        updateCardTypeDto
      );
      return {
        success: true,
        data: cardType,
        message: "Card type updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating card type: " + error.message,
      };
    }
  }

  @Delete(":id")
  async deleteCardType(@Req() request: any): Promise<ApiResponse<void>> {
    const userId = request.user.id;
    const access_token = request.accessToken;
    const cardTypeId = request.params.id;

    try {
      await this.cardTypesService.deleteCardType(
        userId,
        access_token,
        cardTypeId
      );
      return {
        success: true,
        message: "Card type deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting card type: " + error.message,
      };
    }
  }
}
