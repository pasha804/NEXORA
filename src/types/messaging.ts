export interface User {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    skills: Skill[];
    onlineStatus: 'online' | 'away' | 'busy' | 'offline';
    lastSeen?: Date;
    currentActivity?: string;
    aiCompatibility?: number;
    isVerified: boolean;
}

export interface Skill {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    icon?: string;
}

export interface Reaction {
    emoji: string;
    userId: string;
    createdAt: Date;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
    voters: string[];
}

export interface ChallengeData {
    title: string;
    description: string;
    prize: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProjectInvite {
    projectId: string;
    projectName: string;
    description: string;
    techStack: string[];
    teamSize: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    type: 'text' | 'code' | 'image' | 'file' | 'voice' | 'video' |
    'pvp-challenge' | 'project-invite' | 'poll' | 'system';
    content: string;
    metadata?: {
        language?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        duration?: number;
        pollOptions?: PollOption[];
        challengeData?: ChallengeData;
        projectInvite?: ProjectInvite;
        codeLanguage?: string;
    };
    replyTo?: string;
    reactions: Reaction[];
    isEdited: boolean;
    isPinned: boolean;
    readBy: string[];
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export interface Conversation {
    id: string;
    type: 'direct' | 'group' | 'ai' | 'project' | 'community';
    participants: User[];
    recipient?: User; // Helper for direct chats
    name?: string; // For group chats
    lastMessage?: Message;
    messages: Message[];
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    skillMatch?: number;
    category: 'all' | 'friends' | 'skill-matches' | 'projects' | 'communities' | 'ai';
    typingUsers: string[];
    createdAt: Date;
    updatedAt: Date;
}

export type ConversationCategory = 'all' | 'friends' | 'skill-matches' | 'projects' | 'communities' | 'ai';

export type MessageSortOption = 'recent' | 'priority' | 'ai-suggested';
