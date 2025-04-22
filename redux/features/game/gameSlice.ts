import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { tabCommunication } from "@/services/tab-communication"
import type { AppDispatch, RootState } from "@/redux/store"
import type { Position } from "@/redux/features/board/boardSlice"
import { moveToken } from "@/redux/features/board/boardSlice"

export type GameStatus = "waiting" | "color-selection" | "playing" | "finished"
export type PlayerColor = "red" | "green" | "yellow" | "blue"
export type ColorPair = "red-green" | "blue-yellow"

export interface Player {
  id: string
  address: string
  colors: PlayerColor[]
  isReady: boolean
  isWinner: boolean
  currentColor?: PlayerColor
  isCreator?: boolean
}

export interface GameState {
  gameId: string | null
  status: GameStatus
  players: Player[]
  currentPlayerIndex: number
  stakeAmount: number
  diceValue: number | null
  isDiceRolling: boolean
  winner: string | null
  isCreatingGame: boolean
  isJoiningGame: boolean
  selectedColorPair: ColorPair | null
  error: string | null
  lastRolledSix: boolean
  turnInProgress: boolean
  lastUpdated: number
}

const initialState: GameState = {
  gameId: null,
  status: "waiting",
  players: [],
  currentPlayerIndex: 0,
  stakeAmount: 0.1,
  diceValue: null,
  isDiceRolling: false,
  winner: null,
  isCreatingGame: false,
  isJoiningGame: false,
  selectedColorPair: null,
  error: null,
  lastRolledSix: false,
  turnInProgress: false,
  lastUpdated: Date.now(),
}

