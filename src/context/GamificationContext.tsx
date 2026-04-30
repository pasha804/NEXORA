import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpValue: number;
}

interface GamificationContextType {
    xp: number;
    level: number;
    streak: number;
    addXP: (amount: number, reason: string) => void;
    unlockedAchievements: Achievement[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, updateUser } = useAuth();
    
    // Initialize from user or fallback to 0/1
    const [xp, setXp] = useState(user?.xp || 0);
    const [level, setLevel] = useState(user?.level || 1);
    const [streak, setStreak] = useState(0); // This can be synced later
    const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

    // Keep state in sync with user object from useAuth
    useEffect(() => {
        if (user) {
            setXp(user.xp);
            setLevel(user.level);
        }
    }, [user]);

    // XP to next level formula: Level * 1000
    const xpToNextLevel = level * 1000;

    const addXP = async (amount: number, reason: string) => {
        const newXp = xp + amount;
        
        // Optimistic update
        setXp(newXp);

        // Check for level up
        if (newXp >= xpToNextLevel) {
            const newLevel = level + 1;
            setLevel(newLevel);
            toast.success(`Leveled Up! You are now Level ${newLevel} 🚀`, {
                description: "New skills and perks unlocked!",
                duration: 5000,
            });
            
            // Sync level up to backend
            updateUser({ xp: newXp, level: newLevel });
        } else {
            toast(`+${amount} XP`, {
                description: reason,
                icon: "⚡",
                className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 font-bold",
                duration: 2000
            });
            
            // Sync XP to backend
            updateUser({ xp: newXp });
        }
    };

    // Simulate Daily Login Check (Purely client-side logic for now)
    useEffect(() => {
        const lastLogin = localStorage.getItem("lastLogin");
        const today = new Date().toDateString();

        if (lastLogin !== today && user) {
            // Daily Reward
            setTimeout(() => {
                addXP(50, "Daily Login Bonus");
                localStorage.setItem("lastLogin", today);
            }, 3000); // Delay for effect
        }
    }, [user]);

    return (
        <GamificationContext.Provider value={{ xp, level, streak, addXP, unlockedAchievements }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
};
