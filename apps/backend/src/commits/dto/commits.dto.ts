import { IsString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateCommitDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  // @IsUUID()
  // @IsOptional()
  // parent_commit_id?: string;
}