// Helper function to save game state to localStorage
const saveGameToStorage = (gameId: string, state: GameState) => {
  try {
    localStorage.setItem(`ludo_game_${gameId}`, JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save game state", e)
  }
}

// Helper function to load game state from localStorage
export const loadGameFromStorage = (gameId: string): GameState | null => {
  try {
    const savedState = localStorage.getItem(`ludo_game_${gameId}`)
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (e) {
    console.error("Failed to load game state", e)
  }
  return null
}

// Helper function to save board state to localStorage
const saveBoardToStorage = (gameId: string, boardState: any) => {
  try {
    localStorage.setItem(`ludo_board_${gameId}`, JSON.stringify(boardState))
  } catch (e) {
    console.error("Failed to save board state", e)
  }
}

// Helper function to load board state from localStorage
export const loadBoardFromStorage = (gameId: string): any | null => {
  try {
    const savedState = localStorage.getItem(`ludo_board_${gameId}`)
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (e) {
    console.error("Failed to load board state", e)
  }
  return null
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    createGame: (state) => {
      state.isCreatingGame = true
      state.error = null
      state.lastUpdated = Date.now()
    },
    createGameSuccess: (state, action: PayloadAction<{ gameId: string; player: Player }>) => {
      state.gameId = action.payload.gameId
      // Ensure the player is marked as creator
      const player = { ...action.payload.player, isCreator: true }
      state.players = [player]
      state.isCreatingGame = false
      state.status = "waiting"
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    createGameFailure: (state, action: PayloadAction<string>) => {
      state.isCreatingGame = false
      state.error = action.payload
      state.lastUpdated = Date.now()
    },
    joinGame: (state) => {
      state.isJoiningGame = true
      state.error = null
      state.lastUpdated = Date.now()
    },
    joinGameSuccess: (state, action: PayloadAction<{ gameId: string; player: Player }>) => {
      state.gameId = action.payload.gameId

      // Check if player already exists
      const playerExists = state.players.some((p) => p.id === action.payload.player.id)

      if (!playerExists) {
        // Make sure the joining player is not marked as creator
        const player = {
          ...action.payload.player,
          isCreator: action.payload.player.address === "0xComputer...Bot" ? false : action.payload.player.isCreator,
        }
        state.players.push(player)
      }

      state.isJoiningGame = false

      // If this is a computer game, go straight to color selection
      if (
        action.payload.player.address === "0xComputer...Bot" ||
        state.players.some((p) => p.address === "0xComputer...Bot")
      ) {
        state.status = "color-selection"
      } else if (state.players.length === 2) {
        // If both players have joined, move to color selection if not already there
        state.status = "color-selection"
      }

      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    joinGameFailure: (state, action: PayloadAction<string>) => {
      state.isJoiningGame = false
      state.error = action.payload
      state.lastUpdated = Date.now()
    },
    selectColorPair: (state, action: PayloadAction<{ playerId: string; colorPair: ColorPair }>) => {
      state.selectedColorPair = action.payload.colorPair

      // Find the player who selected colors
      const playerIndex = state.players.findIndex((p) => p.id === action.payload.playerId)
      if (playerIndex !== -1) {
        // Assign colors to the player who made the selection
        if (action.payload.colorPair === "red-green") {
          state.players[playerIndex].colors = ["red", "green"]
          state.players[playerIndex].currentColor = "red"
        } else {
          state.players[playerIndex].colors = ["blue", "yellow"]
          state.players[playerIndex].currentColor = "blue"
        }

        // If there's another player, assign the opposite colors
        const otherPlayerIndex = state.players.findIndex((p) => p.id !== action.payload.playerId)
        if (otherPlayerIndex !== -1) {
          if (action.payload.colorPair === "red-green") {
            state.players[otherPlayerIndex].colors = ["blue", "yellow"]
            state.players[otherPlayerIndex].currentColor = "blue"
          } else {
            state.players[otherPlayerIndex].colors = ["red", "green"]
            state.players[otherPlayerIndex].currentColor = "red"
          }
        }

        // If both players have colors assigned, we can start the game
        if (state.players.length === 2 && state.players[0].colors.length > 0 && state.players[1].colors.length > 0) {
          state.status = "playing"
        }
      }

      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    startGame: (state) => {
      state.status = "playing"
      state.currentPlayerIndex = 0
      state.turnInProgress = false
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    rollDice: (state) => {
      state.isDiceRolling = true
      state.turnInProgress = true
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    setDiceValue: (state, action: PayloadAction<number | null>) => {
      state.diceValue = action.payload
      state.isDiceRolling = false
      state.lastRolledSix = action.payload === 6
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    nextTurn: (state) => {
      // Only change player if they didn't roll a 6
      // or if they rolled a 6 but already moved (diceValue is null)
      if (!state.lastRolledSix || state.diceValue === null) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
        state.lastRolledSix = false
      }

      // Reset dice value and turn state
      state.diceValue = null
      state.turnInProgress = false
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    endGame: (state, action: PayloadAction<string>) => {
      state.status = "finished"
      state.winner = action.payload
      const winnerIndex = state.players.findIndex((p) => p.id === action.payload)
      if (winnerIndex !== -1) {
        state.players[winnerIndex].isWinner = true
      }
      state.lastUpdated = Date.now()

      // Save to localStorage
      if (state.gameId) {
        saveGameToStorage(state.gameId, state as GameState)
      }
    },
    resetGame: () => initialState,
    // Add action to update game state from another tab
    updateGameState: (state, action: PayloadAction<GameState>) => {
      // Only update if the incoming state is newer
      if (action.payload.lastUpdated > state.lastUpdated) {
        return { ...action.payload }
      }
      return state
    },
    // Load game state from localStorage
    loadGameState: (state, action: PayloadAction<string>) => {
      const savedState = loadGameFromStorage(action.payload)
      if (savedState) {
        return savedState
      }
      return state
    },
  },
})

export const {
  createGame,
  createGameSuccess,
  createGameFailure,
  joinGame,
  joinGameSuccess,
  joinGameFailure,
  selectColorPair,
  startGame,
  rollDice,
  setDiceValue,
  nextTurn,
  endGame,
  resetGame,
  updateGameState,
  loadGameState,
} = gameSlice.actions

// Thunks for actions that need to broadcast to other tabs
export const createGameAndBroadcast = (gameData: { gameId: string; player: Player }) => (dispatch: AppDispatch) => {
  dispatch(createGameSuccess(gameData))

  // Broadcast to other tabs
  tabCommunication.sendMessage({
    type: "GAME_CREATED",
    payload: {
      gameId: gameData.gameId,
      creator: gameData.player.address,
    },
  })
}

export const joinGameAndBroadcast = (gameData: { gameId: string; player: Player }) => (dispatch: AppDispatch) => {
  dispatch(joinGameSuccess(gameData))

  // Broadcast to other tabs
  tabCommunication.sendMessage({
    type: "PLAYER_JOINED",
    payload: {
      gameId: gameData.gameId,
      player: gameData.player,
    },
  })
}

export const selectColorPairAndBroadcast =
  (data: { playerId: string; colorPair: ColorPair }) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(selectColorPair(data))

    const gameId = getState().game.gameId
    if (gameId) {
      // Broadcast to other tabs
      tabCommunication.sendMessage({
        type: "COLOR_SELECTED",
        payload: {
          gameId,
          playerId: data.playerId,
          colorPair: data.colorPair,
        },
      })
    }
  }

export const startGameAndBroadcast = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(startGame())

  const gameId = getState().game.gameId
  if (gameId) {
    // Broadcast to other tabs
    tabCommunication.sendMessage({
      type: "GAME_STARTED",
      payload: { gameId },
    })
  }
}

export const rollDiceAndBroadcast = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(rollDice())

  const gameId = getState().game.gameId
  if (gameId) {
    // Broadcast to other tabs
    tabCommunication.sendMessage({
      type: "DICE_ROLLED",
      payload: {
        gameId,
        value: 0, // We'll update this with the actual value later
      },
    })
  }
}

export const setDiceValueAndBroadcast =
  (value: number | null) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setDiceValue(value))

    const gameId = getState().game.gameId
    if (gameId) {
      // Broadcast to other tabs
      tabCommunication.sendMessage({
        type: "DICE_ROLLED",
        payload: {
          gameId,
          value: value || 0,
        },
      })
    }
  }

export const nextTurnAndBroadcast = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(nextTurn())

  const gameId = getState().game.gameId
  if (gameId) {
    // Broadcast to other tabs
    tabCommunication.sendMessage({
      type: "TURN_ENDED",
      payload: { gameId },
    })
  }
}

export const endGameAndBroadcast = (winnerId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(endGame(winnerId))

  const gameId = getState().game.gameId
  if (gameId) {
    // Broadcast to other tabs
    tabCommunication.sendMessage({
      type: "GAME_ENDED",
      payload: {
        gameId,
        winner: winnerId,
      },
    })
  }
}

// New thunk for moving tokens with broadcasting
export const moveTokenAndBroadcast =
  (data: { tokenId: string; position: Position; steps: number; inHomePath?: boolean }) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    // First, move the token locally
    dispatch(moveToken(data))

    // Get the current game ID
    const gameId = getState().game.gameId
    if (gameId) {
      // Save the current board state to localStorage
      const boardState = getState().board
      saveBoardToStorage(gameId, boardState)

      // Broadcast the token move to other tabs
      tabCommunication.sendMessage({
        type: "TOKEN_MOVED",
        payload: {
          gameId,
          tokenId: data.tokenId,
          position: data.position,
          steps: data.steps,
          inHomePath: data.inHomePath,
        },
      })
    }
  }

export default gameSlice.reducer
