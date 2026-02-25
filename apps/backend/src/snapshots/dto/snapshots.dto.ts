import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from "class-validator";

export class CreateSnapshotDto {
  @IsUUID()
  @IsNotEmpty()
  commit_id: string;

  @IsUUID()
  @IsNotEmpty()
  fs_node_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  node_type: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string | null;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  content?: string | null;

  @IsNumber()
  @IsOptional()
  word_count?: number;

  @IsString()
  @IsOptional()
  file_extension?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number | null;

  @IsNumber()
  @IsOptional()
  depth?: number;
}
