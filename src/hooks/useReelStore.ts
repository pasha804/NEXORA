import { create } from 'zustand';
import type { Reel } from '@/types/reels';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('access_token');
}

interface ReelStore {
  reels: Reel[];
  skip: number;
  hasMore: boolean;
  isLoading: boolean;
  setReels: (reels: Reel[]) => void;
  appendReels: (reels: Reel[]) => void;
  addReel: (reel: Reel) => void;
  removeReel: (reelId: string) => void;
  toggleLike: (reelId: string) => void;
  toggleSave: (reelId: string) => void;
  updateReelComments: (reelId: string, delta: number) => void;
  setSkip: (skip: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  fetchReels: (reset?: boolean) => Promise<void>;
}

export const useReelStore = create<ReelStore>((set, get) => ({
  reels: [],
  skip: 0,
  hasMore: true,
  isLoading: false,

  setReels: (reels) => set({ reels, skip: reels.length, hasMore: reels.length === 20 }),
  appendReels: (newReels) => set((state) => ({
    reels: [...state.reels, ...newReels],
    skip: state.skip + newReels.length,
    hasMore: newReels.length === 20,
  })),
  addReel: (reel) => set((state) => ({ reels: [reel, ...state.reels] })),
  removeReel: (reelId) => set((state) => ({ reels: state.reels.filter((r) => r.id !== reelId) })),

  toggleLike: (reelId) => set((state) => ({
    reels: state.reels.map((r) =>
      r.id === reelId
        ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
        : r
    ),
  })),

  toggleSave: (reelId) => set((state) => ({
    reels: state.reels.map((r) =>
      r.id === reelId
        ? { ...r, isSaved: !r.isSaved, saves: r.isSaved ? r.saves - 1 : r.saves + 1 }
        : r
    ),
  })),

  updateReelComments: (reelId, delta) => set((state) => ({
    reels: state.reels.map((r) =>
      r.id === reelId ? { ...r, comments: r.comments + delta } : r
    ),
  })),

  setSkip: (skip) => set({ skip }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchReels: async (reset = false) => {
    const { skip, isLoading } = get();
    if (isLoading) return;
    set({ isLoading: true });

    try {
      const params = reset ? 'skip=0&limit=20' : `skip=${skip}&limit=20`;
      const resp = await fetch(`${API_URL}/reels/feed?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (resp.ok) {
        const data = await resp.json();
        const mapped = data.map((r: any) => ({
          id: r.id,
          type: r.type || 'project-showcase',
          videoUrl: r.video_url,
          thumbnailUrl: r.thumbnail_url,
          duration: 0,
          caption: r.caption || r.title || '',
          skillTags: r.skill_tags || [],
          likes: r.likes_count || 0,
          comments: r.comments_count || 0,
          shares: 0,
          saves: r.saves_count || 0,
          views: 0,
          isLiked: r.is_liked || false,
          isSaved: r.is_saved || false,
          createdAt: new Date(r.created_at),
          creator: {
            id: String(r.creator_id),
            username: r.creator?.username || 'anonymous',
            name: r.creator?.display_name || r.creator?.full_name || 'Nexus User',
            avatarUrl: r.creator?.avatar_url,
            isVerified: r.creator?.is_verified || false,
            isFollowed: false,
          },
        }));

        if (reset) {
          set({ reels: mapped, skip: mapped.length, hasMore: mapped.length === 20 });
        } else {
          set((state) => ({
            reels: [...state.reels, ...mapped],
            skip: state.skip + mapped.length,
            hasMore: mapped.length === 20,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch reels:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
