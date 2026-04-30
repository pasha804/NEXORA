import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Users } from "lucide-react";

const PROJECTS = [
    {
        id: 1,
        name: "Nexora Skill Forge",
        description: "Building the future of skill-based social networking. Looking for frontend wizards!",
        tech: ["React", "FastAPI", "AI"],
        roles: ["Frontend Dev", "UI Designer"],
        stars: 128,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: 2,
        name: "EcoTrack AI",
        description: "AI-powered carbon footprint tracker for enterprises.",
        tech: ["Python", "TensorFlow", "AWS"],
        roles: ["ML Engineer"],
        stars: 45,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
    }
];

export const CommunityProjectsTab = () => {
    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                <div>
                    <h2 className="text-xl font-bold text-white">Open Projects</h2>
                    <p className="text-sm text-muted-foreground">Collaborate on real-world projects or recruit for your startup.</p>
                </div>
                <Button>Post a Project</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {PROJECTS.map(project => (
                    <div key={project.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row gap-6 hover:border-primary/30 transition-colors group">
                        <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                            <img src={project.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={project.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Github className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tech.map(t => <Badge key={t} variant="outline" className="border-white/10 text-gray-400">{t}</Badge>)}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium">
                                <span className="text-yellow-500 flex items-center gap-1">⭐ {project.stars} stars</span>
                                <span className="text-blue-400 flex items-center gap-1"><Users className="w-3 h-3" /> Recruiting: {project.roles.join(", ")}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
