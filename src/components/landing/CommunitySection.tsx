import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  Mic, 
  Video, 
  Users, 
  MessageCircle,
  ChevronRight,
  Plus,
  Bell
} from "lucide-react";

const servers = [
  { name: "React Masters", members: "12.4K", icon: "⚛️", online: 847 },
  { name: "Python Dev Hub", members: "8.9K", icon: "🐍", online: 534 },
  { name: "Design System", members: "6.2K", icon: "🎨", online: 312 },
  { name: "AI/ML Lab", members: "5.7K", icon: "🤖", online: 445 },
];

const channels = [
  { name: "general", type: "text", icon: Hash, unread: 23 },
  { name: "code-review", type: "text", icon: Hash, unread: 8 },
  { name: "voice-collab", type: "voice", icon: Mic, active: true },
  { name: "live-coding", type: "video", icon: Video, active: false },
];

export const CommunitySection = () => {
  return (
    <section id="community" className="py-24 px-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Community
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Join Thriving{" "}
            <span className="gradient-text">Skill Communities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with like-minded professionals in skill-based servers. 
            Collaborate, learn, and grow together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Server List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Your Servers
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {servers.map((server, index) => (
                <motion.div
                  key={server.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-card to-muted flex items-center justify-center text-2xl">
                    {server.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {server.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {server.members}
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                      {server.online} online
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Channel View */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-electric-400 flex items-center justify-center text-xl">
                ⚛️
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  React Masters
                </h3>
                <p className="text-xs text-muted-foreground">
                  Advanced React patterns & best practices
                </p>
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                Channels
              </div>
              {channels.map((channel) => (
                <div
                  key={channel.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    channel.active 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <channel.icon className="w-4 h-4" />
                  <span className="flex-1 text-sm">{channel.name}</span>
                  {channel.unread && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {channel.unread}
                    </span>
                  )}
                  {channel.active && (
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            <Button variant="glass" className="w-full" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Conversation
            </Button>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </h3>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {[
                {
                  user: "Sarah K.",
                  action: "won a Code Clash against",
                  target: "Mike T.",
                  time: "2m ago",
                  avatar: "SK",
                },
                {
                  user: "Alex M.",
                  action: "shared a new project in",
                  target: "#showcase",
                  time: "15m ago",
                  avatar: "AM",
                },
                {
                  user: "Jordan L.",
                  action: "reached Level 25 in",
                  target: "Python",
                  time: "32m ago",
                  avatar: "JL",
                },
                {
                  user: "Taylor R.",
                  action: "started a live coding session",
                  target: "",
                  time: "1h ago",
                  avatar: "TR",
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-neon-purple/50 flex items-center justify-center text-xs font-bold shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      {activity.target && (
                        <span className="font-medium text-primary">{activity.target}</span>
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Activity
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
