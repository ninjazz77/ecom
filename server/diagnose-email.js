/**
 * Email Configuration Diagnostic Tool
 *
 * This script diagnoses email configuration issues and provides specific fixes.
 *
 * Usage: node diagnose-email.js
 */

import "dotenv/config";

console.log("=".repeat(70));
console.log("FLUX EMAIL DIAGNOSTIC TOOL");
console.log("=".repeat(70));
console.log();

let issuesFound = 0;
let criticalIssues = 0;

// Helper functions
const printSection = (title) => {
  console.log();
  console.log(title);
  console.log("-".repeat(70));
};

const checkCritical = (condition, name, value, fix) => {
  if (!condition) {
    console.log(`❌ CRITICAL: ${name}`);
    console.log(`   Current: ${value || "NOT SET"}`);
    console.log(`   Fix: ${fix}`);
    criticalIssues++;
    issuesFound++;
    return false;
  } else {
    console.log(`✅ ${name}`);
    return true;
  }
};

const checkWarning = (condition, name, issue, suggestion) => {
  if (!condition) {
    console.log(`⚠️  WARNING: ${name}`);
    console.log(`   Issue: ${issue}`);
    console.log(`   Suggestion: ${suggestion}`);
    issuesFound++;
    return false;
  } else {
    console.log(`✅ ${name}`);
    return true;
  }
};

// Diagnostic checks
printSection("1. CRITICAL ENVIRONMENT VARIABLES");

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;

checkCritical(
  smtpUser,
  "SMTP_USER",
  smtpUser,
  "Set SMTP_USER=your-email@gmail.com in .env",
);

checkCritical(
  smtpPass,
  "SMTP_PASS",
  smtpPass ? "***configured***" : "NOT SET",
  "Set SMTP_PASS=your-gmail-app-password in .env",
);

checkCritical(
  emailFrom,
  "EMAIL_FROM",
  emailFrom,
  "Set EMAIL_FROM=your-email@gmail.com in .env",
);

printSection("2. EMAIL FORMAT VALIDATION");

if (smtpUser) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  checkWarning(
    emailRegex.test(smtpUser),
    "SMTP_USER format",
    "Email format appears invalid",
    "Use format: user@domain.com",
  );

  checkWarning(
    smtpUser === emailFrom,
    "Email consistency",
    "SMTP_USER and EMAIL_FROM don't match",
    "Set both to the same email address",
  );
}

printSection("3. GMAIL APP PASSWORD FORMAT");

if (smtpPass) {
  const hasSpaces = smtpPass.includes(" ");
  checkWarning(
    !hasSpaces,
    "Password format",
    "Password contains spaces",
    "Remove all spaces: 'abcd abcd abcd abcd' → 'abcdabcdabcdabcd'",
  );

  const length = smtpPass.replace(/\s/g, "").length;
  checkWarning(
    length === 16,
    "Password length",
    `Password length is ${length} (should be 16)`,
    "Gmail App Passwords are always 16 characters",
  );

  // Check if it looks like the invalid password from testing
  if (smtpPass.replace(/\s/g, "") === "yyqwooambqcjzdhu") {
    console.log("⚠️  DETECTED: This is the INVALID password from testing");
    console.log("   This password was rejected by Gmail");
    console.log(
      "   Generate a new one at: https://myaccount.google.com/apppasswords",
    );
    issuesFound++;
  }
}

printSection("4. SMTP SERVICE CONFIGURATION");

const smtpService = process.env.SMTP_SERVICE || process.env.MAIL_SERVICE;
const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
const smtpPort = process.env.SMTP_PORT || process.env.MAIL_PORT || "587";

