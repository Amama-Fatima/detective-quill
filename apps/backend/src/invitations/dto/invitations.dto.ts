import { IsNotEmpty, IsUUID } from "class-validator";

export class DeleteInvitationDto {
  @IsUUID()
  projectId: string;
}

export class RespondToInvitationDto {
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  response: "accept" | "reject";
}
