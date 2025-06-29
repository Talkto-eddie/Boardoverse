import { create } from "zustand";
import { socketManager, GameState as GameStateFromServer  } from "@/lib/socket-manager";
import { useSocketStore } from "@/store/SocketStore";
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
  joinGame: (gameId: string) => Promise<void>;
  createGame: (vsComputer: boolean) => Promise<void>;
  updateGameState: (state: GameState) => void;
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
  // Join a game
  joinGame: async (gameId: string) => {
    const { isConnected } = useSocketStore.getState();

    if (!isConnected) {
      throw new Error("Not connected to server");
    }

    try {
      const response = await socketManager.joinGame(gameId);
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
  createGame: async (vsComputer: boolean) => {
    const { isConnected } = useSocketStore.getState();

    if (!isConnected) {
      throw new Error("Not connected to server");
    }

    try {
      const response = await socketManager.createGame(vsComputer);
      set({
        gameId: response.gameId,
        players: [{ address: response.playerId, colors: response.colors }],
        status: "waiting",
      });
    } catch (error) {
      console.error("Failed to create game:", error);
      throw error;
    }
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