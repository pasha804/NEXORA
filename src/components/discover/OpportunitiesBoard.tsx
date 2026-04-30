import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Rocket, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OpportunitiesBoardProps {
    searchQuery: string;
    filters: any;
}

export const OpportunitiesBoard = ({ searchQuery, filters }: OpportunitiesBoardProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Opportunities
                </h2>
                <p className="text-sm text-muted-foreground">Jobs, freelance, and internship matches</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 relative overflow-hidden"
            >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Job Board Coming Soon</h3>
                    <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
                        AI-matched job opportunities based on your verified skills and rank level.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {["Remote", "Internships", "Full-time", "Freelance", "Startup"].map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-primary/30 text-primary/70">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <Button onClick={() => navigate("/profile/me")} className="gap-2">
                        Complete Your Profile
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
