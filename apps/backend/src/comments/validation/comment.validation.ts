// src/comments/validation/comment.validation.ts

import {
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  IsNotEmpty,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import {
  CreateCommentDto as ICreateCommentDto,
  UpdateCommentDto as IUpdateCommentDto,
} from "@detective-quill/shared-types";

export class CreateCommentDto implements ICreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  project_id: string;

  @IsUUID()
  @IsNotEmpty()
  fs_node_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  block_id: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  start_offset: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  end_offset: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Transform(({ value }) => value?.trim())
  content: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  selected_text?: string;
}

export class UpdateCommentDto implements IUpdateCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => value?.trim())
  content?: string;

  @IsOptional()
  @IsBoolean()
  is_resolved?: boolean;
}
