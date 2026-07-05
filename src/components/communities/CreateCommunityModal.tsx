import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Sparkles, Globe, Lock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const CreateCommunityModal = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        slug: "",
        privacy: "public"
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleLaunch = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return toast.error("Please login first");
        setSubmitting(true);
        try {
            const resp = await fetch(`${API_URL}/communities/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
                    privacy: formData.privacy,
                }),
            });
            if (resp.ok) {
                const community = await resp.json();
                toast.success(`Community "${community.name}" created!`);
                setOpen(false);
                navigate(`/communities/${community.slug}`);
                setStep(1);
                setFormData({ name: "", description: "", slug: "", privacy: "public" });
            } else {
                const err = await resp.json().catch(() => ({}));
                toast.error(err.detail || "Failed to create community");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                    <Plus className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[500px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Create Community
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 min-h-[300px] relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-white">Community Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Rust Enthusiasts"
                                        className="bg-zinc-900/50 border-white/10 text-white"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">This will be the public name of your community.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-white">URL Slug</Label>
                                    <div className="flex items-center text-sm text-muted-foreground bg-zinc-900/50 rounded-md border border-white/10 px-3 h-10">
                                        nexora.io/c/
                                        <input
                                            className="bg-transparent border-none outline-none text-white ml-1 flex-1"
                                            placeholder="rust-enthusiasts"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label className="text-white">Banner & Logo</Label>
                                    <div className="h-32 bg-zinc-900 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                                        <Upload className="w-6 h-6 mb-2" />
                                        <span className="text-xs">Upload Banner Image</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc" className="text-white">Description</Label>
                                    <Textarea
                                        id="desc"
                                        placeholder="What is this community about?"
                                        className="bg-zinc-900/50 border-white/10 text-white h-24 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Label className="text-white">Privacy Setting</Label>
                                    <div
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.privacy === 'public' ? 'bg-primary/10 border-primary' : 'bg-zinc-900 border-white/10 hover:border-white/20'}`}
                                        onClick={() => setFormData({ ...formData, privacy: 'public' })}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Public Community</p>
                                                <p className="text-xs text-muted-foreground">Anyone can view posts and join.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.privacy === 'private' ? 'bg-primary/10 border-primary' : 'bg-zinc-900 border-white/10 hover:border-white/20'}`}
                                        onClick={() => setFormData({ ...formData, privacy: 'private' })}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Private Community</p>
                                                <p className="text-xs text-muted-foreground">Only invited members can join.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="ghost" onClick={handleBack} className="text-muted-foreground hover:text-white">
                                Back
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button onClick={handleNext} disabled={!formData.name}>
                                Continue
                            </Button>
                        ) : (
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90" onClick={handleLaunch} disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                {submitting ? "Creating..." : "Launch Community"}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
