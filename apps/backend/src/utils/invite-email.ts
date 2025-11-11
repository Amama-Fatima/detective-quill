import type { SendMailOptions } from "nodemailer";

export interface InviteEmailParams {
  inviteLink: string;
  toEmail: string;
  inviterName: string;
  projectTitle: string;
}


export function buildInviteEmail({
  inviteLink,
  toEmail,
  inviterName,
  projectTitle,
}: InviteEmailParams): SendMailOptions {
  const from = `${process.env.EMAIL_USER}`;
  return {
    from,
    to: toEmail,
    subject: `You're invited to join the project: ${projectTitle}`,
    html: `<p>Hi,</p>
           <p>${inviterName} has invited you to join the project: ${projectTitle}.</p>
           <p>Click <a href="${inviteLink}">here</a> to accept the invitation.</p>`,
  };
}
