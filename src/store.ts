import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MusicItem } from './types'

interface FavoritesState {
  favoriteIds: number[]
  toggleFavorite: (id: number) => void
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteIds: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
            : [...state.favoriteIds, id],
        })),
    }),
    { name: 'collective-favorites' },
  ),
)

interface PlayerState {
  currentTrack: MusicItem | any | null;
  isPlaying: boolean;
  queue: any[]; 
  playTrack: (track: any, queue?: any[]) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  clearTrack: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  
  playTrack: (track, queue) => set((state) => {
    const newQueue = queue && queue.length > 0 ? queue : state.queue;
    return {
      currentTrack: track,
      isPlaying: true,
      queue: newQueue
    };
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  pauseTrack: () => set({ isPlaying: false }),
  clearTrack: () => set({ currentTrack: null, isPlaying: false, queue: [] }),
  
  playNext: () => set((state) => {
    if (state.queue.length === 0 || !state.currentTrack) return state;
    const currentId = state.currentTrack.trackId || state.currentTrack.id;
    const currentIndex = state.queue.findIndex(t => (t.trackId || t.id) === currentId);
    
    if (currentIndex === -1 || currentIndex === state.queue.length - 1) {
      return { currentTrack: state.queue[0], isPlaying: true };
    }
    return { currentTrack: state.queue[currentIndex + 1], isPlaying: true };
  }),

  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || !state.currentTrack) return state;
    const currentId = state.currentTrack.trackId || state.currentTrack.id;
    const currentIndex = state.queue.findIndex(t => (t.trackId || t.id) === currentId);
    
    if (currentIndex <= 0) {
      return { currentTrack: state.queue[state.queue.length - 1], isPlaying: true }; 
    }
    return { currentTrack: state.queue[currentIndex - 1], isPlaying: true };
  }),
}))