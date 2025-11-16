import {
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { buildInviteEmail } from "../utils/invite-email";
import { WorkerInvitationsService } from "../invitations/worker-invitations.service";

@Injectable()
export class WorkerEmailService implements OnModuleInit {
  private enabled = true;
  private transporter;
  constructor(
    private workerInvitationsService: WorkerInvitationsService,
    private configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get("EMAIL_USER"),
        pass: this.configService.get("EMAIL_PASS"),
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      console.log("Email transporter verified on module init");
    } catch (err) {
      this.enabled = false;
      console.error("Email transporter verification failed", err);
    }
  }

  async sendEmail(
    inviteLink:string,
    toEmail: string,
    inviterName: string,
    projectTitle: string,
    inviteCode: string,
    projectId:string
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log("Email service is disabled. Skipping email to", toEmail);
      return false;
    }
    try {
      const mailOptions = buildInviteEmail({
        inviteLink,
        toEmail,
        inviterName,
        projectTitle,
        from: this.configService.get("EMAIL_USER")!,
      });
      await this.transporter.sendMail(mailOptions);
      await this.workerInvitationsService.addInvitation(
        projectId,
        inviteCode,
        toEmail,
      );
      return true;
    } catch (err) {
      console.error("Error sending email:", err);
      return false;
    }
  }
}
