const dns = require("node:dns");

dns.setDefaultResultOrder("ipv4first");

let nodemailer;

try {
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

function emailConfig() {
  return {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
    port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
    secure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || "false") === "true",
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER
  };
}

function smtpReady() {
  const config = emailConfig();
  return Boolean(config.host && config.user && config.pass && nodemailer);
}

function ensureOtpEmailReady() {
  if (process.env.NODE_ENV === "production" && !smtpReady()) {
    throw new Error("Email OTP is not configured. Add SMTP_* or EMAIL_* environment variables.");
  }
}

function createTransporter() {
  const config = emailConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function emailDeliveryError(error) {
  const wrapped = new Error(`OTP email could not be sent: ${error.message}`);
  wrapped.statusCode = 502;
  return wrapped;
}

async function sendOtpEmail({ to, code, purpose }) {
  const label = purpose === "register" ? "SmartMeal registration" : "SmartMeal password reset";
  const resetLink =
    purpose === "password_reset" && process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/reset-password?email=${encodeURIComponent(to)}&otp=${encodeURIComponent(code)}`
      : null;

  const text = resetLink
    ? `Your ${label} OTP is ${code}. You can also open this reset link: ${resetLink}. This code expires in 10 minutes.`
    : `Your ${label} OTP is ${code}. This code expires in 10 minutes.`;

  if (!smtpReady()) {
    console.log(`[SmartMeal OTP] ${to} ${purpose}: ${code}`);
    return { delivered: false, devOtp: code };
  }

  const config = emailConfig();
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject: label,
      text
    });
  } catch (error) {
    throw emailDeliveryError(error);
  }

  return { delivered: true };
}

module.exports = {
  ensureOtpEmailReady,
  sendOtpEmail
};
