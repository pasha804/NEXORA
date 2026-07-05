import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Community {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  theme_color: string;
  privacy: string;
  tags: string[];
  member_count: number;
  is_verified: boolean;
  created_at: string;
}

interface CommunityStore {
  joined: Community[];
  discover: Community[];
  loading: boolean;
  fetchJoined: () => Promise<void>;
  fetchDiscover: () => Promise<void>;
  joinCommunity: (slug: string) => Promise<boolean>;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  joined: [],
  discover: [],
  loading: false,

  fetchJoined: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const resp = await fetch(`${API_URL}/communities/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        set({ joined: await resp.json() });
      }
    } catch (err) {
      console.error('Failed to fetch joined communities:', err);
    }
  },

  fetchDiscover: async () => {
    try {
      const resp = await fetch(`${API_URL}/communities/discover`);
      if (resp.ok) {
        set({ discover: await resp.json() });
      }
    } catch (err) {
      console.error('Failed to fetch discover communities:', err);
    }
  },

  joinCommunity: async (slug: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const resp = await fetch(`${API_URL}/communities/${slug}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        get().fetchJoined();
        return true;
      }
    } catch (err) {
      console.error('Failed to join community:', err);
    }
    return false;
  },
}));
