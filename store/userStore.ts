import { useWallet } from "@solana/wallet-adapter-react";
import { create } from "zustand";

interface UserData {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: string | null;
  userData: UserData | null;
  walletAddress: string | null;
  isConnecting: boolean;
  connected: boolean;
  setUser: (user: string | null) => void;
  setUserData: (userData: UserData | null) => void;
  setWalletAddress: (address: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userData: null,
  walletAddress: null,
  isConnecting: false,
  connected: false,

  setUser: (user: string | null) =>
    set({ 
      user,
      connected: !!user,
      isConnecting: false,
    }),

  setUserData: (userData: UserData | null) =>
    set({ 
      userData,
      connected: !!userData,
    }),

  setWalletAddress: (address: string | null) =>
    set({ 
      walletAddress: address,
    }),

  setConnecting: (connecting) => set({ isConnecting: connecting }),

  clear: () =>{
    set({
      user: null,
      userData: null,
      walletAddress: null,
      connected: false,
      isConnecting: false,
    });
    
  }
    ,
}));