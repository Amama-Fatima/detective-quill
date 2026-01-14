import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { EmailService } from "./email.service";
import { type EmailSendingApiRequestDto } from "./dto/email.dto";
import { ApiResponse } from "@detective-quill/shared-types";

@Controller("email")
@UseGuards(AuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {
    console.log("EmailController initialized");
  }  

  @Post("test")
testBody(@Body() body: any) {
  console.log("TEST BODY:", body);
  return body;
}


  @Post("send-invite")
  async sendInviteEmails(
    @Body(new ValidationPipe({ whitelist: false })) body: any,
    @Request() req
  ): Promise<ApiResponse<void>> {
    try {
      console.log("sendInviteEmails called with body:", body.emails);
      
      // get all the values from body
      const { projectId, emails, inviterName } = body;
      await this.emailService.inviteProjectMember(
        projectId,
        emails,
        req.user.id,
        inviterName
      );
      return { success: true, message: "Invitations sent successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }
}
