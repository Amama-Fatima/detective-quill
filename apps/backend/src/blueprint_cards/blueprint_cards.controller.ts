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
import { BlueprintCard, ApiResponse } from "@detective-quill/shared-types";
import {
  CreateBlueprintCardDto,
  UpdateBlueprintCardDto,
} from "./dto/blueprint_cards.dto";

@Controller("blueprint-cards")
@UseGuards(AuthGuard)
export class BlueprintCardsController {
  constructor(private readonly blueprintCardsService: BlueprintCardsService) {}

  @Post(":blueprintId")
  async createBlueprintCard(
    @Req() request: any,
    @Body() cardData: CreateBlueprintCardDto[]
  ): Promise<ApiResponse<BlueprintCard[]>> {
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
        error: "Error creating blueprint card: " + error.message,
      };
    }
  }

  @Put("/:blueprintId/:cardId")
  async updateBlueprintCard(
    @Req() request: any,
    @Body() cardData: UpdateBlueprintCardDto
  ): Promise<ApiResponse<BlueprintCard>> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const blueprintId = request.params.blueprintId;
    const accessToken = request.accessToken;

    try {
      const updatedCard = await this.blueprintCardsService.updateBlueprintCard(
        cardId,
        userId,
        blueprintId,
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
        error: "Error updating blueprint card: " + error.message,
      };
    }
  }

  @Delete("/:blueprintId/:cardId")
  async deleteBlueprintCard(@Req() request: any): Promise<ApiResponse<void>> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const blueprintId = request.params.blueprintId;
    const accessToken = request.accessToken;

    try {
      await this.blueprintCardsService.deleteBlueprintCard(
        cardId,
        userId,
        blueprintId,
        accessToken
      );

      return {
        success: true,
        message: "Blueprint card deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: "Error deleting blueprint card: " + error.message,
      };
    }
  }
}

// @Get(":blueprintId")
// async getAllCardsOfBlueprint(
//   @Req() request: any
// ): Promise<ApiResponse<BlueprintCard[]>> {
//   const blueprintId = request.params.blueprintId;
//   const userId = request.user.id;
//   const accessToken = request.accessToken;

//   try {
//     const cards = await this.blueprintCardsService.fetchAllCardsOfBlueprint(
//       blueprintId,
//       userId,
//       accessToken
//     );

//     return {
//       success: true,
//       data: cards ?? [],
//       error: "Blueprint cards retrieved successfully",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: "Error retrieving blueprint cards: " + error.message,
//     };
//   }
// }
