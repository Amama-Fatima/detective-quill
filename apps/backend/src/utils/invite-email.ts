import type { SendMailOptions } from "nodemailer";

export interface InviteEmailParams {
  inviteLink: string;
  toEmail: string;
  inviterName: string;
  projectTitle: string;
  from: string;
}


export function buildInviteEmail({
  inviteLink,
  toEmail,
  inviterName,
  projectTitle,
  from
}: InviteEmailParams): SendMailOptions {
  return {
    from,
    to: toEmail,
    subject: `You're invited to join the project: ${projectTitle}`,
    html: `<p>Hi,</p>
           <p>${inviterName} has invited you to join the project: ${projectTitle}.</p>
           <p>Click <a href="${inviteLink}">here</a> to accept the invitation.</p>`,
  };
}