if (smtpHost) {
  console.log(`✅ Using custom SMTP host: ${smtpHost}`);
  checkWarning(
    smtpPort,
    "SMTP_PORT",
    "Using custom host but port not specified",
    "Set SMTP_PORT=587 (or 465 for SSL)",
  );
} else {
  const service = smtpService || "gmail";
  console.log(`✅ Using SMTP service: ${service}`);

  if (service.toLowerCase() === "gmail" && smtpUser) {
    const isGmailAddress = smtpUser.toLowerCase().endsWith("@gmail.com");
    checkWarning(
      isGmailAddress,
      "Gmail service match",
      "Using gmail service but email is not @gmail.com",
      "Either use @gmail.com email or set SMTP_HOST for custom domain",
    );
  }
}

printSection("5. OTHER CONFIGURATIONS");

const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
checkWarning(
  clientUrl,
  "CLIENT_URL",
  "Frontend URL not set",
  "Set CLIENT_URL=https://your-vercel-app.vercel.app",
);

const nodeEnv = process.env.NODE_ENV;
console.log(`ℹ️  NODE_ENV: ${nodeEnv || "development (default)"}`);

printSection("6. COMMON GMAIL ISSUES");

console.log();
console.log("Gmail requires:");
console.log("  1. ✅ 2-Factor Authentication ENABLED");
console.log("  2. ✅ App Password GENERATED");
console.log("  3. ✅ App Password WITHOUT SPACES");
console.log();
console.log("Check your Gmail settings:");
console.log(
  "  • 2FA: https://myaccount.google.com/signinoptions/two-step-verification",
);
console.log("  • App Passwords: https://myaccount.google.com/apppasswords");
console.log();

if (smtpUser && smtpUser.includes("@gmail.com")) {
  console.log(`📧 Your Gmail account: ${smtpUser}`);
  console.log();
  console.log("To generate a new App Password:");
  console.log("  1. Go to: https://myaccount.google.com/apppasswords");
  console.log("  2. Select app: Mail");
  console.log("  3. Select device: Other (Custom name)");
  console.log("  4. Name: Flux Backend");
  console.log("  5. Click GENERATE");
  console.log("  6. Copy the 16-character password");
  console.log("  7. Remove all spaces");
  console.log("  8. Update SMTP_PASS in .env");
  console.log();
}

printSection("7. DIAGNOSTIC SUMMARY");

console.log();
if (criticalIssues > 0) {
  console.log(`❌ ${criticalIssues} CRITICAL ISSUE(S) FOUND`);
  console.log("   Your email system WILL NOT WORK until these are fixed.");
  console.log();
}

if (issuesFound === 0) {
  console.log("✅ NO ISSUES FOUND");
  console.log();
  console.log("Your configuration looks good!");
  console.log(
    "If emails still fail, run: node test-email.js your-email@gmail.com",
  );
  console.log();
} else if (criticalIssues === 0) {
  console.log(`⚠️  ${issuesFound} WARNING(S) FOUND`);
  console.log(
    "   Your email system might work, but there are potential issues.",
  );
  console.log();
} else {
  console.log(`Total issues: ${issuesFound} (${criticalIssues} critical)`);
  console.log();
}

printSection("8. NEXT STEPS");

console.log();
if (criticalIssues > 0) {
  console.log("1. Fix all CRITICAL issues above");
  console.log("2. Run this diagnostic again: node diagnose-email.js");
  console.log("3. Test with: node test-email.js your-email@gmail.com");
  console.log("4. Deploy to Render with updated environment variables");
} else if (issuesFound > 0) {
  console.log("1. Review and fix warnings above (optional)");
  console.log("2. Test with: node test-email.js your-email@gmail.com");
  console.log("3. If test passes, deploy to Render");
} else {
  console.log("1. Test with: node test-email.js your-email@gmail.com");
  console.log("2. If test passes, your local setup is perfect!");
  console.log("3. Update Render environment variables to match");
  console.log("4. Deploy and test registration on production");
}

console.log();
console.log("=".repeat(70));
console.log("DIAGNOSTIC COMPLETE");
console.log("=".repeat(70));
console.log();

process.exit(issuesFound > 0 ? 1 : 0);
