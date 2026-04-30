import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Link as LinkIcon, PlayCircle, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const CommunityLearningTab = () => {
    return (
        <div className="space-y-8 pb-20">
            {/* Featured Roadmap */}
            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4" /> Official Roadmap
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Master React 2026</h2>
                    <p className="text-gray-300 max-w-xl mb-6">A comprehensive path from beginner to expert, curated by community mentors. Includes Server Components, Suspense, and AI integration.</p>
                    <div className="flex gap-4">
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">Start Learning</Button>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">View Details</Button>
                    </div>
                </div>
                {/* Decorative background elements would go here */}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" /> Curated Resources
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-10 text-center">
                        <LinkIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-sm text-muted-foreground">Resources are being curated by community leads.</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" /> Top Mentors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-10 text-center">
                        <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-sm text-muted-foreground">Mentor verified program is launching soon.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Video Tutorials */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Community Tutorials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 text-center border border-dashed border-white/10 rounded-xl py-10">
                    <div className="col-span-full">
                        <PlayCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-sm text-muted-foreground">No tutorials found for this community.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
