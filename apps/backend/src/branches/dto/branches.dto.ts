import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from "class-validator";

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;

  @IsUUID()
  @IsNotEmpty()
  parent_commit_id!: string;
}

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;

  @IsUUID()
  @IsOptional()
  head_commit_id?: string;
}
