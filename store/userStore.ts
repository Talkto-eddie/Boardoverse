import { create } from "zustand";

interface UserState {
  user: string | null;
  isConnecting: boolean;
  connected: boolean;
  setUser: (user: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isConnecting: false,
  connected: false,

  setUser: (user: string | null) =>
    set({ 
      user,
      connected: !!user,
      isConnecting: false,
    }),

  setConnecting: (connecting) => set({ isConnecting: connecting }),

  disconnect: () =>
    set({
      user: null,
      connected: false,
      isConnecting: false,
    }),
}));