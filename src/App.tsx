import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { GamificationProvider } from "@/context/GamificationContext";
import { Component, ReactNode, lazy, Suspense } from "react";

// Eagerly loaded (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy loaded (authenticated routes — only loaded when needed)
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Settings     = lazy(() => import("./pages/Settings"));
const Profile      = lazy(() => import("./pages/Profile"));
const Messages     = lazy(() => import("./pages/Messages"));
const Discover     = lazy(() => import("./pages/Discover"));
const PvP          = lazy(() => import("./pages/PvP"));
const Communities  = lazy(() => import("./pages/Communities"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const Reels        = lazy(() => import("./pages/Reels"));
const AICoach      = lazy(() => import("./pages/AICoach"));
const BattlePassPage = lazy(() => import("./pages/BattlePass"));
const LeaderboardPage = lazy(() => import("./pages/Leaderboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Page-level loading skeleton ──────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-transparent flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">Loading</p>
    </div>
  </div>
);

// ── Per-page error boundary ───────────────────────────────────────────────────
class PageErrorBoundary extends Component<
  { children: ReactNode; pageName?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; pageName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.pageName || "Page"} Error]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App-level error boundary ──────────────────────────────────────────────────
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

// ── Wrap a lazy page with Suspense + per-page error boundary ─────────────────
const Page = ({ children, name }: { children: ReactNode; name: string }) => (
  <PageErrorBoundary pageName={name}>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </PageErrorBoundary>
);

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

      {/* Authenticated Layout Routes — all lazy loaded with per-page error boundaries */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard"        element={<Page name="Dashboard"><Dashboard /></Page>} />
        <Route path="/discover"         element={<Page name="Discover"><Discover /></Page>} />
        <Route path="/pvp"              element={<Page name="PvP"><PvP /></Page>} />
        <Route path="/communities"      element={<Page name="Communities"><Communities /></Page>} />
        <Route path="/communities/:slug" element={<Page name="Community"><CommunityDetail /></Page>} />
        <Route path="/reels"            element={<Page name="Reels"><Reels /></Page>} />
        <Route path="/ai-coach"         element={<Page name="AI Coach"><AICoach /></Page>} />
        <Route path="/battle-pass"      element={<Page name="Battle Pass"><BattlePassPage /></Page>} />
        <Route path="/leaderboard"      element={<Page name="Leaderboard"><LeaderboardPage /></Page>} />
        <Route path="/settings"         element={<Page name="Settings"><Settings /></Page>} />
        <Route path="/profile/:username?" element={<Page name="Profile"><Profile /></Page>} />
        <Route path="/messages"         element={<Page name="Messages"><Messages /></Page>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
