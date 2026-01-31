import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendOtpViaResend: (email: string, type: "login" | "signup" | "recovery") => Promise<{ error: Error | null }>;
  verifyOtpViaResend: (email: string, code: string, type: "login" | "signup" | "recovery", password?: string) => Promise<{ error: Error | null; verified?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string, type?: string, password?: string) => Promise<{ error: Error | null; verified?: boolean; action_link?: string }>;
  session: { user: User } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, type: "signup" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Signup failed") };
      }
      
      await checkAuth();
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Signup failed") };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Login failed") };
      }

      const data = await response.json();
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Login failed") };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const sendOtpViaResend = async (email: string, type: "login" | "signup" | "recovery") => {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Failed to send OTP") };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to send OTP") };
    }
  };

  const verifyOtpViaResend = async (
    email: string,
    code: string,
    type: "login" | "signup" | "recovery",
    password?: string
  ) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code, type, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Failed to verify OTP"), verified: false };
      }

      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      } else {
        await checkAuth();
      }

      return { error: null, verified: data.verified || true };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to verify OTP"), verified: false };
    }
  };

  const signInWithOtp = async (email: string) => {
    return sendOtpViaResend(email, "login");
  };

  const verifyOtp = async (email: string, token: string, type?: string, password?: string) => {
    return verifyOtpViaResend(email, token, (type as "login" | "signup" | "recovery") || "login", password);
  };

  const resetPassword = async (email: string) => {
    return sendOtpViaResend(email, "recovery");
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: user.email, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Failed to update password") };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Failed to update password") };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signInWithPassword,
        signOut,
        sendOtpViaResend,
        verifyOtpViaResend,
        resetPassword,
        updatePassword,
        signInWithOtp,
        verifyOtp,
        session: user ? { user } : null,
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
