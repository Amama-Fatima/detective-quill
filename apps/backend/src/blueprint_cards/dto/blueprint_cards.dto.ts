import {
  CreateBlueprintCardDto as ICreateBlueprintCardDto,
  UpdateBlueprintCardDto as IUpdateBlueprintCardDto,
} from "@detective-quill/shared-types";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEmpty
} from 'class-validator';


export class CreateBlueprintCardDto implements ICreateBlueprintCardDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    card_type_id: string;

    @IsNumber()
    @IsNotEmpty()
    position_x: number;

    @IsNumber()
    @IsNotEmpty()
    position_y: number;

    @IsString()
    @IsNotEmpty()
    card_type_title: string;
}

export class UpdateBlueprintCardDto implements IUpdateBlueprintCardDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsNumber()
    @IsOptional()
    position_x?: number;

    @IsNumber()
    @IsOptional()
    position_y?: number;
}