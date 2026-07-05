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
    is_liked?: boolean;
    is_following_author?: boolean;
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
    skip: number;
    hasMore: boolean;
    setPosts: (posts: Post[]) => void;
    appendPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    updatePost: (postId: number, updates: Partial<Post>) => void;
    toggleLike: (postId: number) => void;
    setSkip: (skip: number) => void;
    setHasMore: (hasMore: boolean) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
    posts: [],
    skip: 0,
    hasMore: true,
    setPosts: (posts) => set({ posts, skip: posts.length, hasMore: posts.length === 20 }),
    appendPosts: (newPosts) => set((state) => ({
        posts: [...state.posts, ...newPosts],
        skip: state.skip + newPosts.length,
        hasMore: newPosts.length === 20,
    })),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
    })),
    toggleLike: (postId) => set((state) => ({
        posts: state.posts.map((p) =>
            p.id === postId ? {
                ...p,
                is_liked: !p.is_liked,
                likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
            } : p
        ),
    })),
    setSkip: (skip) => set({ skip }),
    setHasMore: (hasMore) => set({ hasMore }),
}));
