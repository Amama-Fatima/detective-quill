import * as nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVER,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function verifyTransporter(): Promise<void> {
  // allow caller to handle failure (don't swallow)
  await transporter.verify();
  console.log("Email transporter is ready to send messages");
}