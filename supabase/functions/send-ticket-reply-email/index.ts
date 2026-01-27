import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  ticketId: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ticketId, message }: EmailRequest = await req.json();

    if (!ticketId || !message) {
      throw new Error("ticketId and message are required");
    }

    // Fetch ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      throw new Error("Ticket not found");
    }

    // Fetch store settings
    const { data: settings } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["STORE_NAME", "STORE_URL"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      settingsMap[s.key] = s.value || "";
    });

    const storeName = settingsMap.STORE_NAME || "ThemeVN";
    const storeUrl = settingsMap.STORE_URL || "https://themevn.com";

    // Build email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💬 Phản hồi từ ${storeName}</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #6b7280; margin: 0 0 15px;">Xin chào <strong>${ticket.user_name || "Quý khách"}</strong>,</p>
          <p style="color: #6b7280; margin: 0 0 20px;">Đội ngũ hỗ trợ đã phản hồi ticket "<strong>${ticket.subject}</strong>" của bạn:</p>
          
          <div style="background: #f3f4f6; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1f2937; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #6b7280; margin: 20px 0 0;">Để tiếp tục cuộc trò chuyện, vui lòng truy cập hệ thống hỗ trợ của chúng tôi.</p>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${storeUrl}/support" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Xem Ticket →</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ${storeName}. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.</p>
        </div>
      </body>
      </html>
    `;

    // Send the email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${storeName} Support <noreply@themevn.com>`,
        to: [ticket.user_email],
        subject: `Re: ${ticket.subject} - ${storeName}`,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Ticket reply email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending ticket reply email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
