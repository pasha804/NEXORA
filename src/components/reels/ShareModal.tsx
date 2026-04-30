import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Twitter, Facebook, Linkedin, Mail, Link2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    reelUrl: string; // The URL to share
}

const FRIENDS: any[] = [];

export const ShareModal = ({ isOpen, onClose, reelUrl }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(reelUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border border-white/10 text-white p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-white/10 bg-zinc-900/50">
                    <DialogTitle className="text-center">Share to</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Direct Share to Friends */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Send to friends</p>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            <p className="text-xs text-muted-foreground italic">Connect with people to share directly.</p>
                        </div>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Share via</p>
                        <div className="flex justify-between gap-2">
                            {[
                                { icon: Twitter, label: "Twitter", color: "bg-[#1DA1F2]/20 text-[#1DA1F2]" },
                                { icon: Facebook, label: "Facebook", color: "bg-[#4267B2]/20 text-[#4267B2]" },
                                { icon: Linkedin, label: "LinkedIn", color: "bg-[#0077b5]/20 text-[#0077b5]" },
                                { icon: Mail, label: "Email", color: "bg-orange-500/20 text-orange-500" },
                            ].map((social, idx) => (
                                <button key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${social.color} group-hover:scale-110 transition-transform`}>
                                        <social.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{social.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Copy Link */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Link</p>
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-white/10">
                            <div className="p-2 bg-white/5 rounded-md">
                                <Link2 className="w-4 h-4 text-white/60" />
                            </div>
                            <p className="text-xs text-white/60 truncate flex-1 font-mono">{reelUrl}</p>
                            <Button size="sm" onClick={handleCopy} className={`h-8 px-4 font-bold ${copied ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-white text-black hover:bg-white/90"}`}>
                                {copied ? <Check className="w-4 h-4" /> : "Copy"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
