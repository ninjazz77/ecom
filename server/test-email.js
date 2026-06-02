/**
 * SMTP Email Test Script
 *
 * This script tests your SMTP configuration by sending a test email.
 * Run it to verify your email settings are correct before deploying.
 *
 * Usage:
 *   node test-email.js your-test-email@gmail.com
 *
 * Or edit the TEST_RECIPIENT below and run:
 *   node test-email.js
 */

import "dotenv/config";
import nodemailer from "nodemailer";

// Change this to your email address for testing
const TEST_RECIPIENT = process.argv[2] || "your-email@example.com";

console.log("=".repeat(60));
console.log("FLUX EMAIL CONFIGURATION TEST");
console.log("=".repeat(60));
console.log();

// Step 1: Check environment variables
console.log("STEP 1: Checking Environment Variables");
console.log("-".repeat(60));

const checkEnvVar = (name, value) => {
  const exists = value ? "✅" : "❌";
  const display = value
    ? name.includes("PASS") || name.includes("SECRET")
      ? "***configured***"
      : value.length > 30
        ? `${value.substring(0, 27)}...`
        : value
    : "NOT SET";
  console.log(`${exists} ${name.padEnd(25)} = ${display}`);
  return !!value;
};

const hasUser = checkEnvVar("SMTP_USER", process.env.SMTP_USER);
const hasPass = checkEnvVar("SMTP_PASS", process.env.SMTP_PASS);
checkEnvVar("EMAIL_FROM", process.env.EMAIL_FROM);
checkEnvVar("EMAIL_FROM_NAME", process.env.EMAIL_FROM_NAME);
checkEnvVar("SMTP_HOST", process.env.SMTP_HOST);
checkEnvVar("SMTP_PORT", process.env.SMTP_PORT);
checkEnvVar("SMTP_SERVICE", process.env.SMTP_SERVICE);

console.log();

if (!hasUser || !hasPass) {
  console.error("❌ ERROR: SMTP_USER and SMTP_PASS are required!");
  console.error("Please set these in your .env file:");
  console.error("  SMTP_USER=your-email@gmail.com");
  console.error("  SMTP_PASS=your-gmail-app-password");
  process.exit(1);
}

// Step 2: Create transporter
console.log("STEP 2: Creating Email Transporter");
console.log("-".repeat(60));

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const host = process.env.SMTP_HOST;
const service = process.env.SMTP_SERVICE || "gmail";
const port = Number(process.env.SMTP_PORT) || 587;
const secure = process.env.SMTP_SECURE === "true" || port === 465;

const config = host
  ? {
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    }
  : {
      service,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    };

console.log("Configuration:", {
  ...config,
  auth: { user, pass: "***" },
});

let transporter;
try {
  transporter = nodemailer.createTransport(config);
  console.log("✅ Transporter created successfully");
} catch (error) {
  console.error("❌ Failed to create transporter:", error.message);
  process.exit(1);
}

console.log();

// Step 3: Verify connection
console.log("STEP 3: Verifying SMTP Connection");
console.log("-".repeat(60));

try {
  await transporter.verify();
  console.log("✅ SMTP connection verified successfully!");
  console.log("   Your email server is reachable and credentials are valid.");
} catch (error) {
  console.error("❌ SMTP verification failed:", error.message);
  console.error();
  console.error("Common issues:");
  console.error("  • EAUTH: Wrong email or password");
  console.error(
    "  • ESOCKET: Cannot connect to server (firewall/network issue)",
  );
  console.error("  • ETIMEDOUT: Server not responding");
  console.error();
  console.error("For Gmail:");
  console.error("  1. Enable 2-Factor Authentication");
  console.error(
    "  2. Generate App Password: https://myaccount.google.com/apppasswords",
  );
  console.error("  3. Use App Password (not regular password) in SMTP_PASS");
  console.error();
  process.exit(1);
}

console.log();

// Step 4: Send test email
console.log("STEP 4: Sending Test Email");
console.log("-".repeat(60));
console.log(`Recipient: ${TEST_RECIPIENT}`);
console.log();

if (TEST_RECIPIENT === "your-email@example.com") {
  console.log("⚠️  WARNING: Using default test email address.");
  console.log("   Please provide a real email address:");
  console.log("   node test-email.js your-email@gmail.com");
  console.log();
  console.log("Attempting to send anyway (will likely fail)...");
  console.log();
}

const fromAddress = process.env.EMAIL_FROM || user;
const fromName = process.env.EMAIL_FROM_NAME || "Flux";
const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

const mailOptions = {
  from,
  to: TEST_RECIPIENT,
  subject: "✅ Flux Email Test - Success!",
  text: `
This is a test email from your Flux application.

If you received this email, your SMTP configuration is working correctly!

Configuration used:
- Service: ${service || host}
- From: ${from}
- Sent at: ${new Date().toISOString()}

You can now deploy your application with confidence.
  `.trim(),
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #22c55e; margin-top: 0;">✅ Email Test Successful!</h2>
        <p>This is a test email from your <strong>Flux</strong> application.</p>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Service:</strong> ${service || host}</p>
          <p style="margin: 5px 0;"><strong>From:</strong> ${from}</p>
          <p style="margin: 5px 0;"><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        </div>
        <p>You can now deploy your application with confidence.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated test email. No reply needed.
        </p>
      </div>
    </div>
  `,
};

try {
  console.log("Sending email...");
  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Test email sent successfully!");
  console.log();
  console.log("Details:");
  console.log("  Message ID:", info.messageId);
  console.log("  Response:", info.response);
  if (info.accepted && info.accepted.length > 0) {
    console.log("  Accepted:", info.accepted.join(", "));
  }
  if (info.rejected && info.rejected.length > 0) {
    console.log("  Rejected:", info.rejected.join(", "));
  }
  console.log();
  console.log("📧 Check your inbox at:", TEST_RECIPIENT);
  console.log("   (Check spam folder if you don't see it)");
  console.log();
  console.log("=".repeat(60));
  console.log("✅ ALL TESTS PASSED - EMAIL CONFIGURATION IS WORKING!");
  console.log("=".repeat(60));
} catch (error) {
  console.error("❌ Failed to send test email:", error.message);
  console.error();
  console.error("Error details:");
  console.error("  Code:", error.code);
  console.error("  Command:", error.command);
  console.error();
  console.error("This means the connection works but sending failed.");
  console.error("Possible issues:");
  console.error("  • Recipient email address is invalid");
  console.error("  • Daily sending limit reached");
  console.error("  • Email flagged as spam by server");
  console.error();
  process.exit(1);
}
