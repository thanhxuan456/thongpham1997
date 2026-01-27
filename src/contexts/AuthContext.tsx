import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string, type?: "login" | "signup" | "recovery", password?: string) => Promise<{ error: Error | null; verified?: boolean; action_link?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  sendOtpViaResend: (email: string, type: "login" | "signup" | "recovery") => Promise<{ error: Error | null }>;
  verifyOtpViaResend: (email: string, code: string, type: "login" | "signup" | "recovery", password?: string) => Promise<{ error: Error | null; verified?: boolean; action_link?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return { error, verified: !error };
  };

  // Send OTP via Resend email service
  const sendOtpViaResend = async (email: string, type: "login" | "signup" | "recovery") => {
    try {
      const response = await supabase.functions.invoke("send-otp", {
        body: { email, type },
      });

      if (response.error) {
        return { error: new Error(response.error.message || "Failed to send OTP") };
      }

      if (response.data?.error) {
        return { error: new Error(response.data.error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to send OTP") };
    }
  };

  // Verify OTP sent via Resend
  const verifyOtpViaResend = async (
    email: string, 
    code: string, 
    type: "login" | "signup" | "recovery",
    password?: string
  ) => {
    try {
      const response = await supabase.functions.invoke("verify-otp", {
        body: { email, code, type, password },
      });

      if (response.error) {
        return { error: new Error(response.error.message || "Failed to verify OTP"), verified: false };
      }

      if (response.data?.error) {
        return { error: new Error(response.data.error), verified: false };
      }

      // If login type and we have an action link, use it to complete sign in
      if (type === "login" && response.data?.action_link) {
        // Extract token from action link and verify with Supabase
        const url = new URL(response.data.action_link);
        const token = url.searchParams.get("token");
        
        if (token) {
          // Use the token to sign in
          const { error: signInError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "magiclink",
          });
          
          if (signInError) {
            return { error: signInError, verified: false };
          }
        }
      }

      // If signup was successful, sign in the user
      if (type === "signup" && response.data?.user_created && password) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          return { error: signInError, verified: true };
        }
      }

      return { 
        error: null, 
        verified: response.data?.verified || false,
        action_link: response.data?.action_link 
      };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to verify OTP"), verified: false };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signInWithOtp,
        verifyOtp,
        signInWithPassword,
        signOut,
        resetPassword,
        updatePassword,
        sendOtpViaResend,
        verifyOtpViaResend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
