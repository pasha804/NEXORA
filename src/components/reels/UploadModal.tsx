import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Video, Music, Type, Hash, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
    const [step, setStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [details, setDetails] = useState({
        caption: "",
        tags: "",
        skill: "General",
        type: "showcase"
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStep(2);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStep(2);
        }
    };

    const handlePublish = async () => {
        const token = localStorage.getItem("access_token");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

        try {
            const videoUrl = file ? URL.createObjectURL(file) : "";
            const resp = await fetch(`${API_URL}/reels/upload`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    video_url: videoUrl,
                    caption: details.caption,
                    type: details.type,
                    skill_tags: details.tags ? details.tags.split(",").map((t) => t.trim().replace(/^#/, "")) : [],
                    title: details.caption.slice(0, 80),
                }),
            });

            if (resp.ok) {
                toast.success("Reel published successfully!");
                onClose();
                setTimeout(() => {
                    setStep(1);
                    setFile(null);
                    setDetails({ caption: "", tags: "", skill: "General", type: "showcase" });
                }, 500);
            } else {
                const errData = await resp.json().catch(() => ({}));
                toast.error(errData.detail || "Failed to publish reel");
            }
        } catch (err) {
            toast.error("Network error while publishing reel");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-background/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-50 rounded-full bg-black/20 hover:bg-black/40 text-white"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        {/* Preview Section */}
                        <div className="w-full md:w-5/12 bg-black flex items-center justify-center relative border-r border-border/50">
                            {file ? (
                                <div className="w-full h-full relative">
                                    {/* Video Preview */}
                                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-500">
                                        <Video className="w-16 h-16 opacity-50 mb-4" />
                                        <p className="absolute bottom-10 left-0 right-0 text-center text-sm text-zinc-400">
                                            Preview: {file.name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                        <Video className="w-10 h-10 text-zinc-500" />
                                    </div>
                                    <h3 className="font-display font-bold text-xl text-white">Upload Reel</h3>
                                    <p className="text-zinc-400 text-sm max-w-[200px] mx-auto">
                                        Share your coding clips, tutorials, or dev humor.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Form Section */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {step === 1 ? (
                                <div
                                    className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all ${dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="reel-upload"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                    <Label htmlFor="reel-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center p-8">
                                        <Upload className="w-12 h-12 text-primary mb-4" />
                                        <span className="font-bold text-lg mb-2">Drag & drop or browse</span>
                                        <span className="text-sm text-muted-foreground">MP4, MOV up to 60s</span>
                                        <Button variant="hero" className="mt-6 pointer-events-none">Select Video</Button>
                                    </Label>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">2</span>
                                        <h2 className="font-display text-xl font-bold">Add Details</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Caption</Label>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Write a catchy caption..."
                                                    className="min-h-[100px] resize-none bg-muted/50 pr-10"
                                                    value={details.caption}
                                                    onChange={(e) => setDetails({ ...details, caption: e.target.value })}
                                                />
                                                <Type className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Skill Domain</Label>
                                                <select
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={details.skill}
                                                    onChange={(e) => setDetails({ ...details, skill: e.target.value })}
                                                >
                                                    <option value="General">General</option>
                                                    <option value="React">React</option>
                                                    <option value="Python">Python</option>
                                                    <option value="Rust">Rust</option>
                                                    <option value="UI/UX">UI/UX</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reel Type</Label>
                                                <select
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={details.type}
                                                    onChange={(e) => setDetails({ ...details, type: e.target.value })}
                                                >
                                                    <option value="showcase">Showcase</option>
                                                    <option value="tutorial">Tutorial</option>
                                                    <option value="challenge">PvP Challenge</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Add tags (e.g. #coding #tech)..."
                                                    className="bg-muted/50 pl-9"
                                                    value={details.tags}
                                                    onChange={(e) => setDetails({ ...details, tags: e.target.value })}
                                                />
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>

                                        {details.type === "challenge" && (
                                            <div className="p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/20 space-y-3">
                                                <div className="flex items-center gap-2 text-neon-purple font-bold text-sm">
                                                    <Shield className="w-4 h-4" />
                                                    PvP Configuration
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span>XP Reward</span>
                                                        <span className="text-neon-green">50 XP</span>
                                                    </div>
                                                    <Slider defaultValue={[50]} max={100} step={10} className="py-2" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                                            <Button variant="hero" className="flex-1" onClick={handlePublish}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Publish Reel
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
