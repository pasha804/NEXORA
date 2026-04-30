import { create } from 'zustand';

export interface Post {
    id: number;
    author_id: number;
    author_name?: string;
    author_username?: string;
    author_avatar?: string;
    post_type: string;
    content: string;
    media_url?: string;
    skill_tags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    is_read?: boolean;
    virality_score?: number;
    is_viral?: boolean;
    achievement?: {
        title: string;
        xpGained: number;
        badge: string;
    };
    poll?: {
        question: string;
        options: { text: string; votes: number }[];
        totalVotes: number;
    };
    learning?: {
        skill: string;
        progress: number;
        milestone: string;
    };
}

interface FeedStore {
    posts: Post[];
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    updatePost: (postId: number, updates: Partial<Post>) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
    posts: [],
    setPosts: (posts) => set({ posts }),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
    })),
}));
