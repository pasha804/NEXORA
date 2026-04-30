import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Zap, Code, Gamepad2, Briefcase, GraduationCap,
    CheckCircle2, Search, Plus, X, ArrowRight, ArrowLeft,
    User as UserIcon, Shield, Target, Users, Camera, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user, loading, saveOnboardingSkills, saveOnboardingInterests, completeOnboarding } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user?.onboarding_completed) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl w-full z-10">
                <AnimatePresence mode="wait">
                    {step === 1 && <StepIdentity onNext={nextStep} key="step1" />}
                    {step === 2 && <StepSkills onNext={nextStep} onBack={prevStep} key="step2" />}
                    {step === 3 && <StepInterests onNext={nextStep} onBack={prevStep} key="step3" />}
                    {step === 4 && <StepProfile onBack={prevStep} key="step4" />}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${s === step ? "bg-primary shadow-[0_0_10px_hsl(var(--primary))]" : s < step ? "bg-primary/40" : "bg-muted-foreground/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- STEP 1: IDENTITY ---
const StepIdentity = ({ onNext }: { onNext: () => void }) => {
    const { user, updateUser } = useAuth();
    const [preview, setPreview] = useState<string | null>(user?.avatar_url || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                // In a real app, you'd upload here. For now, we update local context
                updateUser({ avatar_url: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-card p-8 md:p-12 text-center"
        >
            <div className="relative w-32 h-32 mx-auto mb-8 group">
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-4 border-primary/20 p-1 overflow-hidden transition-all group-hover:border-primary/50">
                    {preview ? (
                        <img src={preview} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground p-4">
                            <UserIcon className="w-10 h-10 mb-1" />
                            <span className="text-[10px] font-bold uppercase">No Photo</span>
                        </div>
                    )}
                </div>

                <label className="absolute bottom-0 right-0 p-3 bg-primary rounded-full text-primary-foreground shadow-2xl cursor-pointer hover:scale-110 transition-transform active:scale-95">
                    <Camera className="w-5 h-5" />
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>

                {/* Decorative ring */}
                <div className="absolute -inset-2 rounded-full border border-primary/10 animate-pulse pointer-events-none" />
            </div>

            <h1 className="font-display text-4xl font-bold mb-4">
                Welcome, <span className="text-glow font-display uppercase tracking-tighter">{user?.display_name || user?.username || "Pioneer"}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
                Your account is ready. Add a profile picture to personalize your Nexus identity.
            </p>
            <Button onClick={onNext} variant="hero" size="lg" className="w-full md:w-auto min-w-[240px] text-lg">
                Continue to Skills <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </motion.div>
    );
};

// --- STEP 2: SKILLS ---
const StepSkills = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
    const { saveOnboardingSkills } = useAuth();
    const [selectedSkills, setSelectedSkills] = useState<{ name: string, level: string, xp: number }[]>([]);
    const [customSkill, setCustomSkill] = useState("");

    const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert", "Legend"];
    const suggestions = ["React", "TypeScript", "Node.js", "Python", "UI/UX", "Rust", "Solidity", "Go", "AWS", "Docker"];

    const toggleSkill = (name: string) => {
        if (selectedSkills.find(s => s.name === name)) {
            setSelectedSkills(prev => prev.filter(s => s.name !== name));
        } else if (selectedSkills.length < 8) {
            setSelectedSkills(prev => [...prev, { name, level: "Intermediate", xp: 1000 }]);
        } else {
            toast.error("Maximum 8 skills allowed");
        }
    };

    const updateSkillLevel = (name: string, level: string) => {
        setSelectedSkills(prev => prev.map(s => s.name === name ? { ...s, level } : s));
    };

    const handleAddCustom = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (customSkill && !selectedSkills.find(s => s.name.toLowerCase() === customSkill.toLowerCase())) {
            toggleSkill(customSkill);
            setCustomSkill("");
        }
    };

    const handleNext = async () => {
        if (selectedSkills.length === 0) {
            toast.error("Please add at least one skill");
            return;
        }
        try {
            await saveOnboardingSkills(selectedSkills);
            onNext();
        } catch (e) {
            toast.error("Failed to save skills");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-card p-8 md:p-12 w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
            <h2 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Code className="text-secondary w-8 h-8" /> Select Skills
            </h2>
            <p className="text-muted-foreground mb-6">Select up to 8 skills. Your dashboard and matches will adapt to these.</p>

            {/* Selected Skills with Level Adjusters */}
            <div className="space-y-4 mb-8">
                {selectedSkills.map(skill => (
                    <div key={skill.name} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/20 border border-white/5">
                        <div className="flex justify-between items-center">
                            <span className="font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-secondary" /> {skill.name}
                            </span>
                            <button onClick={() => toggleSkill(skill.name)} className="text-muted-foreground hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {skillLevels.map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => updateSkillLevel(skill.name, lvl)}
                                    className={`px-3 py-1 rounded-full text-xs transition-all ${skill.level === lvl ? "bg-secondary text-black font-bold" : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                                <span>Skill XP</span>
                                <span>{skill.xp} XP</span>
                            </div>
                            <Slider
                                value={[skill.xp]}
                                max={5000}
                                step={50}
                                onValueChange={(val) => {
                                    setSelectedSkills(prev => prev.map(s => s.name === skill.name ? { ...s, xp: val[0] } : s));
                                }}
                                className="py-2"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search/Add Custom */}
            <form onSubmit={handleAddCustom} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Add a custom skill..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        className="pl-9 bg-muted/30 border-white/10"
                    />
                </div>
                <Button type="submit" variant="outline" size="icon" className="shrink-0">
                    <Plus className="w-5 h-5" />
                </Button>
            </form>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-8">
                {suggestions.filter(s => !selectedSkills.find(ss => ss.name === s)).map(s => (
                    <Badge
                        key={s}
                        onClick={() => toggleSkill(s)}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/40 transition-colors py-1.5 px-3"
                    >
                        {s} +
                    </Badge>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button onClick={onBack} variant="ghost">Back</Button>
                <Button onClick={handleNext} disabled={selectedSkills.length === 0} variant="hero" size="lg">
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </motion.div>
    );
};

// --- STEP 3: INTERESTS ---
const StepInterests = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
    const { saveOnboardingInterests } = useAuth();
    const [selected, setSelected] = useState<string[]>([]);

    const tags = ["AI", "Blockchain", "FinTech", "GameDev", "Web3", "CyberSecurity", "Machine Learning", "Mobile Apps", "Cloud", "SaaS", "Open Source", "Design"];

    const toggle = (tag: string) => {
        setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleNext = async () => {
        if (selected.length < 2) {
            toast.error("Please select at least 2 interests");
            return;
        }
        try {
            await saveOnboardingInterests(selected);
            onNext();
        } catch (e) {
            toast.error("Failed to save interests");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-card p-8 md:p-12"
        >
            <h2 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Target className="text-neon-purple w-8 h-8" /> Interests & Goals
            </h2>
            <p className="text-muted-foreground mb-8">Choose area that excite you. We use this for AI recommendations.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => toggle(tag)}
                        className={`p-4 rounded-xl border text-center transition-all duration-200 ${selected.includes(tag)
                            ? "bg-neon-purple/20 border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                            }`}
                    >
                        <span className="font-medium text-sm">{tag}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button onClick={onBack} variant="ghost">Back</Button>
                <Button onClick={handleNext} disabled={selected.length < 2} variant="hero" size="lg">
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </motion.div>
    );
};

// --- STEP 4: PROFILE ---
const StepProfile = ({ onBack }: { onBack: () => void }) => {
    const { completeOnboarding } = useAuth();
    const navigate = useNavigate();
    const [bio, setBio] = useState("");
    const [goals, setGoals] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [collab, setCollab] = useState("Open to Collab");
    const [submitting, setSubmitting] = useState(false);

    const handleFinish = async () => {
        setSubmitting(true);
        try {
            await completeOnboarding({
                bio,
                learning_goals: goals,
                collaboration_preference: collab,
                is_private: isPrivate
            });
            toast.success("Welcome to NEXORA!");
            navigate("/dashboard");
        } catch (e) {
            toast.error("Failed to complete onboarding");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 md:p-12"
        >
            <h2 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Shield className="text-neon-green w-8 h-8" /> Final Touches
            </h2>
            <p className="text-muted-foreground mb-8">Tell us about yourself and set your privacy preferences.</p>

            <div className="space-y-6 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bio</label>
                    <Textarea
                        placeholder="Share your passion, experience, or what you're working on..."
                        className="bg-muted/30 border-white/10 resize-none h-24"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Learning Goals</label>
                    <Input
                        placeholder="What do you want to achieve in the next 3 months?"
                        className="bg-muted/30 border-white/10"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold">Collaboration</span>
                            <span className="text-xs text-muted-foreground">{collab}</span>
                        </div>
                    </div>
                    <select
                        value={collab}
                        onChange={(e) => setCollab(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs px-3 py-1 outline-none"
                    >
                        <option value="Open to Collab">Open to Collab</option>
                        <option value="Individual Only">Individual Only</option>
                        <option value="Mentor Mode">Mentor Mode</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-neon-green/10 text-neon-green">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block font-bold">Private Profile</span>
                            <span className="text-xs text-muted-foreground">Only friends can see your activity</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? "bg-neon-green" : "bg-muted"}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? "left-7" : "left-1"}`} />
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={onBack} variant="ghost" size="lg" className="flex-1">
                    Back
                </Button>
                <Button onClick={handleFinish} disabled={submitting} variant="hero" size="lg" className="flex-[2]">
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finalizing...
                        </>
                    ) : "Finish Set Up"}
                </Button>
            </div>
        </motion.div>
    );
};

export default Onboarding;
