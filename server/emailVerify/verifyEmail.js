import "dotenv/config";
import { createMailTransport, getFromAddress } from "../utils/mailer.js";

const normalizeBaseUrl = (value) =>
  String(value || "")
    .trim()
    .replace(/\/$/, "");

export const verifyEmail = async (token, email, frontendBaseUrl) => {
  const resolvedFrontendBaseUrl =
    normalizeBaseUrl(frontendBaseUrl) ||
    normalizeBaseUrl(process.env.CLIENT_URL) ||
    normalizeBaseUrl(process.env.FRONTEND_URL) ||
    "http://localhost:5173";
  const verifyUrl = `${resolvedFrontendBaseUrl}/verify/${token}`;

  const fromAddress = getFromAddress();
  if (!fromAddress) {
    throw new Error(
      "Email sender address is missing. Set EMAIL_FROM or MAIL_FROM.",
    );
  }

  const transporter = createMailTransport();

  const mailSubject = "Verify your Ekart account";
  const mailHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Verify your email address</h2>
      <p style="margin: 0 0 16px;">Thanks for registering with Ekart. Click the button below to verify your account.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 600;">
          Verify Email
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin: 0; font-size: 14px; word-break: break-all; color: #334155;">${verifyUrl}</p>
      <p style="margin: 24px 0 0; font-size: 13px; color: #64748b;">This link expires in 10 minutes.</p>
    </div>
  `;
  const mailText = [
    "Verify your Ekart account",
    "",
    "Thanks for registering with Ekart. Use the link below to verify your account:",
    verifyUrl,
    "",
    "This link expires in 10 minutes.",
  ].join("\n");

  const mailConfigurations = {
    from: fromAddress,
    replyTo: fromAddress,
    to: email,
    subject: mailSubject,
    text: mailText,
    html: mailHtml,
  };
  const info = await transporter.sendMail(mailConfigurations);

  if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
    throw new Error(
      `Verification email was rejected for: ${info.rejected.join(", ")}`,
    );
  }

  return { success: true, info };
};
