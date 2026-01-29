import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OtpRequest {
  email: string;
  type: "signup" | "login" | "recovery";
}

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: OtpRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch settings including RESEND_API_KEY and rate limiting from database
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "STORE_NAME", 
        "FROM_EMAIL", 
        "RESEND_API_KEY",
        "OTP_RATE_LIMIT_WINDOW",
        "OTP_RATE_LIMIT_MAX_ATTEMPTS",
        "OTP_RATE_LIMIT_BLOCK_DURATION"
      ]);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error("Failed to load email configuration");
    }

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      settingsMap[s.key] = s.value || "";
    });

    const resendApiKey = settingsMap.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured in settings");
      throw new Error("Email service is not configured. Please add RESEND_API_KEY in Admin Settings.");
    }

    // Rate limiting configuration
    const rateLimitWindow = parseInt(settingsMap.OTP_RATE_LIMIT_WINDOW || "60", 10);
    const maxAttempts = parseInt(settingsMap.OTP_RATE_LIMIT_MAX_ATTEMPTS || "3", 10);
    const blockDuration = parseInt(settingsMap.OTP_RATE_LIMIT_BLOCK_DURATION || "300", 10);

    // Check rate limiting - count recent OTP requests for this email
    const windowStart = new Date(Date.now() - rateLimitWindow * 1000).toISOString();
    const blockStart = new Date(Date.now() - blockDuration * 1000).toISOString();

    // Check if user is blocked (exceeded max attempts in block duration)
    const { count: blockedCount, error: blockedError } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", blockStart);

    if (blockedError) {
      console.error("Error checking blocked status:", blockedError);
    }

    // If user has exceeded attempts in the block duration, block them
    if (blockedCount && blockedCount >= maxAttempts * 2) {
      const remainingBlockTime = Math.ceil(blockDuration / 60);
      throw new Error(`Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingBlockTime} phút.`);
    }

    // Check rate limiting in current window
    const { count: recentCount, error: countError } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", windowStart);

    if (countError) {
      console.error("Error checking rate limit:", countError);
    }

    if (recentCount && recentCount >= maxAttempts) {
      throw new Error(`Bạn chỉ có thể gửi tối đa ${maxAttempts} OTP trong ${rateLimitWindow} giây. Vui lòng thử lại sau.`);
    }

    // Check last OTP time for this email
    const { data: lastOtp, error: lastOtpError } = await supabase
      .from("otp_codes")
      .select("created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastOtpError) {
      console.error("Error checking last OTP:", lastOtpError);
    }

    if (lastOtp) {
      const lastOtpTime = new Date(lastOtp.created_at).getTime();
      const timeSinceLastOtp = Date.now() - lastOtpTime;
      const minWaitTime = Math.floor(rateLimitWindow / maxAttempts) * 1000; // Minimum wait time between OTPs
      
      if (timeSinceLastOtp < minWaitTime) {
        const remainingSeconds = Math.ceil((minWaitTime - timeSinceLastOtp) / 1000);
        throw new Error(`Vui lòng đợi ${remainingSeconds} giây trước khi gửi OTP tiếp theo.`);
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert new OTP (don't delete old ones - we need them for rate limiting)
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code: otp,
        type,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to generate OTP");
    }

    // Mark old OTPs as used (so they can't be reused)
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("email", email)
      .neq("code", otp)
      .eq("used", false);

    const storeName = settingsMap.STORE_NAME || "ThemeVN";
    // Use Resend test domain if no custom domain is configured
    const fromEmail = settingsMap.FROM_EMAIL || "onboarding@resend.dev";

    // Determine email subject and content based on type
    let subject = "";
    let heading = "";
    let message = "";

    switch (type) {
      case "signup":
        subject = "Xác minh tài khoản của bạn";
        heading = "Chào mừng bạn!";
        message = "Cảm ơn bạn đã đăng ký. Sử dụng mã OTP bên dưới để xác minh tài khoản:";
        break;
      case "login":
        subject = "Mã đăng nhập của bạn";
        heading = "Đăng nhập vào tài khoản";
        message = "Sử dụng mã OTP bên dưới để đăng nhập:";
        break;
      case "recovery":
        subject = "Đặt lại mật khẩu";
        heading = "Đặt lại mật khẩu";
        message = "Sử dụng mã OTP bên dưới để đặt lại mật khẩu:";
        break;
    }

    console.log(`Sending OTP email to ${email} using from: ${storeName} <${fromEmail}>`);

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${storeName} <${fromEmail}>`,
        to: [email],
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px 0; text-align: center;">${heading}</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">${message}</p>
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: white;">${otp}</span>
              </div>
              <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 0;">Mã này sẽ hết hạn sau 10 phút.</p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
              <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 0;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("OTP email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);