import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsBoolean,
} from "class-validator";
import {
  CreateProjectDto as ICreateProjectDto,
  UpdateProjectDto as IUpdateProjectDto,
} from "@detective-quill/shared-types";

export class CreateProjectDto implements ICreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectDto implements IUpdateProjectDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
