import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Zap, LogOut, User, LayoutDashboard, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "PvP Arena", href: "/#pvp" },
  { name: "Community", href: "/#community" },
  { name: "Leaderboard", href: "/#leaderboard" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] px-4 py-4"
    >
      <div className="mx-auto max-w-7xl">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo animated={false} iconSize="w-10 h-10" textClassName="font-display font-bold text-xl text-glow" />
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium"
                whileHover={{ y: -2 }}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card border-border">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth?mode=signin">
                    Sign In
                  </Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth?mode=signup">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass-card mt-2 p-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-3 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              {user ? (
                <>
                  <Button variant="glass" className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/auth?mode=signin" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
