import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

// Home Components
import { HomeLeftSidebar } from "@/components/home/HomeLeftSidebar";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { MainFeed } from "@/components/home/MainFeed";
import { CreatePostFab } from "@/components/home/CreatePostFab";
import { TrendingDiscoveryStrip } from "@/components/home/TrendingDiscoveryStrip";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();

  // 'user' from useAuth is our single source of truth for the profile data
  const profile = user;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* FAB */}
      <CreatePostFab />

      <main className="pt-6 pb-20 px-4">
        {/* Welcome Header (Visible on Mobile) */}
        <div className="max-w-[1400px] mx-auto mb-6 block md:hidden">
          <h1 className="font-display text-2xl font-bold">
            Home
          </h1>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Identity & Nav (Width 3) - Sticky */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scroll-container pr-1">
            <HomeLeftSidebar user={profile} />
          </div>

          {/* CENTER COLUMN: Feed (Width 6) */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Welcome back, <span className="text-glow text-primary animate-pulse">{profile.display_name || profile.username}</span>
              </h1>
              <p className="text-muted-foreground">Your skill journey continues. Here's your personalized engine.</p>
            </motion.div>

            <TrendingDiscoveryStrip />

            <MainFeed />
          </div>

          {/* RIGHT COLUMN: Discovery & Updates (Width 3) - Sticky */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scroll-container pl-1">
            <HomeRightSidebar />
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
