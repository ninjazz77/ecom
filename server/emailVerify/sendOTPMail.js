import "dotenv/config";
import { createMailTransport, getFromAddress } from "../utils/mailer.js";

export const SendOTPMail = async (otp, email) => {
  try {
    if (!email) {
      console.error("SendOTPMail ERROR: Email is undefined!");
      return { success: false, error: "Recipient email is missing" };
    }

    const fromAddress = getFromAddress();
    if (!fromAddress) {
      throw new Error(
        "Email sender address is missing. Set EMAIL_FROM or MAIL_FROM.",
      );
    }

    const transporter = createMailTransport();

    const mailConfigurations = {
      from: fromAddress,
      replyTo: fromAddress,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`,
      text: `Your OTP for password reset is: ${otp}`,
    };

    const info = await transporter.sendMail(mailConfigurations);

    if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
      throw new Error(
        `OTP email was rejected for: ${info.rejected.join(", ")}`,
      );
    }

    return { success: true, info };
  } catch (error) {
    console.error("SendOTPMail FAILED:", error.message);
    return { success: false, error: error.message };
  }
};
