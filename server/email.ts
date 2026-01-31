import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const config = getEmailConfig();
  
  if (!config) {
    console.log(`[Email] SMTP not configured. Would send to: ${options.to}`);
    console.log(`[Email] Subject: ${options.subject}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport(config);
    
    const fromName = process.env.SMTP_FROM_NAME || "ThemeVN";
    const fromEmail = process.env.SMTP_FROM_EMAIL || config.auth.user;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`[Email] Sent to: ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string, type: string): Promise<boolean> {
  const typeLabels: Record<string, string> = {
    login: "Đăng nhập",
    signup: "Đăng ký tài khoản", 
    recovery: "Khôi phục mật khẩu",
  };

  const subject = `[ThemeVN] Mã xác thực OTP - ${typeLabels[type] || type}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #333; font-size: 28px; margin: 0; }
        .logo span { color: #8B5CF6; }
        .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .message { color: #666; font-size: 16px; line-height: 1.6; text-align: center; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>Theme<span>VN</span></h1>
        </div>
        <p class="message">Xin chào,<br><br>Đây là mã xác thực OTP của bạn để <strong>${typeLabels[type] || type}</strong>:</p>
        <div class="otp-box">${otp}</div>
        <p class="message">Mã này có hiệu lực trong <strong>10 phút</strong>.<br>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p class="warning">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ThemeVN - Premium WordPress Themes
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
ThemeVN - Mã xác thực OTP

Mã OTP của bạn: ${otp}

Mã này dùng để: ${typeLabels[type] || type}
Hiệu lực: 10 phút

Vui lòng không chia sẻ mã này với bất kỳ ai.
Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.

© ${new Date().getFullYear()} ThemeVN
  `;

  return sendEmail({ to: email, subject, html, text });
}

export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}
