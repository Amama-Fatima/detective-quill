import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
} from "class-validator";
import {
  CreateFsNodeDto as ICreateFsNodeDto,
  UpdateFsNodeDto as IUpdateFsNodeDto,
} from "@detective-quill/shared-types";

export class CreateFsNodeDto implements ICreateFsNodeDto {
  @IsUUID()
  @IsNotEmpty()
  project_id: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(["folder", "file"])
  node_type: "folder" | "file";

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  file_extension?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class UpdateFsNodeDto implements IUpdateFsNodeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}
