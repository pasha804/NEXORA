import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
    Home,
    Search,
    Swords,
    MessageSquare,
    User,
    Settings,
    Users,
    Bot,
    Bell,
    LogOut,
    Menu,
    Clapperboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { CinematicIntro } from "@/components/layout/CinematicIntro";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { NotificationDropdown } from "./NotificationDropdown";
import { ActiveBattleContainer } from "../pvp/ActiveBattleContainer";

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, signOut } = useAuth();
    const [showIntro, setShowIntro] = useState(() => {
        // Only show intro once per browser session
        const seen = sessionStorage.getItem("nexora_intro_seen");
        return !seen;
    });

    // Must be before any conditional returns — hooks must always run in the same order
    useEffect(() => {
        if (!loading && user && !user.onboarding_completed && location.pathname !== "/onboarding") {
            navigate("/onboarding");
        }
    }, [user, loading, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: Search, label: "Discover", path: "/discover" },
        { icon: Swords, label: "PvP Arena", path: "/pvp" },
        { icon: MessageSquare, label: "Messages", path: "/messages" },
        { icon: User, label: "Profile", path: `/profile/${user?.username || "me"}` },
    ];

    const sidebarItems = [
        ...navItems,
        { icon: Users, label: "Communities", path: "/communities" },
        { icon: Clapperboard, label: "Reels", path: "/reels" },
        { icon: Bot, label: "AI Coach", path: "/ai-coach" },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const handleIntroComplete = () => {
        sessionStorage.setItem("nexora_intro_seen", "1");
        setShowIntro(false);
    };

    return (
        <>
            <AnimatePresence>
                {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
            </AnimatePresence>
            
            {!showIntro && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 0.8 }}
                    className="min-h-screen bg-background flex"
                >
                    {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-background/95 backdrop-blur-xl h-screen sticky top-0">
                <div className="p-6">
                    <Link to="/" className="flex items-center">
                        <Logo iconSize="w-8 h-8" textClassName="font-display font-bold text-xl tracking-tight" />
                    </Link>
                </div>

                <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-border/50 space-y-2">
                    <NotificationDropdown />
                    <Button onClick={() => navigate("/settings")} variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <Settings className="w-5 h-5" />
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 mb-0">
                {/* Mobile Top Bar */}
                <header className="md:hidden h-16 border-b border-border/50 flex items-center justify-between px-4 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
                    <Link to="/" className="flex items-center">
                        <Logo iconSize="w-6 h-6" textClassName="font-display font-bold text-lg tracking-tight" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Search className="w-5 h-5" />
                        </Button>
                        <NotificationDropdown />

                        {/* Mobile Menu Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0 border-l border-border/50 bg-black/95 backdrop-blur-2xl">
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b border-white/10">
                                        <SheetTitle className="font-display font-bold text-xl text-white">Menu</SheetTitle>
                                    </div>

                                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                        {sidebarItems.map((item) => (
                                            <SheetTrigger key={item.path} asChild>
                                                <Link
                                                    to={item.path}
                                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                                        ? "bg-primary text-primary-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-white/10 hover:text-white"
                                                        }`}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                    <span className="text-base">{item.label}</span>
                                                </Link>
                                            </SheetTrigger>
                                        ))}
                                    </div>

                                    <div className="p-6 border-t border-white/10 space-y-3">
                                        <SheetTrigger asChild>
                                            <Button onClick={() => navigate("/settings")} variant="outline" className="w-full justify-start gap-3 border-white/10 hover:bg-white/5">
                                                <Settings className="w-5 h-5" />
                                                Settings
                                            </Button>
                                        </SheetTrigger>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            <ActiveBattleContainer />
                </motion.div>
            )}
        </>
    );
};
