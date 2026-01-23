import {
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Put,
  Req,
  UseGuards,
  ParseArrayPipe,
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
    @Body(new ParseArrayPipe({ items: CreateBlueprintCardDto }))
    cardData: CreateBlueprintCardDto[]
  ): Promise<ApiResponse<BlueprintCard[]>> {
    const blueprintId = request.params.blueprintId;
    const userId = request.user.id;

    try {
      await this.blueprintCardsService.createBlueprintCard(
        blueprintId,
        userId,
        cardData
      );

      return {
        success: true,
        message: "Blueprint card created successfully",
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating blueprint card: ${error.message}`
      );
    }
  }

  @Put(":blueprintId/:cardId")
  async updateBlueprintCard(
    @Req() request: any,
    @Body() cardData: UpdateBlueprintCardDto
  ): Promise<ApiResponse<BlueprintCard>> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const blueprintId = request.params.blueprintId;

    try {
      const updatedCard = await this.blueprintCardsService.updateBlueprintCard(
        cardId,
        userId,
        blueprintId,
        cardData
      );

      return {
        success: true,
        data: updatedCard,
        message: "Blueprint card updated successfully",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update blueprint card: ${error.message}`
      );
    }
  }

  @Delete(":blueprintId/:cardId")
  async deleteBlueprintCard(@Req() request: any): Promise<ApiResponse<void>> {
    const cardId = request.params.cardId;
    const userId = request.user.id;
    const blueprintId = request.params.blueprintId;

    try {
      await this.blueprintCardsService.deleteBlueprintCard(
        cardId,
        userId,
        blueprintId
      );

      return {
        success: true,
        message: "Blueprint card deleted successfully",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete blueprint card: ${error.message}`
      );
    }
  }
}
