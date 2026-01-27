import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  template: string;
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

    const { email, template }: EmailRequest = await req.json();

    if (!email || !template) {
      throw new Error("Email and template are required");
    }

    // Fetch the email template
    const { data: templateData, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("slug", template)
      .eq("is_active", true)
      .single();

    if (templateError || !templateData) {
      throw new Error(`Template "${template}" not found or inactive`);
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

    // Replace variables in template
    let htmlContent = templateData.html_content;
    let subject = templateData.subject;

    const variables: Record<string, string> = {
      store_name: settingsMap.STORE_NAME || "ThemeVN",
      shop_url: settingsMap.STORE_URL || "https://themevn.com",
      year: new Date().getFullYear().toString(),
      email: email,
    };

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      htmlContent = htmlContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    const storeName = settingsMap.STORE_NAME || "ThemeVN";
    const fromEmail = settingsMap.FROM_EMAIL || "onboarding@resend.dev";

    console.log(`Sending subscriber email to ${email} using from: ${storeName} <${fromEmail}>`);

    // Send the email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${storeName} <${fromEmail}>`,
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending subscriber email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
