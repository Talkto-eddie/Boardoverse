import { create } from "zustand";
import { supabaseGameManager } from "@/lib/supabase-game-manager";
import { useUserStore } from "@/store/userStore";
interface GameStateFromServer {
  tokens: TokenState[];
  dice: number[];
  myTurn: boolean;
  gameOver: boolean;
  winner: number | null;
  currentPlayerWallet?: string;
  turnStartTime?: string;
}

interface GameState {
  gameId: string | null;
  players: { address: string; colors: string[] }[];
  status: "waiting" | "playing" | "finished";
  tokens: TokenState[];
  selectedToken: TokenState | null;
  dice: number[];
  myTurn: boolean;
  winner: number | null;
  currentPlayerIndex: number;
  gameOver: boolean;
  // Additional game metadata
  stakeAmount: number;
  vsComputer: boolean;
  createdAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  winnerWallet: string | null;
  joinGame: (gameId: string) => Promise<void>;
  createGame: (vsComputer: boolean, stakeAmount?: number) => Promise<void>;
  updateGameState: (state: GameStateFromServer) => void;
  setGameMetadata: (metadata: { stakeAmount?: number; vsComputer?: boolean; createdAt?: string; startedAt?: string; finishedAt?: string; winnerWallet?: string }) => void;
  setTokens: (tokens: TokenState[]) => void;
  selectToken: (tokenId: string) => void;
}

interface TokenState {
  id: string; // Format "COLOR-INDEX" (e.g., "RED-0")
  color: string; // 'RED', 'GREEN', 'YELLOW', 'BLUE'
  x: number; // Current x-coordinate
  y: number; // Current y-coordinate
  position: number; // Internal position index
  index: number; // Token index (0-3)
  isClickable: boolean; // True if token can be moved
}

export const useGameStore = create<GameState>((set, get) => ({
  gameId: null,
  players: [],
  status: "waiting",
  tokens: [],
  selectedToken: null,
  dice: [],
  myTurn: false,
  winner: null,
  currentPlayerIndex: 0,
  gameOver: false,
  // Additional game metadata
  stakeAmount: 0,
  vsComputer: false,
  createdAt: null,
  startedAt: null,
  finishedAt: null,
  winnerWallet: null, 
  // Join a game
  joinGame: async (gameId: string) => {
    const { userData, walletAddress } = useUserStore.getState();

    if (!userData || !walletAddress) {
      throw new Error("User not connected");
    }

    try {
      const response = await supabaseGameManager.joinGame(gameId, walletAddress);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set((state) => ({
        gameId: response.gameId,
        players: [...state.players, { address: response.playerId, colors: response.colors }],
        status: "playing",
      }));
    } catch (error) {
      console.error("Failed to join game:", error);
      throw error;
    }
  },

  // Create a game
  createGame: async (vsComputer: boolean, stakeAmount: number = 0) => {
    const { userData, walletAddress } = useUserStore.getState();

    if (!userData || !walletAddress) {
      throw new Error("User not connected");
    }

    try {
      const response = await supabaseGameManager.createGame(vsComputer, walletAddress, stakeAmount);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        gameId: response.gameId,
        players: [{ address: response.playerId, colors: response.colors }],
        status: "waiting",
        stakeAmount: stakeAmount,
        vsComputer: vsComputer,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to create game:", error);
      throw error;
    }
  },

  setGameMetadata: (metadata) => {
    set((state) => ({
      ...state,
      stakeAmount: metadata.stakeAmount ?? state.stakeAmount,
      vsComputer: metadata.vsComputer ?? state.vsComputer,
      createdAt: metadata.createdAt ?? state.createdAt,
      startedAt: metadata.startedAt ?? state.startedAt,
      finishedAt: metadata.finishedAt ?? state.finishedAt,
      winnerWallet: metadata.winnerWallet ?? state.winnerWallet,
    }));
  },
  updateGameState: (newState: GameStateFromServer) => {
    const currentState = get();

    const currentPlayerIndex = currentState.currentPlayerIndex;

    set({
      ...newState,
      ...currentState,
      winner: newState.winner !== null ? newState.winner : null,
      currentPlayerIndex: currentPlayerIndex >= 0 ? currentPlayerIndex : 0, 
    });
  },

  setTokens: (tokens: TokenState[]) => {
    set({ tokens });
  },


  selectToken: (tokenId: string) => {
    const foundToken = get().tokens.find((token) => token.id === tokenId) || null;
    set({ selectedToken: foundToken });
  },
}));