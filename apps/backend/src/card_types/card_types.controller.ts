import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CardTypesService } from "./card_types.service";
import { AuthGuard } from "src/auth/auth.guard";
import {
  type CreateCardTypeDto,
  GetCardTypeResponse,
  GetCardTypesResponse,
  type UpdateCardTypeDto,
} from "@detective-quill/shared-types";

@Controller("card-types")
@UseGuards(AuthGuard)
export class CardTypesController {
  constructor(private readonly cardTypesService: CardTypesService) {}

  @Get()
  async getUserCardTypes(@Req() request: any): Promise<GetCardTypesResponse> {
    const userId = request.user.id;
    const access_token = request.accessToken;
    try {
      const cardTypes = await this.cardTypesService.getUserCardTypes(
        userId,
        access_token
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

  @Post()
  async createCardType(
    @Req() request: any,
    @Body() createCardTypeDto: CreateCardTypeDto
  ): Promise<GetCardTypeResponse> {
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
        data: null,
        message: "Error creating card type: " + error.message,
      };
    }
  }

  @Put(":id")
  async updateCardType(
    @Req() request: any,
    @Body() updateCardTypeDto: UpdateCardTypeDto
  ): Promise<GetCardTypeResponse> {
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
        data: null,
        message: "Error updating card type: " + error.message,
      };
    }
  }
}
