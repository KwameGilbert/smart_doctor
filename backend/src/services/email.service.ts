import nodemailer from "nodemailer";

// Initialize SMTP transporter using environment configurations
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not configured in environment variables.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

/**
 * Send an email using the SMTP transporter.
 * @param to Recipient email address.
 * @param subject Email subject line.
 * @param html HTML formatted body content.
 * @param text Plaintext fallback content.
 */
export const sendEmail = async (to: string, subject: string, html: string, text?: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"Smart Doctor" <noreply@smartdoctor.com>';

    await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html
    });

    return true;
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message || error);
    return false;
  }
};
