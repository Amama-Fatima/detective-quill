import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { BlueprintCardsService } from "./blueprint_cards.service";
import {
  GetBlueprintCardResponse,
  GetBlueprintCardsResponse,
} from "@detective-quill/shared-types";
import {
  CreateBlueprintCardDto,
  UpdateBlueprintCardDto,
} from "./dto/blueprint_cards.dto";

@Controller("blueprint-cards")
@UseGuards(AuthGuard)
export class BlueprintCardsController {
  constructor(private readonly blueprintCardsService: BlueprintCardsService) {}

  @Get(":blueprintId")
  async getAllCardsOfBlueprint(
    @Req() request: any
  ): Promise<GetBlueprintCardsResponse> {
    const blueprintId = request.params.blueprintId;
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      const cards = await this.blueprintCardsService.fetchAllCardsOfBlueprint(
        blueprintId,
        userId,
        accessToken
      );

      return {
        success: true,
        data: cards,
        message: "Blueprint cards retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Error retrieving blueprint cards: " + error.message,
      };
    }
  }

  @Post(":blueprintId")
  async createBlueprintCard(
    @Req() request: any,
    @Body() cardData: CreateBlueprintCardDto[]
  ): Promise<GetBlueprintCardResponse> {
    const blueprintId = request.params.blueprintId;
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      await this.blueprintCardsService.createBlueprintCard(
        blueprintId,
        userId,
        accessToken,
        cardData
      );

      return {
        success: true,
        message: "Blueprint card created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating blueprint card: " + error.message,
      };
    }
  }

  @Put(":cardId")
  async updateBlueprintCard(
    @Req() request: any,
    @Body() cardData: UpdateBlueprintCardDto
  ): Promise<GetBlueprintCardResponse> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      const updatedCard = await this.blueprintCardsService.updateBlueprintCard(
        cardId,
        userId,
        accessToken,
        cardData
      );

      return {
        success: true,
        data: updatedCard,
        message: "Blueprint card updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating blueprint card: " + error.message,
      };
    }
  }

  @Delete(":cardId")
  async deleteBlueprintCard(
    @Req() request: any
  ): Promise<GetBlueprintCardResponse> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      await this.blueprintCardsService.deleteBlueprintCard(
        cardId,
        userId,
        accessToken
      );

      return {
        success: true,
        message: "Blueprint card deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting blueprint card: " + error.message,
      };
    }
  }
}
