import { Calendar, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EVENTS: any[] = []; // Cleared data for production

export const CommunityEventsTab = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {/* Create Event Card */}
            <div className="md:col-span-2 bg-gradient-to-r from-neon-purple/20 to-blue-900/20 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Host a Community Event</h3>
                    <p className="text-sm text-gray-300">Organize a workshop, hackathon, or study group. Engage with the community!</p>
                </div>
                <Button className="bg-white text-black hover:bg-gray-200">Create Event</Button>
            </div>

            {EVENTS.length === 0 ? (
                <div className="md:col-span-2 py-20 text-center glass-card border-white/5 bg-white/5">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold text-white mb-2">No Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">Stay tuned! New hackathons and workshops are being organized.</p>
                </div>
            ) : EVENTS.map(event => (
                <div key={event.id} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                    <div className="h-40 relative overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                        <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="backdrop-blur-md bg-black/50 border-white/10 text-white">
                                {event.type}
                            </Badge>
                        </div>
                        {event.isLive && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                                <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        <div className="flex gap-2 mb-3">
                            {event.tags.map(tag => (
                                <span key={tag} className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h3 className="font-bold text-lg text-white mb-2 leading-tight">{event.title}</h3>

                        <div className="space-y-2 mb-5">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4 text-primary" />
                                {event.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Users className="w-4 h-4 text-blue-400" />
                                {event.participants} registered
                            </div>
                            {event.prize && (
                                <div className="flex items-center gap-2 text-sm text-yellow-500 font-medium">
                                    <Trophy className="w-4 h-4" />
                                    Prize: {event.prize}
                                </div>
                            )}
                        </div>

                        <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-primary/50 group-hover:text-primary transition-all">
                            View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
