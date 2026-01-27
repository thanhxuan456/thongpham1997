import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
  provider?: "vonage" | "messagebird";
}

// Vonage SMS API
async function sendVonageSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("VONAGE_API_KEY");
  const apiSecret = Deno.env.get("VONAGE_API_SECRET");

  if (!apiKey || !apiSecret) {
    return { success: false, error: "Vonage credentials not configured" };
  }

  const response = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      api_secret: apiSecret,
      to: to.replace(/\D/g, ""),
      from: "ThemeVN",
      text: message,
    }),
  });

  const data = await response.json();
  
  if (data.messages && data.messages[0].status === "0") {
    return { success: true };
  }
  
  return { 
    success: false, 
    error: data.messages?.[0]?.["error-text"] || "Failed to send SMS via Vonage" 
  };
}

// MessageBird SMS API
async function sendMessageBirdSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("MESSAGEBIRD_API_KEY");

  if (!apiKey) {
    return { success: false, error: "MessageBird API key not configured" };
  }

  const response = await fetch("https://rest.messagebird.com/messages", {
    method: "POST",
    headers: {
      "Authorization": `AccessKey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      originator: "ThemeVN",
      recipients: [to.replace(/\D/g, "")],
      body: message,
    }),
  });

  if (response.ok) {
    return { success: true };
  }

  const data = await response.json();
  return { 
    success: false, 
    error: data.errors?.[0]?.description || "Failed to send SMS via MessageBird" 
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // ========== AUTHENTICATION CHECK ==========
    // This function should only be accessible by authenticated admin users
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create client with user's auth token to verify
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userSupabase.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = claims.claims.sub;

    // Use service role client to check admin role
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is an admin
    const { data: roleData, error: roleError } = await serviceSupabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    // ========== END AUTHENTICATION CHECK ==========

    // Get admin phone from settings
    const { data: settings } = await serviceSupabase
      .from("settings")
      .select("value")
      .eq("key", "ADMIN_PHONE_NUMBER")
      .single();

    const adminPhone = settings?.value;
    
    const { to, message, provider = "vonage" }: SMSRequest = await req.json();
    const phoneNumber = to || adminPhone;

    if (!phoneNumber) {
      throw new Error("No phone number provided and ADMIN_PHONE_NUMBER not configured");
    }

    if (!message) {
      throw new Error("Message is required");
    }

    console.log(`Sending SMS via ${provider} to ${phoneNumber}`);

    let result;
    
    if (provider === "messagebird") {
      result = await sendMessageBirdSMS(phoneNumber, message);
    } else {
      // Try Vonage first, fallback to MessageBird
      result = await sendVonageSMS(phoneNumber, message);
      
      if (!result.success && Deno.env.get("MESSAGEBIRD_API_KEY")) {
        console.log("Vonage failed, trying MessageBird fallback...");
        result = await sendMessageBirdSMS(phoneNumber, message);
      }
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to send SMS");
    }

    console.log("SMS sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "SMS sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
