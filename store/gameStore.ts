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
  loadCompleteGameState: (gameId: string) => Promise<void>;
  createGame: (vsComputer: boolean, stakeAmount?: number) => Promise<void>;
  cancelGame: () => Promise<void>;
  updateGameState: (state: GameStateFromServer) => void;
  setGameMetadata: (metadata: { stakeAmount?: number; vsComputer?: boolean; createdAt?: string; startedAt?: string; finishedAt?: string; winnerWallet?: string }) => void;
  setTokens: (tokens: TokenState[]) => void;
  setDice: (dice: number[]) => void;
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
      
      // After joining, load the complete game state
      await get().loadCompleteGameState(gameId);
    } catch (error) {
      console.error("Failed to join game:", error);
      throw error;
    }
  },

  // Load complete game state
  loadCompleteGameState: async (gameId: string) => {
    const { walletAddress } = useUserStore.getState();

    if (!walletAddress) {
      throw new Error("User not connected");
    }

    try {
      const gameState = await supabaseGameManager.getCompleteGameState(gameId, walletAddress);
      
      // Transform players data to match our interface
      const players = gameState.players.map((p: any) => ({
        address: p.player_wallet,
        colors: p.colors
      }));

      set({
        gameId: gameId,
        players: players,
        status: gameState.game.status === 'waiting' ? 'waiting' : 'playing',
        tokens: gameState.gameState?.tokens || [],
        dice: gameState.gameState?.dice || [],
        myTurn: gameState.isMyTurn,
        currentPlayerIndex: gameState.currentPlayerIndex,
        winner: gameState.gameState?.winner || null,
        gameOver: gameState.gameState?.game_over || false,
        // Set metadata
        stakeAmount: gameState.game.stake_amount || 0,
        vsComputer: gameState.game.vs_computer || false,
        createdAt: gameState.game.created_at,
        startedAt: gameState.game.started_at,
        finishedAt: gameState.game.finished_at,
        winnerWallet: gameState.game.winner_wallet,
      });

      console.log('Complete game state loaded:', {
        players: players.length,
        currentPlayer: gameState.currentPlayerIndex,
        isMyTurn: gameState.isMyTurn,
        status: gameState.game.status
      });
    } catch (error) {
      console.error("Failed to load complete game state:", error);
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

  // Cancel the current game
  cancelGame: async () => {
    const { walletAddress } = useUserStore.getState();
    const currentState = get();

    if (!walletAddress || !currentState.gameId) {
      throw new Error("No active game to cancel");
    }

    try {
      // Check if user is the game creator (first player)
      const isCreator = currentState.players.length > 0 && currentState.players[0]?.address === walletAddress;
      
      if (isCreator || currentState.status === 'waiting') {
        // Cancel the entire game
        await supabaseGameManager.cancelGame(currentState.gameId, walletAddress);
      } else {
        // Just leave the game
        await supabaseGameManager.leaveGame(currentState.gameId, walletAddress);
      }
      
      // Update local state to reflect cancellation
      set({
        status: "finished",
        gameOver: true,
        winner: null,
        finishedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to cancel game:", error);
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

    set({
      ...currentState,
      ...newState,
      // Preserve certain fields from current state if not provided in newState
      gameId: currentState.gameId,
      players: currentState.players,
      status: currentState.status,
      stakeAmount: currentState.stakeAmount,
      vsComputer: currentState.vsComputer,
      createdAt: currentState.createdAt,
      startedAt: currentState.startedAt,
      finishedAt: currentState.finishedAt,
      winnerWallet: currentState.winnerWallet,
      selectedToken: currentState.selectedToken,
      // Override specific fields from newState
      tokens: newState.tokens || currentState.tokens,
      dice: newState.dice || currentState.dice,
      myTurn: newState.myTurn ?? currentState.myTurn,
      winner: newState.winner !== null ? newState.winner : currentState.winner,
      gameOver: newState.gameOver ?? currentState.gameOver,
      currentPlayerIndex: currentState.currentPlayerIndex >= 0 ? currentState.currentPlayerIndex : 0,
    });
  },

  setTokens: (tokens: TokenState[]) => {
    set({ tokens });
  },

  setDice: (dice: number[]) => {
    set({ dice });
  },

  selectToken: (tokenId: string) => {
    const foundToken = get().tokens.find((token) => token.id === tokenId) || null;
    set({ selectedToken: foundToken });
  },
}));