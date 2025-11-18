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
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Delete(":id")
  async deleteBlueprintById(@Req() request: any): Promise<ApiResponse<void>> {
    const userId = request.user.id;
    const blueprintId = request.params.id;

    try {
      await this.blueprintsService.deleteBlueprint(userId, blueprintId);
      return {
        success: true,
        message: "Blueprint deleted successfully",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }
}
