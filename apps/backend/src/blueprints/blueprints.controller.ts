import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlueprintsService } from "./blueprints.service";
import { ApiResponse, Blueprint } from "@detective-quill/shared-types";
import { CreateBlueprintDto, UpdateBlueprintDto } from "./dto/blueprints.dto";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("blueprints")
@UseGuards(AuthGuard)
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Post()
  async createBlueprint(
    @Body() createBlueprintDto: CreateBlueprintDto,
    @Req() request: any
  ): Promise<ApiResponse<Blueprint>> {
    const userId = request.user.id;

    try {
      const blueprint = await this.blueprintsService.createBlueprint(
        userId,
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
        message: "Error creating blueprint: " + error.message,
      };
    }
  }

  @Put(":id")
  async updateBlueprintById(
    @Req() request: any,
    @Body() updateBlueprintDto: UpdateBlueprintDto
  ): Promise<ApiResponse<Blueprint>> {
    const userId = request.user.id;
    const blueprintId = request.params.id;

    try {
      const blueprint = await this.blueprintsService.updatedBlueprint(
        userId,
        blueprintId,
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
        message: "Error updating blueprint: " + error.message,
      };
    }
  }

  @Delete(":id")
  async deleteBlueprintById(@Req() request: any): Promise<ApiResponse<void>> {
    const userId = request.user.id;
    const blueprintId = request.params.id;

    try {
      await this.blueprintsService.deleteBlueprint(
        userId,
        blueprintId,
      );
      return {
        success: true,
        message: "Blueprint deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting blueprint: " + error.message,
      };
    }
  }
}


  // @Get()
  // async getUserBlueprints(
  //   @Req() request: any
  // ): Promise<ApiResponse<Blueprint[]>> {
  //   const userId = request.user.id;
  //   const accessToken = request.accessToken;

  //   try {
  //     const blueprints = await this.blueprintsService.fetchUserBlueprints(
  //       userId,
  //       accessToken
  //     );

  //     return {
  //       success: true,
  //       data: blueprints ?? [],
  //       message: "Blueprints retrieved successfully",
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       data: [],
  //       message: "Error retrieving blueprints: " + error.message,
  //     };
  //   }
  // }

  // @Get(":id")
  // async getUserBlueprintById(
  //   @Req() request: any
  // ): Promise<ApiResponse<Blueprint>> {
  //   const userId = request.user.id;
  //   const accessToken = request.accessToken;
  //   const blueprintId = request.params.id;

  //   try {
  //     const blueprint = await this.blueprintsService.fetchUserBlueprintById(
  //       userId,
  //       accessToken,
  //       blueprintId
  //     );

  //     return {
  //       success: true,
  //       data: blueprint,
  //       message: "Blueprint retrieved successfully",
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Error retrieving blueprint by ID: " + error.message,
  //     };
  //   }
  // }
