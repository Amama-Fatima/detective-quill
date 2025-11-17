import {
  IsString,
  IsNotEmpty,
  IsIn,
} from "class-validator";
import {
  CreateBlueprintDto as ICreateBlueprintDto,
  UpdateBlueprintDto as IUpdateBlueprintDto,
  type BlueprintType,
} from "@detective-quill/shared-types";

export class CreateBlueprintDto implements ICreateBlueprintDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["character", "timeline", "other"])
  type: BlueprintType;
}

export class UpdateBlueprintDto implements IUpdateBlueprintDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
