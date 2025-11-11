import { IsString, IsNotEmpty, IsIn } from "class-validator";

import { EmailSendingApiRequestDto as IEmailSendingApiRequestDto } from "@detective-quill/shared-types";

export class EmailSendingApiRequestDto implements IEmailSendingApiRequestDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsNotEmpty({ each: true })
  emails: string[];

  @IsString()
  @IsNotEmpty()
  inviterName: string;

  @IsString()
  @IsNotEmpty()
  inviterEmail: string;
  
  @IsString()
  @IsNotEmpty()
  projectTitle: string;
}
