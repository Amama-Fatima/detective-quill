import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
  ParseArrayPipe,
  Param,
} from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { BlueprintCardsService } from "./blueprint_cards.service";
import { BlueprintCard, ApiResponse } from "@detective-quill/shared-types";
import { ProjectsService } from "src/projects/projects.service";
import {
  CreateBlueprintCardDto,
  UpdateBlueprintCardDto,
} from "./dto/blueprint_cards.dto";

@Controller(":projectId/blueprints/:blueprintId/blueprint-cards")
@UseGuards(AuthGuard)
export class BlueprintCardsController {
  constructor(
    private readonly blueprintCardsService: BlueprintCardsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async createBlueprintCard(
    @Param("projectId") projectId: string,
    @Param("blueprintId") blueprintId: string,
    @Req() request: any,
    @Body(new ParseArrayPipe({ items: CreateBlueprintCardDto }))
    cardData: CreateBlueprintCardDto[],
  ): Promise<ApiResponse<BlueprintCard[]>> {
    console.log("Received request to create blueprint cards:");

    await this.projectsService.verifyProjectOwnership(
      projectId,
      request.user.id,
    );
    const userId = request.user.id;
    await this.blueprintCardsService.createBlueprintCard(
      blueprintId,
      userId,
      cardData,
    );

    return {
      success: true,
      message: "Blueprint card created successfully",
    };
  }

  @Put(":cardId")
  async updateBlueprintCard(
    @Param("projectId") projectId: string,
    @Param("blueprintId") blueprintId: string,
    @Param("cardId") cardId: string,
    @Req() request: any,
    @Body() cardData: UpdateBlueprintCardDto,
  ): Promise<ApiResponse<BlueprintCard>> {
    const userId = request.user.id;
    await this.projectsService.verifyProjectOwnership(
      projectId,
      request.user.id,
    );

    const updatedCard = await this.blueprintCardsService.updateBlueprintCard(
      cardId,
      userId,
      blueprintId,
      cardData,
    );

    return {
      success: true,
      data: updatedCard,
      message: "Blueprint card updated successfully",
    };
  }

  @Delete(":cardId")
  async deleteBlueprintCard(
    @Param("projectId") projectId: string,
    @Param("blueprintId") blueprintId: string,
    @Param("cardId") cardId: string,
    @Req() request: any,
  ): Promise<ApiResponse<void>> {
    const userId = request.user.id;
    await this.projectsService.verifyProjectOwnership(
      projectId,
      request.user.id,
    );
    await this.blueprintCardsService.deleteBlueprintCard(
      cardId,
      userId,
      blueprintId,
    );

    return {
      success: true,
      message: "Blueprint card deleted successfully",
    };
  }
}
