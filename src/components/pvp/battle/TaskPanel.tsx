
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, FileCode, CheckCircle2 } from "lucide-react";

interface Challenge {
    title: string;
    description: string;
    difficulty: string;
    time_limit: number;
    xp_reward: number;
}

interface TaskPanelProps {
    challenge: Challenge;
}

export const TaskPanel = ({ challenge }: TaskPanelProps) => {
    return (
        <div className="flex flex-col h-full bg-black/40 border-r border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="border-neon-blue text-neon-blue bg-neon-blue/10">
                        {challenge.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {challenge.time_limit}m
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neon-purple">
                        <Trophy className="w-3 h-3" /> {challenge.xp_reward} XP
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white font-display mb-2">{challenge.title}</h2>
            </div>

            {/* Description */}
            <ScrollArea className="flex-1 p-6">
                <div className="prose prose-invert max-w-none prose-sm">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-neon-green" /> Problem Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                        {challenge.description}
                    </p>

                    <div className="bg-zinc-900/80 p-4 rounded-lg border border-white/5 mb-6">
                        <h4 className="text-sm font-bold text-white mb-2">Example 1:</h4>
                        <code className="text-xs text-gray-400 block font-mono">
                            Input: nums = [2,7,11,15], target = 9 <br />
                            Output: [0,1] <br />
                            Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                        </code>
                    </div>

                    <div className="bg-zinc-900/80 p-4 rounded-lg border border-white/5 mb-6">
                        <h4 className="text-sm font-bold text-white mb-2">Constraints:</h4>
                        <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                            <li>2 &lt;= nums.length &lt;= 10^4</li>
                            <li>-10^9 &lt;= nums[i] &lt;= 10^9</li>
                            <li>-10^9 &lt;= target &lt;= 10^9</li>
                        </ul>
                    </div>
                </div>
            </ScrollArea>

            {/* Requirements Footer */}
            <div className="p-4 bg-black/60 border-t border-white/10">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Success Criteria</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3 h-3 text-neon-green" /> Time Complexity: O(n)
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3 h-3 text-neon-green" /> Space Complexity: O(n)
                    </div>
                </div>
            </div>
        </div>
    );
};
