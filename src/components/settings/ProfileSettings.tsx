import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, Loader2, Briefcase, GraduationCap, FolderKanban, MapPin, Globe, Github, Linkedin, Link as LinkIcon } from "lucide-react";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        display_name: user?.display_name || "",
        username: user?.username || "",
        bio: user?.bio || "",
        location: user?.location || "",
        website: user?.website || "",
        github_url: user?.github_url || "",
        linkedin_url: user?.linkedin_url || "",
        experience_data: user?.experience_data || [],
        education_data: user?.education_data || [],
        projects_data: user?.projects_data || [],
    });

    // Skill State
    const [skills, setSkills] = useState(user?.skills || [
        { name: "React", level: 65, primary: true }
    ]);
    const [newSkill, setNewSkill] = useState("");
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Use base64 encoding instead of media upload
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    await updateUser({ avatar_url: base64 });
                    toast.success("Profile picture updated!");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to update profile picture");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Use base64 encoding instead of media upload
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    await updateUser({ banner_url: base64 });
                    toast.success("Banner updated!");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to update banner");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";
            const token = localStorage.getItem("access_token");

            const response = await fetch(`${API_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            const updatedUserData = await response.json();

            // Update local auth state
            await updateUser(updatedUserData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const addListItem = (field: 'experience_data' | 'education_data' | 'projects_data', item: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], item]
        }));
    };

    const removeListItem = (field: 'experience_data' | 'education_data' | 'projects_data', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        setSkills([...skills, { name: newSkill, level: 1, primary: false }]);
        setNewSkill("");
        setIsSkillModalOpen(false);
        toast.success("Skill added!");
    };

    const removeSkill = (index: number) => {
        const newSkills = [...skills];
        newSkills.splice(index, 1);
        setSkills(newSkills);
    };

    return (
        <div className="space-y-8">
            {/* Identity Section */}
            <section className="glass-card p-6 space-y-6">
                <h3 className="font-bold text-lg border-b border-border/50 pb-2">Identity</h3>

                {/* Banner Upload */}
                <div className="space-y-3">
                    <Label>Profile Banner</Label>
                    <div className="relative group">
                        <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 border-2 border-dashed border-white/10 hover:border-primary/50 transition-all">
                            {user?.banner_url ? (
                                <img
                                    src={user.banner_url}
                                    alt="Profile Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Upload banner image</p>
                                        <p className="text-xs opacity-70">1200 x 400 recommended</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerChange}
                        />
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => bannerInputRef.current?.click()}
                            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {user?.banner_url ? "Change Banner" : "Upload Banner"}
                        </Button>
                    </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-2 border-primary/20">
                        <AvatarImage src={user?.avatar_url || ""} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-xl font-bold">
                            {user?.full_name?.substring(0, 2).toUpperCase() || "ME"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="bg-muted/30"
                            placeholder="Public name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="bg-muted/30"
                            disabled
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Location
                        </Label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="bg-muted/30"
                            placeholder="San Francisco, CA"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Website
                        </Label>
                        <Input
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="bg-muted/30"
                            placeholder="https://yourportfolio.com"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Github className="w-3 h-3" /> GitHub URL
                        </Label>
                        <Input
                            value={formData.github_url}
                            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                            className="bg-muted/30"
                            placeholder="https://github.com/username"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Linkedin className="w-3 h-3" /> LinkedIn URL
                        </Label>
                        <Input
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            className="bg-muted/30"
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-muted/30"
                        rows={4}
                        placeholder="Tell us about your professional journey..."
                    />
                </div>
            </section>

            {/* Professional Experience Section */}
            <section className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Experience
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addListItem('experience_data', { title: '', company: '', period: '', description: '' })}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.experience_data.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20 relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                                onClick={() => removeListItem('experience_data', idx)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <div className="grid gap-3">
                                <Input
                                    value={item.title}
                                    placeholder="Job Title"
                                    onChange={(e) => {
                                        const newArr = [...formData.experience_data];
                                        newArr[idx].title = e.target.value;
                                        setFormData({ ...formData, experience_data: newArr });
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        value={item.company}
                                        placeholder="Company"
                                        onChange={(e) => {
                                            const newArr = [...formData.experience_data];
                                            newArr[idx].company = e.target.value;
                                            setFormData({ ...formData, experience_data: newArr });
                                        }}
                                    />
                                    <Input
                                        value={item.period}
                                        placeholder="Period (e.g. 2021 - Present)"
                                        onChange={(e) => {
                                            const newArr = [...formData.experience_data];
                                            newArr[idx].period = e.target.value;
                                            setFormData({ ...formData, experience_data: newArr });
                                        }}
                                    />
                                </div>
                                <Textarea
                                    value={item.description}
                                    placeholder="Key achievements..."
                                    rows={2}
                                    onChange={(e) => {
                                        const newArr = [...formData.experience_data];
                                        newArr[idx].description = e.target.value;
                                        setFormData({ ...formData, experience_data: newArr });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    {formData.experience_data.length === 0 && (
                        <p className="text-center text-muted-foreground py-4 text-sm">Add your career milestones</p>
                    )}
                </div>
            </section>

            {/* Education Section */}
            <section className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" /> Education
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addListItem('education_data', { school: '', degree: '', year: '' })}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.education_data.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20 relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                                onClick={() => removeListItem('education_data', idx)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <div className="grid gap-3">
                                <Input
                                    value={item.school}
                                    placeholder="University / School"
                                    onChange={(e) => {
                                        const newArr = [...formData.education_data];
                                        newArr[idx].school = e.target.value;
                                        setFormData({ ...formData, education_data: newArr });
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        value={item.degree}
                                        placeholder="Degree"
                                        onChange={(e) => {
                                            const newArr = [...formData.education_data];
                                            newArr[idx].degree = e.target.value;
                                            setFormData({ ...formData, education_data: newArr });
                                        }}
                                    />
                                    <Input
                                        value={item.year}
                                        placeholder="Year"
                                        onChange={(e) => {
                                            const newArr = [...formData.education_data];
                                            newArr[idx].year = e.target.value;
                                            setFormData({ ...formData, education_data: newArr });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.education_data.length === 0 && (
                        <p className="text-center text-muted-foreground py-4 text-sm">Add your academic background</p>
                    )}
                </div>
            </section>

            {/* Projects Section */}
            <section className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-primary" /> Projects
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addListItem('projects_data', { name: '', description: '', link: '', tech: '' })}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                <div className="space-y-4">
                    {formData.projects_data.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20 relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                                onClick={() => removeListItem('projects_data', idx)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <div className="grid gap-3">
                                <Input
                                    value={item.name}
                                    placeholder="Project Name"
                                    onChange={(e) => {
                                        const newArr = [...formData.projects_data];
                                        newArr[idx].name = e.target.value;
                                        setFormData({ ...formData, projects_data: newArr });
                                    }}
                                />
                                <Textarea
                                    value={item.description}
                                    placeholder="Description"
                                    rows={2}
                                    onChange={(e) => {
                                        const newArr = [...formData.projects_data];
                                        newArr[idx].description = e.target.value;
                                        setFormData({ ...formData, projects_data: newArr });
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        value={item.tech}
                                        placeholder="Tech Stack (e.g. React, Node.js)"
                                        onChange={(e) => {
                                            const newArr = [...formData.projects_data];
                                            newArr[idx].tech = e.target.value;
                                            setFormData({ ...formData, projects_data: newArr });
                                        }}
                                    />
                                    <Input
                                        value={item.link}
                                        placeholder="Project URL"
                                        onChange={(e) => {
                                            const newArr = [...formData.projects_data];
                                            newArr[idx].link = e.target.value;
                                            setFormData({ ...formData, projects_data: newArr });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.projects_data.length === 0 && (
                        <p className="text-center text-muted-foreground py-4 text-sm">Showcase your best work</p>
                    )}
                </div>
            </section>

            {/* Skills Section */}
            <section className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="font-bold text-lg">Skills & Expertise</h3>

                    <Dialog open={isSkillModalOpen} onOpenChange={setIsSkillModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Skill
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Skill</DialogTitle>
                                <DialogDescription>
                                    Enter the skill you want to showcase on your profile.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="skill">Skill Name</Label>
                                    <Input
                                        id="skill"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="e.g. Python, Figma, Public Speaking"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addSkill}>Add Skill</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {skills?.map((skill, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/50 flex hover:border-primary/50 transition-colors group relative">
                            <div className="w-10 h-10 rounded-md bg-zinc-900 flex items-center justify-center text-xl mr-4 capitalize">
                                {skill.name.substring(0, 1)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{skill.name}</h4>
                                        <p className="text-sm text-muted-foreground">Level {skill.level}</p>
                                    </div>
                                    <Switch defaultChecked id={`public-${skill.name}`} />
                                </div>
                                <div className="mt-2 flex gap-2">
                                    {skill.primary && <Badge variant="outline">Primary Skill</Badge>}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeSkill(index)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}

                    {skills?.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No skills added yet.</p>
                    )}
                </div>
            </section>

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border/50 z-10">
                <Button variant="outline" onClick={() => toast.info("Changes discarded")}>Discard</Button>
                <Button variant="hero" onClick={handleSave} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
};
