import "dotenv/config";
import { createMailTransport, getFromAddress } from "../utils/mailer.js";

const normalizeBaseUrl = (value) =>
  String(value || "")
    .trim()
    .replace(/\/$/, "");

export const verifyEmail = async (token, email, frontendBaseUrl) => {
  try {
    console.log("=== VERIFY EMAIL ATTEMPT ===");
    console.log("Token:", token ? `${token.substring(0, 20)}...` : "MISSING");
    console.log("Email:", email);
    console.log("Frontend Base URL:", frontendBaseUrl);

    const resolvedFrontendBaseUrl =
      normalizeBaseUrl(frontendBaseUrl) ||
      normalizeBaseUrl(process.env.CLIENT_URL) ||
      normalizeBaseUrl(process.env.FRONTEND_URL) ||
      "http://localhost:5173";

    console.log("Resolved Frontend URL:", resolvedFrontendBaseUrl);

    const verifyUrl = `${resolvedFrontendBaseUrl}/verify/${token}`;
    console.log("Verification URL:", verifyUrl);

    const fromAddress = getFromAddress();
    console.log("From Address:", fromAddress);

    if (!fromAddress) {
      const error = new Error(
        "Email sender address is missing. Set EMAIL_FROM, MAIL_FROM, SMTP_FROM, or SMTP_USER.",
      );
      console.error("❌ FROM ADDRESS ERROR:", error.message);
      throw error;
    }

    console.log("Creating mail transporter...");
    let transporter;
    try {
      transporter = createMailTransport();
      console.log("✅ Mail transporter created successfully");
    } catch (transportError) {
      console.error("❌ TRANSPORTER CREATION FAILED:", transportError.message);
      console.error("Full error:", transportError);
      throw new Error(
        `Failed to create email transporter: ${transportError.message}`,
      );
    }

    const mailSubject = "Verify your Flux account";
    const mailHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Verify your email address</h2>
        <p style="margin: 0 0 16px;">Thanks for registering with Flux. Click the button below to verify your account.</p>
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
      "Verify your Flux account",
      "",
      "Thanks for registering with Flux. Use the link below to verify your account:",
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

    console.log("Sending email...");
    console.log("Mail config:", {
      from: fromAddress,
      to: email,
      subject: mailSubject,
    });

    let info;
    try {
      info = await transporter.sendMail(mailConfigurations);
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", info.messageId);
      console.log("Response:", info.response);
    } catch (sendError) {
      console.error("❌ EMAIL SEND FAILED:", sendError.message);
      console.error("Error code:", sendError.code);
      console.error("Error command:", sendError.command);
      console.error("Full error:", sendError);

      // Provide more specific error messages
      if (sendError.code === "EAUTH") {
        throw new Error(
          "SMTP Authentication failed. Please check SMTP_USER and SMTP_PASS are correct.",
        );
      } else if (sendError.code === "ESOCKET") {
        throw new Error(
          "Cannot connect to SMTP server. Check your internet connection and SMTP_HOST/SMTP_PORT.",
        );
      } else if (sendError.code === "ETIMEDOUT") {
        throw new Error(
          "SMTP connection timed out. The email server may be unreachable.",
        );
      } else {
        throw new Error(`Email sending failed: ${sendError.message}`);
      }
    }

    if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
      const errorMsg = `Verification email was rejected for: ${info.rejected.join(", ")}`;
      console.error("❌ EMAIL REJECTED:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("=== VERIFY EMAIL SUCCESS ===");
    return { success: true, info };
  } catch (error) {
    console.error("=== VERIFY EMAIL FAILED ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
};
