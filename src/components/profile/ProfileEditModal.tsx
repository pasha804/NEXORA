import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    X, Save, User, Briefcase, GraduationCap, Trophy, Plus, Trash2, Pencil,
    MapPin, Globe, Github, Linkedin, Loader2, Code2, CheckCircle
} from "lucide-react";

interface ProfileEditModalProps {
    open: boolean;
    onClose: () => void;
    initialTab?: "bio" | "skills" | "experience" | "education" | "projects";
    refreshProfile?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

type Tab = "bio" | "skills" | "experience" | "education" | "projects";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "bio", label: "Bio & Info", icon: User },
    { id: "skills", label: "Skills", icon: Code2 },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Trophy },
];

// ─── Inline input helpers ──────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50 ${props.className ?? ""}`}
    />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={`w-full bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground/50 ${props.className ?? ""}`}
    />
);

// ─── Main Modal ────────────────────────────────────────────────────────────
export const ProfileEditModal = ({ open, onClose, initialTab = "bio", refreshProfile }: ProfileEditModalProps) => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [saving, setSaving] = useState(false);

    // Bio fields
    const [bio, setBio] = useState(user?.bio || "");
    const [displayName, setDisplayName] = useState(user?.display_name || "");
    const [location, setLocation] = useState<string>("");
    const [website, setWebsite] = useState<string>("");
    const [githubUrl, setGithubUrl] = useState<string>("");
    const [linkedinUrl, setLinkedinUrl] = useState<string>("");
    const [experienceLevel, setExperienceLevel] = useState<string>("");

    // Dynamic sections
    const [experience, setExperience] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);

    // Skills
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    // Sync when user changes or modal opens
    useEffect(() => {
        if (user && open) {
            setBio(user.bio || "");
            setDisplayName(user.display_name || "");
        }
    }, [user, open]);

    // Fetch full profile data (includes profile sub-fields)
    useEffect(() => {
        if (!open || !token) return;
        const fetchProfile = async () => {
            try {
                const resp = await fetch(`${API_URL}/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setLocation(data.location || "");
                    setWebsite(data.website || "");
                    setGithubUrl(data.github_url || "");
                    setLinkedinUrl(data.linkedin_url || "");
                    setExperienceLevel(data.experience_level || "");
                    setExperience(data.experience_data || []);
                    setEducation(data.education_data || []);
                    setProjects(data.projects_data || []);
                    setSkills((data.skills || []).map((s: any) => s.name || s));
                }
            } catch { /* silent */ }
        };
        fetchProfile();
    }, [open, token]);

    useEffect(() => {
        if (open) setActiveTab(initialTab);
    }, [initialTab, open]);

    const save = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const payload: Record<string, any> = {
                bio,
                display_name: displayName,
                location,
                website,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                experience_level: experienceLevel,
                experience_data: experience,
                education_data: education,
                projects_data: projects,
            };

            const resp = await fetch(`${API_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                toast.success("Profile saved!", { icon: "✅" });
                refreshProfile?.();
                onClose();
            } else {
                const data = await resp.json();
                toast.error(data.detail || "Failed to save profile");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <div>
                                    <h2 className="font-bold text-lg font-display">Edit Profile</h2>
                                    <p className="text-xs text-muted-foreground">Update your Nexora profile</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={save}
                                        disabled={saving}
                                        className="gap-2 bg-primary hover:bg-primary/90"
                                    >
                                        {saving
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Save className="w-4 h-4" />}
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={onClose}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 px-6 pt-4 overflow-x-auto scrollbar-hide">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                            activeTab === tab.id
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                                {/* ── BIO TAB ── */}
                                {activeTab === "bio" && (
                                    <div className="space-y-4">
                                        <Field label="Display Name">
                                            <Input
                                                value={displayName}
                                                onChange={e => setDisplayName(e.target.value)}
                                                placeholder="Your display name"
                                            />
                                        </Field>
                                        <Field label="Bio">
                                            <Textarea
                                                rows={4}
                                                value={bio}
                                                onChange={e => setBio(e.target.value)}
                                                placeholder="Tell the world about yourself..."
                                                maxLength={500}
                                            />
                                            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                                        </Field>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Location">
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9"
                                                        value={location}
                                                        onChange={e => setLocation(e.target.value)}
                                                        placeholder="City, Country"
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="Website">
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9"
                                                        value={website}
                                                        onChange={e => setWebsite(e.target.value)}
                                                        placeholder="https://yoursite.com"
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="GitHub URL">
                                                <div className="relative">
                                                    <Github className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9"
                                                        value={githubUrl}
                                                        onChange={e => setGithubUrl(e.target.value)}
                                                        placeholder="github.com/username"
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="LinkedIn URL">
                                                <div className="relative">
                                                    <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9"
                                                        value={linkedinUrl}
                                                        onChange={e => setLinkedinUrl(e.target.value)}
                                                        placeholder="linkedin.com/in/username"
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                        <Field label="Experience Level">
                                            <div className="flex gap-2 flex-wrap">
                                                {["Beginner", "Intermediate", "Advanced", "Expert"].map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => setExperienceLevel(lvl)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                            experienceLevel === lvl
                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                                        }`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                    </div>
                                )}

                                {/* ── SKILLS TAB ── */}
                                {activeTab === "skills" && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Add your skills to match with peers and unlock messaging.
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newSkill}
                                                onChange={e => setNewSkill(e.target.value)}
                                                placeholder="e.g. React, Python, UI Design..."
                                                onKeyDown={e => {
                                                    if (e.key === "Enter" && newSkill.trim()) {
                                                        if (!skills.includes(newSkill.trim())) {
                                                            setSkills(prev => [...prev, newSkill.trim()]);
                                                        }
                                                        setNewSkill("");
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                                                        setSkills(prev => [...prev, newSkill.trim()]);
                                                        setNewSkill("");
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[80px] p-3 rounded-xl border border-border/50 bg-muted/10">
                                            {skills.length === 0 ? (
                                                <p className="text-xs text-muted-foreground self-center w-full text-center">
                                                    No skills added yet. Type above and press Enter.
                                                </p>
                                            ) : (
                                                skills.map(skill => (
                                                    <Badge
                                                        key={skill}
                                                        variant="secondary"
                                                        className="gap-1 pr-1 group text-sm"
                                                    >
                                                        <CheckCircle className="w-3 h-3 text-primary" />
                                                        {skill}
                                                        <button
                                                            className="ml-1 opacity-50 group-hover:opacity-100 hover:text-destructive transition-all"
                                                            onClick={() => setSkills(s => s.filter(x => x !== skill))}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            💡 Tip: Users who share your skills can message you directly without a connection request.
                                        </p>
                                    </div>
                                )}

                                {/* ── EXPERIENCE TAB ── */}
                                {activeTab === "experience" && (
                                    <DynamicSection
                                        title="Work Experience"
                                        items={experience}
                                        onChange={setExperience}
                                        fields={[
                                            { key: "role", label: "Job Title", placeholder: "e.g. Senior Developer" },
                                            { key: "company", label: "Company", placeholder: "e.g. Nexora Inc." },
                                            { key: "period", label: "Period", placeholder: "e.g. Jan 2023 – Present" },
                                            { key: "description", label: "Description", placeholder: "What did you accomplish?", multiline: true },
                                        ]}
                                        emptyLabel="No experience added"
                                        addLabel="Add Experience"
                                    />
                                )}

                                {/* ── EDUCATION TAB ── */}
                                {activeTab === "education" && (
                                    <DynamicSection
                                        title="Education"
                                        items={education}
                                        onChange={setEducation}
                                        fields={[
                                            { key: "degree", label: "Degree / Certification", placeholder: "e.g. BSc Computer Science" },
                                            { key: "school", label: "Institution", placeholder: "e.g. MIT" },
                                            { key: "period", label: "Period", placeholder: "e.g. 2019 – 2023" },
                                            { key: "description", label: "Notes (optional)", placeholder: "GPA, activities, highlights...", multiline: true },
                                        ]}
                                        emptyLabel="No education added"
                                        addLabel="Add Education"
                                    />
                                )}

                                {/* ── PROJECTS TAB ── */}
                                {activeTab === "projects" && (
                                    <DynamicSection
                                        title="Featured Projects"
                                        items={projects}
                                        onChange={setProjects}
                                        fields={[
                                            { key: "title", label: "Project Name", placeholder: "e.g. Nexora Platform" },
                                            { key: "description", label: "Description", placeholder: "What does it do? What tech did you use?", multiline: true },
                                            { key: "link", label: "URL (optional)", placeholder: "https://github.com/..." },
                                            { key: "tags", label: "Tags (comma-separated)", placeholder: "React, Python, FastAPI" },
                                        ]}
                                        emptyLabel="No projects showcased"
                                        addLabel="Add Project"
                                        transformOnSave={(item) => ({
                                            ...item,
                                            tags: typeof item.tags === "string"
                                                ? item.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                                                : item.tags
                                        })}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ─── Generic Dynamic Section ────────────────────────────────────────────────
interface DynamicField {
    key: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
}

const DynamicSection = ({
    title, items, onChange, fields, emptyLabel, addLabel, transformOnSave
}: {
    title: string;
    items: any[];
    onChange: (items: any[]) => void;
    fields: DynamicField[];
    emptyLabel: string;
    addLabel: string;
    transformOnSave?: (item: any) => any;
}) => {
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState<Record<string, string>>({});

    const startAdd = () => {
        const blank: Record<string, string> = {};
        fields.forEach(f => { blank[f.key] = ""; });
        setDraft(blank);
        setEditing(-1); // -1 = new item
    };

    const startEdit = (i: number) => {
        const raw = items[i];
        const d: Record<string, string> = {};
        fields.forEach(f => {
            d[f.key] = Array.isArray(raw[f.key]) ? raw[f.key].join(", ") : (raw[f.key] ?? "");
        });
        setDraft(d);
        setEditing(i);
    };

    const saveEdit = () => {
        if (editing === null) return;
        const item = { ...draft };
        const transformed = transformOnSave ? transformOnSave(item) : item;
        if (editing === -1) {
            onChange([...items, transformed]);
        } else {
            const updated = [...items];
            updated[editing] = transformed;
            onChange(updated);
        }
        setEditing(null);
        setDraft({});
    };

    const remove = (i: number) => {
        onChange(items.filter((_, idx) => idx !== i));
    };

    return (
        <div className="space-y-4">
            {items.length === 0 && editing === null ? (
                <div className="py-12 text-center border border-dashed border-border/50 rounded-xl bg-muted/5">
                    <p className="text-muted-foreground mb-4">{emptyLabel}</p>
                    <Button size="sm" onClick={startAdd} className="gap-2">
                        <Plus className="w-4 h-4" /> {addLabel}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {items.map((item, i) => (
                            <div key={i} className={`border rounded-xl transition-all ${editing === i ? "border-primary/50 bg-primary/5" : "border-border/50 bg-muted/10 hover:border-border"}`}>
                                {editing === i ? (
                                    <div className="p-4 space-y-3">
                                        {fields.map(f => (
                                            <div key={f.key} className="space-y-1">
                                                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                                                {f.multiline ? (
                                                    <Textarea
                                                        rows={3}
                                                        value={draft[f.key] ?? ""}
                                                        onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={draft[f.key] ?? ""}
                                                        onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex gap-2 pt-1">
                                            <Button size="sm" onClick={saveEdit} className="gap-1">
                                                <Save className="w-3 h-3" /> Save
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setDraft({}); }}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm">
                                                {item.role || item.degree || item.title || "(untitled)"}
                                            </p>
                                            {(item.company || item.school) && (
                                                <p className="text-xs text-primary">{item.company || item.school}</p>
                                            )}
                                            {item.period && <p className="text-xs text-muted-foreground">{item.period}</p>}
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(i)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => remove(i)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add new  */}
                    {editing === -1 ? (
                        <div className="border border-primary/40 rounded-xl p-4 bg-primary/5 space-y-3">
                            {fields.map(f => (
                                <div key={f.key} className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                                    {f.multiline ? (
                                        <Textarea
                                            rows={3}
                                            value={draft[f.key] ?? ""}
                                            onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                        />
                                    ) : (
                                        <Input
                                            value={draft[f.key] ?? ""}
                                            onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                                <Button size="sm" onClick={saveEdit} className="gap-1">
                                    <Plus className="w-3 h-3" /> Add
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setDraft({}); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button size="sm" variant="outline" onClick={startAdd} className="gap-2 w-full border-dashed hover:border-primary/50">
                            <Plus className="w-4 h-4" /> {addLabel}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
