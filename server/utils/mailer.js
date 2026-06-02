import nodemailer from "nodemailer";

const trimValue = (value) => String(value || "").trim();

const normalizePassword = (value) => trimValue(value).replace(/\s+/g, "");

const getMailUser = () =>
  trimValue(process.env.SMTP_USER || process.env.MAIL_USER || "");

const getMailPassword = () =>
  normalizePassword(process.env.SMTP_PASS || process.env.MAIL_PASS || "");

const getMailFrom = () => {
  const fromAddress = trimValue(
    process.env.EMAIL_FROM || process.env.MAIL_FROM || getMailUser(),
  );
  const fromName = trimValue(
    process.env.EMAIL_FROM_NAME || process.env.MAIL_FROM_NAME || "Ekart",
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

  if (!user || !pass) {
    throw new Error(
      "Email service is not configured. Set SMTP_USER/SMTP_PASS or MAIL_USER/MAIL_PASS.",
    );
  }

  if (host) {
    return {
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
    };
  }

  return {
    service: service || "gmail",
    auth: { user, pass },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
  };
};

export const createMailTransport = () =>
  nodemailer.createTransport(getTransportOptions());

export const getFromAddress = () => getMailFrom();
