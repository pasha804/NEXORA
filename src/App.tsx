import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { GamificationProvider } from "@/context/GamificationContext";
import { Component, ReactNode } from "react";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Discover from "./pages/Discover";
import PvP from "./pages/PvP";
import Communities from "./pages/Communities";
import Reels from "./pages/Reels";
import AICoach from "./pages/AICoach";
import { BattlePass } from "./pages/BattlePass";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center", marginTop: "50px" }}>
          <h1>Something went wrong</h1>
          <p style={{ color: "#666" }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: "10px 20px", 
              background: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-xl animate-pulse">N</span>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground animate-pulse tracking-widest text-xs uppercase">Initializing Nexora</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Authenticated Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/pvp" element={<PvP />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/battle-pass" element={<BattlePass />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile/:username?" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <AuthProvider>
            <GamificationProvider>
              <Toaster />
              <AppContent />
            </GamificationProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
