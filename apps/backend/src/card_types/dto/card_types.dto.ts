import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsBoolean,
  IsOptional,
} from "class-validator";

import {
  CreateCardTypeDto as ICreateCardTypeDto,
  UpdateCardTypeDto as IUpdateCardTypeDto,
  type BlueprintType,
} from "@detective-quill/shared-types";

export class CreateCardTypeDto implements ICreateCardTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsIn(["text", "image", "video"])
  blueprint_type: BlueprintType;
}

export class UpdateCardTypeDto implements IUpdateCardTypeDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  blueprint_type: BlueprintType;
}

// export class GetCardTypesDto {
//   @IsString()
//   @IsNotEmpty()
//   blueprint_type: BlueprintType;
// }
