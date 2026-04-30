import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, FileDown, Briefcase, GraduationCap, Trophy, Pencil } from "lucide-react";

export const ProfessionalPortfolio = ({ 
    profile, 
    isOwnProfile = false, 
    onEdit 
}: { 
    profile: any;
    isOwnProfile?: boolean;
    onEdit?: (tab: "experience" | "education" | "projects") => void;
}) => {
    const projects = profile?.projects_data || [];
    const experience = profile?.experience_data || [];
    const education = profile?.education_data || [];

    return (
        <div className="space-y-8">
            {/* Featured Projects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Featured Projects
                    </h3>
                    {isOwnProfile && onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit("projects")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                {projects.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {projects.map((project: any, i: number) => (
                            <div key={i} className="glass-card p-6 group hover:border-primary/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    {project.link && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                <p className="text-muted-foreground mb-4">{project.description || project.desc}</p>
                                {project.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                        <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>No projects showcased yet</p>
                    </div>
                )}
            </div>

            {/* Work Experience */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Experience
                    </h3>
                    {isOwnProfile && onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit("experience")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                {experience.length > 0 ? (
                    <div className="space-y-6 relative border-l-2 border-primary/20 ml-3 pl-8 pb-2">
                        {experience.map((job: any, i: number) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-background border-4 border-primary" />
                                <h4 className="font-bold text-lg">{job.role || job.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-primary mb-1">
                                    <span>{job.company}</span>
                                    <span>•</span>
                                    <span>{job.period}</span>
                                </div>
                                <p className="text-muted-foreground text-sm">{job.description || job.desc}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                        <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>Professional experience not listed</p>
                    </div>
                )}
            </div>

            {/* Education */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Education
                    </h3>
                    {isOwnProfile && onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit("education")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                {education.length > 0 ? (
                    <div className="space-y-6 relative border-l-2 border-primary/20 ml-3 pl-8 pb-2">
                        {education.map((edu: any, i: number) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-background border-4 border-primary" />
                                <h4 className="font-bold text-lg">{edu.degree || edu.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-primary mb-1">
                                    <span>{edu.school || edu.institution}</span>
                                    <span>•</span>
                                    <span>{edu.period || edu.year}</span>
                                </div>
                                {edu.description && <p className="text-muted-foreground text-sm">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                        <GraduationCap className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>Education history not added</p>
                    </div>
                )}
            </div>

            {/* Resume & Links */}
            {(profile?.resume_url || profile?.github_url || profile?.portfolio_links?.length > 0) && (
                <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                            <FileDown className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Professional Assets</h3>
                            <p className="text-sm text-muted-foreground">Download resume or view external links</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {profile?.github_url && (
                            <Button variant="outline" asChild>
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="w-4 h-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                        )}
                        {profile?.resume_url && (
                            <Button variant="hero" asChild>
                                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                                    Download PDF
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
