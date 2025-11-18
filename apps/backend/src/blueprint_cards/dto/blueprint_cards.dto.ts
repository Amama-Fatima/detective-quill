import {
  CreateBlueprintCardDto as ICreateBlueprintCardDto,
  UpdateBlueprintCardDto as IUpdateBlueprintCardDto,
} from "@detective-quill/shared-types";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';


export class CreateBlueprintCardDto implements ICreateBlueprintCardDto {
    @IsString()
    @IsOptional()
    content: string;

    @IsString()
    @IsOptional()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    position_x: number;

    @IsNumber()
    @IsNotEmpty()
    position_y: number;
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