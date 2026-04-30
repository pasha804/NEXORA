import { Message } from "@/types/messaging";
import { format } from "date-fns";
import { Check, CheckCheck, FileText, Download, Code, Terminal, Play } from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
// Register simple languages if needed, or rely on default light import (might need full if not pre-configured)

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar: boolean;
    senderName?: string;
    senderAvatar?: string;
}

export const MessageBubble = ({ message, isOwn, showAvatar, senderName, senderAvatar }: MessageBubbleProps) => {
    return (
        <div className={`group flex gap-3 mb-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                {senderAvatar ? <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">{senderName?.[0]}</span>}
            </div>

            <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                {/* Sender Name (only in groups usually, but good to have logic) */}
                {!isOwn && showAvatar && (
                    <span className="text-[10px] text-muted-foreground ml-1 mb-1">{senderName}</span>
                )}

                {/* Bubble Content */}
                <div
                    className={`relative px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all
            ${isOwn
                            ? "bg-primary/20 border border-primary/30 text-white rounded-tr-none hover:bg-primary/25 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                            : "bg-zinc-900/80 border border-white/5 text-zinc-100 rounded-tl-none hover:bg-zinc-800/80"
                        }
          `}
                >
                    {/* Text Message */}
                    {message.type === 'text' && (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}

                    {/* Image Message */}
                    {message.type === 'image' && (
                        <div className="rounded-lg overflow-hidden my-1 border border-white/10 relative group/image cursor-pointer">
                            {/* Placeholder for actual image if URL provided, using content as alt text desc or placeholder */}
                            <div className="bg-black/50 aspect-video flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">Image: {message.content}</span>
                            </div>
                        </div>
                    )}

                    {/* Code Message */}
                    {message.type === 'code' && (
                        <div className="mt-1 w-full min-w-[300px] rounded-lg overflow-hidden border border-white/10 bg-[#282c34]">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/50 border-b border-white/5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Terminal className="w-3 h-3" />
                                    <span>{message.metadata?.codeLanguage || 'Code'}</span>
                                </div>
                                <button className="text-[10px] text-primary hover:underline">Copy</button>
                            </div>
                            <div className="p-2 text-xs overflow-x-auto">
                                <SyntaxHighlighter
                                    language={message.metadata?.codeLanguage || 'javascript'}
                                    style={atomOneDark}
                                    customStyle={{ background: 'transparent', padding: 0 }}
                                >
                                    {message.content}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {/* PvP Challenge */}
                    {message.type === 'pvp-challenge' && (
                        <div className="flex flex-col gap-2 p-1 min-w-[240px]">
                            <div className="flex items-center gap-2 text-primary font-bold font-display uppercase tracking-wider text-xs border-b border-primary/20 pb-1 mb-1">
                                <span className="text-lg">⚔️</span> PvP Challenge
                            </div>
                            <div className="bg-black/40 rounded p-2 border border-white/5">
                                <h4 className="font-bold text-white">{message.metadata?.challengeData?.title || "Quick Match"}</h4>
                                <p className="text-xs text-muted-foreground my-1">{message.metadata?.challengeData?.description}</p>
                                <div className="flex items-center justify-between mt-2 text-[10px]">
                                    <span className="text-yellow-400">🏆 {message.metadata?.challengeData?.prize}</span>
                                    <span className="text-red-400 font-bold uppercase">{message.metadata?.challengeData?.difficulty}</span>
                                </div>
                            </div>
                            <button className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded font-medium text-xs transition-all uppercase flex items-center justify-center gap-2">
                                <Play className="w-3 h-3" /> Accept Challenge
                            </button>
                        </div>
                    )}

                    {/* File Message */}
                    {message.type === 'file' && (
                        <div className="flex items-center gap-3 p-1 min-w-[200px]">
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.metadata?.fileName || message.content}</p>
                                <p className="text-xs text-muted-foreground">{message.metadata?.fileSize ? Math.round(message.metadata.fileSize / 1024) + ' KB' : 'Unknown size'}</p>
                            </div>
                            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-primary">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Meta Information (Time + Status) */}
                    <div className="flex items-center justify-end gap-1 mt-1.5 opacity-60">
                        <span className="text-[10px]">{format(new Date(message.createdAt), 'h:mm a')}</span>
                        {isOwn && (
                            <span className="text-primary">
                                {message.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
