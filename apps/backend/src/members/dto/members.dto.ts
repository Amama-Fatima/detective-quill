import {
  IsString,
  IsNotEmpty,
  IsIn,
} from "class-validator";
import type {
  AddMemberDto as IAddMemberDto,
} from "@detective-quill/shared-types";

export class AddMemberDto implements IAddMemberDto {
    @IsString()
    @IsNotEmpty()
    email: string;
}