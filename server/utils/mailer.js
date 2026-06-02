import nodemailer from "nodemailer";

const trimValue = (value) => String(value || "").trim();

const normalizePassword = (value) => trimValue(value).replace(/\s+/g, "");

const getMailUser = () =>
  trimValue(
    process.env.SMTP_USER ||
      process.env.MAIL_USER ||
      process.env.SMTP_USERNAME ||
      process.env.MAIL_USERNAME ||
      process.env.EMAIL_USERNAME ||
      process.env.SMTP_EMAIL ||
      process.env.MAIL_EMAIL ||
      "",
  );

const getMailPassword = () =>
  normalizePassword(
    process.env.SMTP_PASS ||
      process.env.MAIL_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.MAIL_PASSWORD ||
      "",
  );

const getMailFrom = () => {
  const fromAddress = trimValue(
    process.env.EMAIL_FROM ||
      process.env.MAIL_FROM ||
      process.env.SMTP_FROM ||
      process.env.MAIL_FROM_ADDRESS ||
      process.env.SMTP_EMAIL ||
      process.env.MAIL_EMAIL ||
      getMailUser(),
  );
  const fromName = trimValue(
    process.env.EMAIL_FROM_NAME ||
      process.env.MAIL_FROM_NAME ||
      process.env.SMTP_FROM_NAME ||
      process.env.MAIL_FROM_NAME ||
      "Ekart",
  );

  if (!fromAddress) {
    return "";
  }

  return fromName ? `${fromName} <${fromAddress}>` : fromAddress;
};

const getTransportOptions = () => {
  const user = getMailUser();
  const pass = getMailPassword();
  const host = trimValue(process.env.SMTP_HOST || process.env.MAIL_HOST || "");
  const service = trimValue(
    process.env.MAIL_SERVICE || process.env.SMTP_SERVICE || "",
  );
  const port =
    Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 0) || 587;
  const secureEnv = process.env.SMTP_SECURE;
  const secure =
    secureEnv === undefined ? port === 465 : secureEnv.toLowerCase() === "true";

  console.log("=== SMTP CONFIGURATION ===");
  console.log("SMTP_USER:", user ? `${user.substring(0, 5)}***@***` : "MISSING");
  console.log("SMTP_PASS:", pass ? "***configured***" : "MISSING");
  console.log("SMTP_HOST:", host || "(not set, using service)");
  console.log("SMTP_SERVICE:", service || "gmail (default)");
  console.log("SMTP_PORT:", port);
  console.log("SMTP_SECURE:", secure);

  if (!user || !pass) {
    const error = new Error(
      "Email service is not configured. Set SMTP_USER/SMTP_PASS, MAIL_USER/MAIL_PASS, or equivalent mail credentials.",
    );
    console.error("❌ SMTP CONFIGURATION ERROR:", error.message);
    throw error;
  }

  const config = host
    ? {
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
        logger: false, // Set to true for even more debugging
        debug: false,  // Set to true for SMTP protocol debugging
      }
    : {
        service: service || "gmail",
        auth: { user, pass },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
        logger: false,
        debug: false,
      };

  console.log("Transport config:", {
    ...config,
    auth: { user: user ? `${user.substring(0, 5)}***` : "MISSING", pass: "***" },
  });
  console.log("=== END SMTP CONFIGURATION ===");

  return config;
};

export const createMailTransport = () =>
  nodemailer.createTransport(getTransportOptions());

export const getFromAddress = () => getMailFrom();
