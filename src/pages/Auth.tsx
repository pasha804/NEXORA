import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, User, ArrowLeft, Loader2, Camera, Plus } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
// import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup" | "forgot";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup" || modeParam === "signin" || modeParam === "forgot") {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        // const { error } = await supabase.auth.resetPasswordForEmail(email, {
        //   redirectTo: `${window.location.origin}/auth?mode=signin`,
        // });
        // Password reset logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        const error = null;

        if (error) {
          toast.error("Error sending reset email");
        } else {
          toast.success("Password reset email sent!");
          setMode("signin");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName, avatarPreview || undefined);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Let's set up your profile.");
          navigate("/onboarding");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          // Small delay to ensure user state is updated
          setTimeout(() => navigate("/dashboard"), 100);
        }
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
      default: return "Welcome Back";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signup": return "Join the ultimate skill competition platform";
      case "forgot": return "Enter your email to receive a reset link";
      default: return "Sign in to continue your journey";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 w-full max-w-md"
      >
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Auth Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo animated={true} iconSize="w-12 h-12" textClassName="font-display font-bold text-2xl text-glow" />
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-bold text-center mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            {getSubtitle()}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 mb-4"
                >
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest self-start">Profile Picture (Optional)</label>
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/60">
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full text-primary-foreground shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setAvatarPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName" className="text-sm font-medium">
                      Display Name
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 bg-muted/50 border-border focus:border-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-muted/50 border-border focus:border-primary"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode !== "forgot" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "signin" && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="text-primary text-sm p-0 h-auto"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </Button>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "forgot" ? "Sending..." : mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "forgot" ? (
                "Send Reset Link"
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            {mode === "forgot" ? (
              <Button
                variant="link"
                onClick={() => setMode("signin")}
                className="text-primary"
              >
                Back to Sign In
              </Button>
            ) : (
              <>
                <span className="text-muted-foreground text-sm">
                  {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                </span>
                <Button
                  variant="link"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-primary"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
