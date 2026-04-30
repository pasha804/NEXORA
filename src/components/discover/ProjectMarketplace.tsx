import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Clock, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectMarketplaceProps {
    searchQuery: string;
    filters: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const ProjectMarketplace = ({ searchQuery, filters }: ProjectMarketplaceProps) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                const params = new URLSearchParams({ limit: "20" });
                if (searchQuery.trim()) params.set("q", searchQuery.trim());

                const resp = await fetch(`${API_URL}/social/posts?post_type=project&${params}`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setProjects(data.posts || data || []);
                }
            } catch (err) {
                console.error("Fetch projects error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-6 animate-pulse space-y-3">
                        <div className="h-5 bg-muted/50 rounded w-3/4" />
                        <div className="h-3 bg-muted/50 rounded" />
                        <div className="h-3 bg-muted/50 rounded w-5/6" />
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-muted/50 rounded" />
                            <div className="h-6 w-16 bg-muted/50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No projects yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Share your projects to get collaborators</p>
                <Button className="mt-4 gap-2" onClick={() => navigate("/dashboard")}>
                    <Plus className="w-4 h-4" /> Share a Project
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-yellow-400" />
                    Project Marketplace
                </h2>
                <p className="text-sm text-muted-foreground">Collaborate on real projects</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project, i) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ y: -4 }}
                        className="glass-card p-6 hover:border-yellow-500/40 transition-all cursor-pointer group"
                    >
                        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                            {project.title || project.content?.slice(0, 60)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {project.content}
                        </p>
                        {project.skill_tags && project.skill_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {project.skill_tags.slice(0, 4).map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                by @{project.author?.username || "unknown"}
                            </span>
                            <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-primary hover:text-primary-foreground transition-all">
                                View Project
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
