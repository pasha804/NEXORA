import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

// Define real types matching backend bootstrap response
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  full_name?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  learning_goals?: string | null;
  collaboration_preference?: string | null;
  xp: number;
  level: number;
  rank: string;
  ranking_score?: number;   // raw RP value from users.ranking_score
  followers_count: number;
  following_count: number;
  skills: {
    name: string;
    level: string | number;
    xp: number;
    endorsed?: number;
    verified?: boolean;
  }[];
  interests: string[];
  onboarding_completed: boolean;
  created_at: string;
}

export interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, avatarUrl?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>, localOnly?: boolean) => Promise<void>;
  saveOnboardingSkills: (skills: { name: string, level: string, xp: number }[]) => Promise<void>;
  saveOnboardingInterests: (interests: string[]) => Promise<void>;
  completeOnboarding: (profileData: { bio: string, learning_goals: string, collaboration_preference: string, is_private: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setSession({ access_token: token, user: userData });
      } else if (res.status === 401) {
        // Only clear the token on genuine auth failure (expired/invalid)
        console.warn("Auth token invalid or expired, clearing session.");
        localStorage.removeItem("access_token");
        setUser(null);
        setSession(null);
      } else {
        // Server error (5xx) or other issue — keep token, user stays as-is
        console.error(`fetchMe: non-auth error status ${res.status}, keeping session alive.`);
      }
    } catch (error) {
      // Network error — keep the token so the user isn't unexpectedly logged out
      console.error("fetchMe: network error, keeping existing session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, avatarUrl?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: (displayName || email.split("@")[0]).toLowerCase().replace(/\s+/g, '_'),
          display_name: displayName,
          avatar_url: avatarUrl
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        // After signup, we need the full bootstrap data from /me
        await fetchMe(data.access_token);
      }
      return { error: null };
    } catch (error) {
      console.error("Signup Error:", error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[LOGIN] Attempting login to:", `${API_URL}/auth/login`);
      console.log("[LOGIN] Email:", email);
      
      // Send JSON body matching the backend /auth/login endpoint
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[LOGIN] Response status:", res.status);
      console.log("[LOGIN] Response ok:", res.ok);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Login failed" }));
        console.log("[LOGIN] Error response:", errorData);
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();
      console.log("[LOGIN] Success! Data keys:", Object.keys(data));
      
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        // Store user_id so messaging store and other components can read it directly
        localStorage.setItem("user_id", String(data.id ?? data.user_id ?? ""));
        console.log("[LOGIN] Token stored in localStorage");

        // Immediately populate user state from login response so UI isn't blocked
        // The backend now returns a full enough user object on /login
        const interim: User = {
          id: data.id ?? data.user_id,
          username: data.username,
          email: data.email ?? email,
          display_name: data.display_name || data.username,
          avatar_url: data.avatar_url ?? null,
          banner_url: data.banner_url ?? null,
          bio: data.bio ?? null,
          xp: data.xp ?? 0,
          level: data.level ?? 1,
          rank: data.rank ?? "Beginner",
          followers_count: data.followers_count ?? 0,
          following_count: data.following_count ?? 0,
          skills: data.skills ?? [],
          interests: data.interests ?? [],
          onboarding_completed: data.onboarding_completed ?? false,
          created_at: data.created_at ?? new Date().toISOString(),
        };
        setUser(interim);
        setSession({ access_token: data.access_token, user: interim });

        // Fetch full enriched user data (stats, skills, etc.) in the background
        fetchMe(data.access_token);

        // Mark user as online
        fetch(`${API_URL}/presence/online`, {
          method: "POST",
          headers: { Authorization: `Bearer ${data.access_token}` }
        }).catch(() => {});
      }
      return { error: null };
    } catch (error) {
      console.error("Login Error:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    const token = localStorage.getItem("access_token");
    // Mark offline before clearing token
    if (token) {
      fetch(`${API_URL}/presence/offline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<User>, localOnly = false) => {
    if (!user || !session) return;

    const token = localStorage.getItem("access_token");

    // localOnly = true: just sync auth context state, don't call the API again
    // Used when the caller already saved via their own fetch
    if (localOnly) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setSession({ ...session, user: updatedUser });
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Failed to update profile" }));
        console.error("Update profile error:", errorData);
        throw new Error(errorData.detail || "Failed to update profile");
      }
      
      // Re-fetch full user to get updated profile with all nested fields
      if (token) await fetchMe(token);
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Update user error:", error);
      // Optimistic update on backend failure
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setSession({ ...session, user: updatedUser });
      toast.error("Saved locally — sync may be needed.");
    }
  };

  const saveOnboardingSkills = async (skills: { name: string, level: string, xp: number }[]) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/auth/onboarding/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ skills }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Failed to save skills" }));
      console.error("Save skills error:", errorData);
      throw new Error(errorData.detail || "Failed to save skills");
    }
  };

  const saveOnboardingInterests = async (interests: string[]) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/auth/onboarding/interests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ interests }),
    });
    if (!res.ok) throw new Error("Failed to save interests");
  };

  const completeOnboarding = async (profileData: { bio: string, learning_goals: string, collaboration_preference: string, is_private: boolean }) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/auth/onboarding/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error("Failed to complete onboarding");

    // Refresh user data to get the updated onboarding_completed flag and profile details
    if (token) await fetchMe(token);
  };

  const token = session?.access_token || null;

  return (
    <AuthContext.Provider value={{
      user, session, token, loading, signUp, signIn, signOut, updateUser,
      saveOnboardingSkills, saveOnboardingInterests, completeOnboarding
    }}>
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

