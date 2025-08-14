import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlueprintsService } from "./blueprints.service";
import {
  GetBlueprintResponse,
  GetBlueprintsResponse,
  type CreateBlueprintDto,
} from "@detective-quill/shared-types";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("blueprints")
@UseGuards(AuthGuard)
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Get()
  async getUserBlueprints(@Req() request: any): Promise<GetBlueprintsResponse> {
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      const blueprints = await this.blueprintsService.fetchUserBlueprints(
        userId,
        accessToken
      );

      return {
        success: true,
        data: blueprints ?? [],
        message: "Blueprints retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Error retrieving blueprints: " + error.message,
      };
    }
  }

  @Get(":id")
  async getUserBlueprintById(
    @Req() request: any
  ): Promise<GetBlueprintResponse> {
    const userId = request.user.id;
    const accessToken = request.accessToken;
    const blueprintId = request.params.id;

    try {
      const blueprint = await this.blueprintsService.fetchUserBlueprintById(
        userId,
        accessToken,
        blueprintId
      );

      return {
        success: true,
        data: blueprint,
        message: "Blueprint retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Error retrieving blueprint by ID: " + error.message,
      };
    }
  }

  @Post()
  async createBlueprint(
    @Body() createBlueprintDto: CreateBlueprintDto,
    @Req() request: any
  ): Promise<GetBlueprintResponse> {
    const userId = request.user.id;
    const accessToken = request.accessToken;

    try {
      const blueprint = await this.blueprintsService.createBlueprint(
        userId,
        accessToken,
        createBlueprintDto
      );

      return {
        success: true,
        data: blueprint,
        message: "Blueprint created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Error creating blueprint: " + error.message,
      };
    }
  }

  @Put(":id")
  async updateBlueprint(@Req() request: any): Promise<GetBlueprintResponse> {
    const userId = request.user.id;
    const accessToken = request.accessToken;
    const blueprintId = request.params.id;
    const updateBlueprintDto = request.body;

    try {
      const blueprint = await this.blueprintsService.updatedBlueprint(
        userId,
        blueprintId,
        accessToken,
        updateBlueprintDto
      );
      if (!blueprint) {
        throw new NotFoundException(
          `Blueprint with ID ${blueprintId} not found`
        );
      }
      return {
        success: true,
        data: blueprint,
        message: "Blueprint updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Error updating blueprint: " + error.message,
      };
    }
  }
}
