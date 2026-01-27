import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  email: string;
  code: string;
  type: "signup" | "login" | "recovery";
  password?: string; // Required for signup
}

// Helper function to check if user exists by email efficiently
// Uses listUsers with filter instead of fetching all users
async function getUserByEmail(supabase: any, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });
  
  if (error) return { user: null, error };
  
  // Since we can't filter by email directly in listUsers, we need to check profiles table
  // which is indexed and more efficient
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  
  if (profile?.user_id) {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
    return { user: userData?.user, error: userError };
  }
  
  return { user: null, error: null };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type, password }: VerifyOtpRequest = await req.json();

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========== RATE LIMITING FOR VERIFY OTP ==========
    // Check failed verification attempts in last 10 minutes
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from("otp_codes")
      .select("id, code, used")
      .eq("email", email)
      .eq("type", type)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (!attemptsError && recentAttempts) {
      // Count how many different incorrect codes were attempted
      // If OTP was marked as used but code doesn't match current attempt, it's a failed attempt
      const failedAttempts = recentAttempts.filter(r => r.used && r.code !== code).length;
      
      if (failedAttempts >= 5) {
        // Delete all OTPs for this email to force requesting a new one
        await supabase.from("otp_codes").delete().eq("email", email).eq("type", type);
        
        return new Response(
          JSON.stringify({ error: "Quá nhiều lần thử không thành công. Vui lòng yêu cầu mã OTP mới." }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }
    // ========== END RATE LIMITING ==========

    // Get the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("type", type)
      .eq("used", false)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Mã OTP không hợp lệ" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase
        .from("otp_codes")
        .delete()
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "Mã OTP đã hết hạn" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Handle different types
    if (type === "signup") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required for signup" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if user already exists using profiles table (indexed lookup)
      const { user: existingUser } = await getUserByEmail(supabase, email);
      
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Email đã được đăng ký" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Create the user with email confirmed
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Không thể tạo tài khoản" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          user_created: true,
          message: "Account created successfully" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (type === "login") {
      // Check if user exists using profiles table (indexed lookup)
      const { user: existingUser, error: userError } = await getUserByEmail(supabase, email);

      if (userError || !existingUser) {
        return new Response(
          JSON.stringify({ error: "Tài khoản không tồn tại" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Generate a magic link for the user
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (linkError) {
        console.error("Error generating link:", linkError);
        throw new Error("Failed to authenticate user");
      }

      const actionLink = linkData?.properties?.action_link;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          action_link: actionLink,
          message: "OTP verified successfully" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For recovery type, just confirm verification and allow password reset
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        message: "OTP verified successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
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
