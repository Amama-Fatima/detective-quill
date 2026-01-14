import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsEmail } from "class-validator";

export class EmailSendingApiRequestDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsString()
  @IsNotEmpty()
  inviterName: string;
}
